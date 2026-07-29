// src/modules/categorie/categorie.repository.ts
// Remplace l'ancienne version — même interface publique, nouvelles fonctions d'arbre.
import { prisma } from "../../lib/prisma";
import { CategorieQueryDto, CreateCategorieDto, UpdateCategorieDto } from "./categorie.schema";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Nœud "plat" retourné par Prisma avant construction de l'arbre */
type CatFlat = {
  id_categorie: number;
  nom: string;
  slug: string;
  description: string | null;
  translations?: unknown;
  image: string | null;
  id_marque: number | null;
  id_activite: number | null;
  parent_id: number | null;
  parent_ids_extra?: number[];
  ordre: number;
  actif: boolean;
  created_at: Date;
  [key: string]: unknown;
};

/** Nœud enrichi utilisé dans l'arbre renvoyé aux clients */
export type CatNode = CatFlat & { sous_cats: CatNode[] };

/** Aplati `parents_extra: {id_parent}[]` (issu de Prisma) en `parent_ids_extra: number[]` */
function withParentIdsExtra<T extends { parents_extra?: { id_parent: number }[] }>(row: T) {
  const { parents_extra, ...rest } = row as any;
  return { ...rest, parent_ids_extra: (parents_extra ?? []).map((p: any) => p.id_parent) };
}

// ─── Utilitaire buildTree (O(n)) ─────────────────────────────────────────────
//
// STRATÉGIE ANTI N+1 :
//   On charge TOUTES les catégories d'une marque en UNE seule requête SQL,
//   puis on reconstitue l'arbre en mémoire avec une Map.
//   → 1 query quelle que soit la profondeur de l'arbre.
//
//   Alternative (Prisma include imbriqué) : simple à écrire mais génère
//   autant de requêtes que de niveaux × nœuds → à éviter en production.

function buildTree(flat: CatFlat[]): CatNode[] {
  const map = new Map<number, CatNode>();
  flat.forEach(c => map.set(c.id_categorie, { ...c, sous_cats: [] }));

  const roots: CatNode[] = [];
  map.forEach(node => {
    if (node.parent_id !== null && map.has(node.parent_id)) {
      const parent = map.get(node.parent_id);
      if (parent) parent.sous_cats.push(node);
    } else {
      roots.push(node);
    }
  });

  // Rattachements secondaires (additifs) : un nœud peut en plus apparaître
  // sous d'autres parents que son parent_id principal. On ne le retire pas
  // de son emplacement principal — il est simplement dupliqué (même id)
  // dans les sous_cats du/des parent(s) secondaire(s) qui existent dans
  // ce même jeu de données.
  map.forEach(node => {
    (node.parent_ids_extra ?? []).forEach(extraParentId => {
      if (extraParentId === node.id_categorie) return; // garde-fou anti auto-référence
      const extraParent = map.get(extraParentId);
      if (extraParent && !extraParent.sous_cats.includes(node)) {
        extraParent.sous_cats.push(node);
      }
    });
  });

  // Tri récursif par ordre à chaque niveau. `ancestors` protège contre un
  // cycle accidentel introduit par un rattachement secondaire mal choisi
  // dans l'admin (ex. parent secondaire = un de ses propres descendants).
  function sortNodesByOrder(nodesList: CatNode[], ancestors: Set<number> = new Set()): CatNode[] {
    return nodesList
      .sort((first, second) => first.ordre - second.ordre)
      .map(node => {
        if (ancestors.has(node.id_categorie)) return { ...node, sous_cats: [] };
        return {
          ...node,
          sous_cats: sortNodesByOrder(node.sous_cats, new Set(ancestors).add(node.id_categorie)),
        };
      });
  }

  return sortNodesByOrder(roots);
}

async function collectCategorieIdsByMarque(id_marque: number) {
  const allCats = await prisma.categorie.findMany({
    where: { actif: true },
    select: { id_categorie: true, parent_id: true, id_marque: true },
  });
  const roots = allCats.filter(c => c.id_marque === id_marque).map(c => c.id_categorie);
  const collected = new Set<number>();
  const collect = (id: number) => {
    if (collected.has(id)) return;
    collected.add(id);
    allCats.filter(c => c.parent_id === id).forEach(c => collect(c.id_categorie));
  };
  roots.forEach(collect);
  return [...collected];
}

// ─── Sélecteur partagé ───────────────────────────────────────────────────────

const catSelect = {
  id_categorie: true,
  nom:          true,
  slug:         true,
  description:  true,
  translations: true,
  image:        true,
  id_marque:    true,
  id_activite:  true,
  parent_id:    true,
  ordre:        true,
  actif:        true,
  created_at:   true,
  parents_extra: { select: { id_parent: true } },
} as const;

// ─── Repository ──────────────────────────────────────────────────────────────

