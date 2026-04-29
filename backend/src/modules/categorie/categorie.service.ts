// src/modules/categorie/categorie.service.ts
import { categorieRepository } from "./categorie.repository";
import { logAudit } from "../../lib/audit";
import { CreateCategorieDto, UpdateCategorieDto, CategorieQueryDto } from "./categorie.schema";

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

  async delete(id: number, id_admin: number) {
    const before = await categorieService.getById(id);
    await categorieRepository.delete(id); // CASCADE supprime la descendance
    await logAudit({
      id_admin,
      action: "DELETE",
      entity_name: "categorie",
      entity_id: id,
      detail: {
        snapshot: {
          nom: before.nom,
          slug: before.slug,
          id_marque: before.id_marque,
          id_activite: before.id_activite,
        },
      },
    });
  },
};
