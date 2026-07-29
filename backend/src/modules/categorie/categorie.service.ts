// src/modules/categorie/categorie.service.ts
import { categorieRepository } from "./categorie.repository";
import { logAudit } from "../../lib/audit";
import { prisma } from "../../lib/prisma";
import { CreateCategorieDto, UpdateCategorieDto, CategorieQueryDto } from "./categorie.schema";

/**
 * Résout automatiquement l'activité d'une catégorie à partir de sa marque.
 * Cherche dans la table `activite_marques` la première activité liée à cette marque.
 * Retourne l'id_activite trouvé, ou null si aucune liaison n'existe.
 *
 * Cela permet que les catégories Fertivert → fertilisation,
 * Matar → irrigation, Baddar/Elorn/Caussade → semences-et-plants, etc.
 * soient attribuées automatiquement sans intervention manuelle.
 */
async function resolveActiviteFromMarque(id_marque: number): Promise<number | null> {
  const liaison = await (prisma as any).activiteMarque.findFirst({
    where:   { id_marque },
    orderBy: { ordre: "asc" },
    select:  { id_activite: true },
  });
  return liaison?.id_activite ?? null;
}

/**
 * Valide les parents secondaires (parent_ids_extra) : ils doivent exister,
 * ne pas être la catégorie elle-même, et ne pas être un de ses descendants
 * (ce qui créerait un cycle dans l'arbre affiché).
 */
async function assertValidExtraParents(id_categorie: number | null, parent_ids_extra: number[] | undefined) {
  if (!parent_ids_extra || parent_ids_extra.length === 0) return;

  const all = await categorieRepository.findAll({} as any);
  const byId = new Map(all.map((c: any) => [c.id_categorie, c]));

  for (const pid of parent_ids_extra) {
    if (id_categorie !== null && pid === id_categorie) {
      throw { status: 422, message: "Une catégorie ne peut pas être son propre parent secondaire." };
    }
    if (!byId.has(pid)) {
      throw { status: 404, message: `Catégorie parente secondaire introuvable (id ${pid}).` };
    }
  }

  if (id_categorie === null) return; // création : pas encore de descendants possibles

  // Empêche de choisir un descendant (via parent_id) comme parent secondaire → cycle.
  const descendants = new Set<number>();
  const collect = (pid: number) => {
    all.forEach((c: any) => {
      if (c.parent_id === pid && !descendants.has(c.id_categorie)) {
        descendants.add(c.id_categorie);
        collect(c.id_categorie);
      }
    });
  };
  collect(id_categorie);

  for (const pid of parent_ids_extra) {
    if (descendants.has(pid)) {
      throw { status: 422, message: "Un parent secondaire ne peut pas être une sous-catégorie de cette catégorie (cycle)." };
    }
  }
}