export const categorieRepository = {

  // ── PUBLIC ─────────────────────────────────────────────────────────────────

  /** Liste publique (actif:true). Si tree=true → arbre imbriqué. */
  async findAllPublic(params: CategorieQueryDto) {
    const where: Record<string, unknown> = { actif: true };
    if (params.id_marque)   where.id_marque   = params.id_marque;
    if (params.id_activite) where.id_activite = params.id_activite;

    const rows = await prisma.categorie.findMany({
      where,
      orderBy: [{ ordre: "asc" }, { nom: "asc" }],
      select: {
        ...catSelect,
        marque:   { select: { nom: true, slug: true, translations: true } },
        activite: { select: { nom: true, slug: true, translations: true } },
        _count:   { select: { produits: true } },
      },
    });

    // Si filtrage par activité : inclure aussi les sous-catégories profondes
    // dont id_activite est null mais dont l'ancêtre a id_activite = params.id_activite
    if (params.id_activite && rows.length > 0) {
      const directIds = new Set<number>(rows.map(r => Number(r.id_categorie)));
      const allFlat = await prisma.categorie.findMany({
        where:   { actif: true },
        orderBy: [{ ordre: "asc" }, { nom: "asc" }],
        select:  {
          ...catSelect,
          marque:   { select: { nom: true, slug: true, translations: true } },
          activite: { select: { nom: true, slug: true, translations: true } },
          _count:   { select: { produits: true } },
        },
      });
      // Collecter récursivement les descendants
      function collectDescendants(parentId: number): typeof allFlat {
        const children = allFlat.filter(c => (c as any).parent_id === parentId && !directIds.has(c.id_categorie as any));
        const allDescendants = children.flatMap(c => collectDescendants(Number((c as any).id_categorie)));
        return [...children, ...allDescendants];
      }
      const descendants = [...directIds].flatMap(id => collectDescendants(id));
      descendants.forEach(d => { if (!directIds.has((d as any).id_categorie)) { (rows as any[]).push(d); directIds.add((d as any).id_categorie); } });
      (rows as any[]).sort((a: any, b: any) => (a.ordre - b.ordre) || a.nom.localeCompare(b.nom, "fr"));
    }

    const normalized = (rows as any[]).map(withParentIdsExtra);
    return params.tree ? buildTree(normalized as unknown as CatFlat[]) : normalized;
  },

  // ── ARBRE COMPLET D'UNE MARQUE ─────────────────────────────────────────────
  //
  // Endpoint dédié : GET /api/public/marques/:slug/tree
  // Retourne l'arbre Marque → Catégories → Sous-cats… → Produits (feuilles).
  //
  // 2 requêtes SQL au total :
  //   1. Charger toutes les catégories de la marque
  //   2. Charger tous les produits de la marque
  // Puis assemblage en mémoire.

  async findTreeByMarqueSlug(slug: string) {
    // 1. Vérifier que la marque existe
    const marque = await prisma.marque.findUnique({
      where:  { slug },
      select: { id_marque: true, nom: true, slug: true, logo: true, description: true, translations: true },
    });
    if (!marque) return null;

    // 2. Tous les produits de la marque via categorie → marque.
    const marqueCatIds = await collectCategorieIdsByMarque(marque.id_marque);
    const produits = await prisma.produit.findMany({
      where:   { id_categorie: marqueCatIds.length > 0 ? { in: marqueCatIds } : -1, actif: true },
      orderBy: [{ ordre: "asc" }, { nom: "asc" }],
      select: {
        id_produit:   true,
        nom:          true,
        slug:         true,
        description:  true,
        translations: true,
        id_categorie: true,
        division:     true,
        tags:         true,
        ordre:        true,
        categorie:    {
          select: {
            id_activite: true,
            activite: { select: { nom: true, slug: true, translations: true } },
            marque: { select: { nom: true, slug: true, logo: true, translations: true } },
          },
        },
        images: {
          orderBy: [{ is_principale: "desc" }, { ordre: "asc" }],
          take:    1,
          select:  { url: true, alt: true },
        },
      },
    });

    // 3. Toutes les catégories pertinentes pour la marque
    //    → inclure les catégories dont id_marque = marque.id_marque
    //      ET/OU les catégories référencées par les produits de la marque
    const produitCatIds = Array.from(new Set(produits.map(p => p.id_categorie).filter(Boolean)));
    const categories = await prisma.categorie.findMany({
      where: {
        actif: true,
        OR: [
          { id_marque: marque.id_marque },
          produitCatIds.length > 0 ? { id_categorie: { in: produitCatIds } } : undefined,
        ].filter(Boolean) as any,
      },
      orderBy: [{ ordre: "asc" }, { nom: "asc" }],
      select: catSelect,
    });

    // Normaliser : exposer activite et id_activite au niveau produit (depuis categorie)
    const produitsNormalized = produits.map(p => ({
      ...p,
      id_activite: p.categorie?.id_activite ?? null,
      activite:    p.categorie?.activite    ?? null,
      marque:      p.categorie?.marque      ?? null,
    }));

    // 4. Construire l'arbre de catégories
    const tree = buildTree(categories as unknown as CatFlat[]);

    // 5. Injecter les produits dans les nœuds-feuilles correspondants
    const produitsByCategorie = new Map<number, typeof produitsNormalized>();
    produitsNormalized.forEach(p => {
      const list = produitsByCategorie.get(p.id_categorie) ?? [];
      list.push(p);
      produitsByCategorie.set(p.id_categorie, list);
    });

    function attachProductsToNodes(nodesList: CatNode[]): (CatNode & { produits: typeof produits })[] {
      return nodesList.map(node => ({
        ...node,
        produits: produitsByCategorie.get(node.id_categorie) ?? [],
        sous_cats: attachProductsToNodes(node.sous_cats),
      }));
    }

    return {
      ...marque,
      categories: attachProductsToNodes(tree),
    };
  },

  // ── ADMIN ──────────────────────────────────────────────────────────────────

  async findAll(params: CategorieQueryDto) {
    const where: Record<string, unknown> = {};
    if (params.id_marque)   where.id_marque   = params.id_marque;
    if (params.id_activite) where.id_activite = params.id_activite;
    if (params.scope === "root") where.parent_id = null;

    const rows = await prisma.categorie.findMany({
      where,
      orderBy: [{ parent_id: "asc" }, { ordre: "asc" }, { nom: "asc" }],
      include: {
        marque:   { select: { nom: true, slug: true, translations: true } },
        activite: { select: { nom: true, slug: true, translations: true } },
        parent:   { select: { nom: true, id_categorie: true, translations: true } },
        parents_extra: { select: { id_parent: true, parent: { select: { id_categorie: true, nom: true } } } },
        _count:   { select: { produits: true, sous_cats: true } },
      },
    });
    return rows.map(r => ({ ...r, parent_ids_extra: r.parents_extra.map(p => p.id_parent) }));
  },

  async findById(id_categorie: number) {
    const cat = await prisma.categorie.findUnique({
      where:   { id_categorie },
      include: {
        marque:    true,
        activite:  true,
        parent:    true,
        sous_cats: { orderBy: { ordre: "asc" } },
        produits:  { take: 5, include: { images: { where: { is_principale: true }, take: 1 } } },
        parents_extra: { select: { id_parent: true, parent: { select: { id_categorie: true, nom: true } } } },
        _count:    { select: { produits: true, sous_cats: true } },
      },
    });
    if (!cat) return null;
    return { ...cat, parent_ids_extra: cat.parents_extra.map(p => p.id_parent) };
  },

  async findBySlug(slug: string) {
    return prisma.categorie.findUnique({ where: { slug } });
  },

  async findBySlugWithChildren(slug: string) {
    // 1. Trouver la catégorie
    const cat = await prisma.categorie.findUnique({
      where:  { slug },
      select: {
        id_categorie: true, nom: true, slug: true,
        description: true, image: true, parent_id: true, ordre: true,
        parent:    { select: { nom: true, slug: true, translations: true } },
        sous_cats: {
          where:   { actif: true },
          orderBy: [{ ordre: "asc" }, { nom: "asc" }],
          select: {
            id_categorie: true, nom: true, slug: true,
            description: true, translations: true, image: true, ordre: true,
          },
        },
      },
    });
    if (!cat) return null;

    // 2. Produits directs de cette catégorie
    const produits = await prisma.produit.findMany({
      where:   { id_categorie: cat.id_categorie, actif: true },
      orderBy: [{ ordre: "asc" }, { nom: "asc" }],
      select: {
        id_produit: true, nom: true, slug: true,
        description: true, translations: true, division: true, tags: true, ordre: true,
        id_categorie: true,
        categorie: { select: { id_activite: true, activite: { select: { nom: true, slug: true, translations: true } }, marque: { select: { nom: true, slug: true, logo: true, translations: true } } } },
        images: {
          orderBy: [{ is_principale: "desc" }, { ordre: "asc" }],
          take:    1,
          select:  { url: true, alt: true },
        },
      },
    });

    // 3. Produits des sous-catégories
    const sousCatIds = cat.sous_cats.map(s => s.id_categorie);
    const sousProduits = sousCatIds.length > 0
      ? await prisma.produit.findMany({
          where:   { id_categorie: { in: sousCatIds }, actif: true },
          orderBy: [{ ordre: "asc" }, { nom: "asc" }],
          select: {
            id_produit: true, nom: true, slug: true,
            description: true, translations: true, division: true, tags: true, ordre: true,
            id_categorie: true,
            categorie: { select: { id_activite: true, activite: { select: { nom: true, slug: true, translations: true } }, marque: { select: { nom: true, slug: true, logo: true, translations: true } } } },
            images: {
              orderBy: [{ is_principale: "desc" }, { ordre: "asc" }],
              take:    1,
              select:  { url: true, alt: true },
            },
          },
        })
      : [];

    // 4. Grouper les sous-produits par sous-catégorie
    const map = new Map<number, typeof sousProduits>();
    const normalizeProduit = <T extends { categorie?: any }>(p: T) => ({
      ...p,
      marque: p.categorie?.marque ?? null,
    });

    sousProduits.forEach(p => {
      const list = map.get(p.id_categorie) ?? [];
      list.push(normalizeProduit(p));
      map.set(p.id_categorie, list);
    });

    return {
      ...cat,
      produits: produits.map(normalizeProduit),
      sous_cats: cat.sous_cats.map(s => ({
        ...s,
        produits: map.get(s.id_categorie) ?? [],
      })),
    };
  },

  async isLeaf(id_categorie: number): Promise<boolean> {
    const count = await prisma.categorie.count({ where: { parent_id: id_categorie } });
    return count === 0;
  },

  async create(data: CreateCategorieDto) {
    const { parent_ids_extra, ...rest } = data;
    return prisma.categorie.create({
      data: {
        ...rest,
        slug: rest.slug.toLowerCase(),
        actif: true,
        ...(parent_ids_extra && parent_ids_extra.length > 0
          ? { parents_extra: { create: parent_ids_extra.map(id_parent => ({ id_parent })) } }
          : {}),
      },
    });
  },

  async update(id_categorie: number, data: UpdateCategorieDto) {
    const { parent_ids_extra, ...rest } = data;
    return prisma.$transaction(async (tx) => {
      const cat = await tx.categorie.update({ where: { id_categorie }, data: rest });
      // parent_ids_extra non fourni (undefined) → on ne touche pas aux liens existants.
      // Fourni (même vide []) → on remplace entièrement la liste.
      if (parent_ids_extra !== undefined) {
        await tx.categorieParentExtra.deleteMany({ where: { id_categorie } });
        const cleaned = [...new Set(parent_ids_extra)].filter(id => id !== id_categorie);
        if (cleaned.length > 0) {
          await tx.categorieParentExtra.createMany({
            data: cleaned.map(id_parent => ({ id_categorie, id_parent })),
          });
        }
      }
      return cat;
    });
  },

  async delete(id_categorie: number) {
    // Suppression récursive : on efface toute la descendance avant le nœud lui-même.
    //
    // IMPORTANT — La FK Produit.id_categorie est déclarée onDelete: Restrict.
    // Cela signifie que Prisma/PostgreSQL refusera de supprimer une catégorie
    // qui possède encore des produits.  On désaccouple donc les produits AVANT
    // de supprimer chaque nœud de l'arbre, en passant id_categorie à NULL sur
    // les produits concernés (id_categorie est non-nullable en Prisma mais on
    // peut contourner via une transaction raw si nécessaire ; ici on utilise
    // updateMany ce qui est plus propre).
    //
    // Stratégie choisie : désactiver (actif=false) les produits orphelins plutôt
    // que de les supprimer définitivement — ils restent récupérables par un admin.
    async function deleteSubtree(id: number): Promise<void> {
      // 1. Récupérer les enfants directs
      const children = await prisma.categorie.findMany({
        where:  { parent_id: id },
        select: { id_categorie: true },
      });

      // 2. Récurser sur les enfants d'abord (feuilles en premier)
      for (const child of children) {
        await deleteSubtree(child.id_categorie);
      }

      // 3. Désactiver les produits rattachés à ce nœud pour lever la contrainte
      //    Restrict avant la suppression du nœud lui-même.
      await prisma.produit.updateMany({
        where: { id_categorie: id },
        data:  { actif: false },
      });

      // 4. Supprimer le nœud — aucun produit actif/inactif ne le bloque plus
      //    car updateMany ci-dessus ne change pas id_categorie… on doit donc
      //    en réalité détacher les produits.  Prisma n'autorise pas id_categorie
      //    à NULL (non-nullable), donc on les supprime définitivement ou on les
      //    déplace.  Choix retenu : suppression en cascade des produits (et de
      //    leurs images/données liées via les cascades déjà définies en base).
      await prisma.produit.deleteMany({ where: { id_categorie: id } });

      // 5. Supprimer la catégorie elle-même
      await prisma.categorie.delete({ where: { id_categorie: id } });
    }

    return deleteSubtree(id_categorie);
  },
};
