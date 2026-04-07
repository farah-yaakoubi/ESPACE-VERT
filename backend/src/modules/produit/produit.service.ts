// src/modules/produit/produit.service.ts
// Logique métier — validation métier, règles, orchestration
import { produitRepository } from "./produit.repository";
import { paginate } from "../../lib/response";
import { logAudit } from "../../lib/audit";
import {
  CreateProduitDto, UpdateProduitDto,
  ProduitQueryDto, ProduitPublicQueryDto, AddImageDto,
} from "./produit.schema";

export const produitService = {

  // ── Public ────────────────────────────────────────────────────
  async listPublic(params: ProduitPublicQueryDto) {
    const { produits, total } = await produitRepository.findAllPublic({
      page:        params.page,
      limit:       params.limit,
      id_marque:   params.id_marque,
      id_categorie: params.id_categorie,
      marque_slug: params.marque,
      division:    params.division,
      search:      params.search,
    });
    return {
      data: produits,
      meta: paginate(total, params.page, params.limit),
    };
  },

  async getBySlugPublic(slug: string) {
    const p = await produitRepository.findBySlugPublic(slug);
    if (!p || !p.actif) throw { status: 404, message: "Produit introuvable" };
    return p;
  },

  // ── Admin ─────────────────────────────────────────────────────
  async list(params: ProduitQueryDto) {
    const { produits, total } = await produitRepository.findAll(params);
    return {
      data: produits,
      meta: paginate(total, params.page, params.limit),
    };
  },

  async getById(id: number) {
    const p = await produitRepository.findById(id);
    if (!p) throw { status: 404, message: "Produit introuvable" };
    return p;
  },

  async create(data: CreateProduitDto, id_admin: number) {
    // Règle : slug unique
    const existing = await produitRepository.findBySlug(data.slug);
    if (existing) throw { status: 409, message: "Ce slug est déjà utilisé" };

    const produit = await produitRepository.create(data);
    await logAudit({ id_admin, action: "CREATE", entity_name: "produit", entity_id: produit.id_produit });
    return produit;
  },

  async update(id: number, data: UpdateProduitDto, id_admin: number) {
    await produitService.getById(id); // vérifie existence
    const produit = await produitRepository.update(id, data);
    await logAudit({ id_admin, action: "UPDATE", entity_name: "produit", entity_id: id });
    return produit;
  },

  async delete(id: number, id_admin: number) {
    await produitService.getById(id);
    await produitRepository.delete(id);
    await logAudit({ id_admin, action: "DELETE", entity_name: "produit", entity_id: id });
  },

  async addImage(id: number, data: AddImageDto, id_admin: number) {
    await produitService.getById(id);
    const image = await produitRepository.addImage(id, data);
    await logAudit({ id_admin, action: "UPDATE", entity_name: "produit", entity_id: id, detail: { action: "add_image" } });
    return image;
  },

  async deleteImage(id_imgP: number, id_admin: number) {
    await produitRepository.deleteImage(id_imgP);
    await logAudit({ id_admin, action: "DELETE", entity_name: "produit_image", entity_id: id_imgP });
  },
};