export const categorieService = {

  async listPublic(params: CategorieQueryDto) {
    return categorieRepository.findAllPublic(params);
  },

  async list(params: CategorieQueryDto) {
    return categorieRepository.findAll(params);
  },

  async getById(id: number) {
    const c = await categorieRepository.findById(id);
    if (!c) throw { status: 404, message: "Catégorie introuvable" };
    return c;
  },

  /** Retourne l'arbre complet Marque → Catégories → Produits */
  async getTreeByMarqueSlug(slug: string) {
    const tree = await categorieRepository.findTreeByMarqueSlug(slug);
    if (!tree) throw { status: 404, message: "Marque introuvable" };
    return tree;
  },

  /**
   * Vérifie qu'une catégorie est bien un nœud feuille (pas de sous-catégories).
   * Utilisé par le module Produit avant d'attacher un produit.
   */
  async assertIsLeaf(id_categorie: number) {
    const isLeaf = await categorieRepository.isLeaf(id_categorie);
    if (!isLeaf) {
      throw {
        status: 422,
        message: "Un produit ne peut être attaché qu'à une catégorie feuille (sans sous-catégories).",
      };
    }
  },

  async create(data: CreateCategorieDto, id_admin: number) {
    // Vérifier que le parent existe si fourni
    if (data.parent_id) {
      const parent = await categorieRepository.findById(data.parent_id);
      if (!parent) throw { status: 404, message: "Catégorie parente introuvable" };
    }

    const existing = await categorieRepository.findBySlug(data.slug);
    if (existing) throw { status: 409, message: "Ce slug est déjà utilisé" };

    await assertValidExtraParents(null, data.parent_ids_extra);

    // Résolution automatique de l'activité depuis la marque
    // si id_activite n'est pas explicitement fourni mais qu'une marque est liée
    if (!data.id_activite && data.id_marque) {
      const resolved = await resolveActiviteFromMarque(data.id_marque);
      if (resolved) data = { ...data, id_activite: resolved };
    }

    const cat = await categorieRepository.create(data);
    await logAudit({
      id_admin,
      action: "CREATE",
      entity_name: "categorie",
      entity_id: cat.id_categorie,
      detail: { nom: data.nom, parent_id: data.parent_id ?? null },
    });
    return cat;
  },

  async update(id: number, data: UpdateCategorieDto, id_admin: number) {
    const before = await categorieService.getById(id);

    // Empêcher un cycle : une catégorie ne peut pas devenir son propre ancêtre
    if (data.parent_id !== undefined && data.parent_id === id) {
      throw { status: 422, message: "Une catégorie ne peut pas être son propre parent." };
    }

    await assertValidExtraParents(id, data.parent_ids_extra);

    // Résolution automatique de l'activité si on change la marque sans préciser l'activité
    const targetMarque = data.id_marque ?? (before as any).id_marque;
    if (!data.id_activite && !(before as any).id_activite && targetMarque) {
      const resolved = await resolveActiviteFromMarque(targetMarque);
      if (resolved) data = { ...data, id_activite: resolved };
    }

    const cat = await categorieRepository.update(id, data);
    await logAudit({
      id_admin,
      action: "UPDATE",
      entity_name: "categorie",
      entity_id: id,
      detail: { before: { nom: before.nom }, after: { nom: data.nom } },
    });
    return cat;
  },

  /**
   * Retourne le nombre de sous-catégories et de produits qui seront supprimés
   * en cascade — à afficher dans la modale de confirmation côté admin.
   */
  async getDeleteImpact(id: number) {
    const cat = await categorieService.getById(id);

    // Collecte récursive de tous les descendants
    async function countDescendants(parentId: number): Promise<{ cats: number; produits: number }> {
      const children = await categorieRepository.findAll({ } as any).then(
        (all: any[]) => all.filter((c: any) => c.parent_id === parentId)
      );
      let cats = children.length;
      let produits = children.reduce((sum: number, c: any) => sum + (c._count?.produits ?? 0), 0);
      for (const child of children) {
        const sub = await countDescendants(child.id_categorie);
        cats    += sub.cats;
        produits += sub.produits;
      }
      return { cats, produits };
    }

    const { cats: sous_cats, produits: produits_sous_cats } = await countDescendants(id);

    return {
      id_categorie:          cat.id_categorie,
      nom:                   cat.nom,
      produits_directs:      cat._count?.produits ?? 0,
      sous_categories:       sous_cats,
      produits_sous_cats,
      total_produits:        (cat._count?.produits ?? 0) + produits_sous_cats,
    };
  },

  async delete(id: number, id_admin: number) {
    const before = await categorieService.getById(id);

    // Collecte des statistiques d'impact pour l'audit
    const nbSousCats = before._count?.sous_cats ?? 0;
    const nbProduits = before._count?.produits  ?? 0;

    // Suppression récursive (produits supprimés avant chaque nœud pour lever Restrict)
    await categorieRepository.delete(id);

    await logAudit({
      id_admin,
      action: "DELETE",
      entity_name: "categorie",
      entity_id: id,
      detail: {
        snapshot: {
          nom:         before.nom,
          slug:        before.slug,
          id_marque:   before.id_marque,
          id_activite: before.id_activite,
          parent_id:   before.parent_id,
        },
        impact: {
          sous_cats_supprimees: nbSousCats,
          produits_supprimes:   nbProduits,
        },
      },
    });
  },
};