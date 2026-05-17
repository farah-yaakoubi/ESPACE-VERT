import { produitRepository } from "./produit.repository";
import { paginate } from "../../lib/pagination";
import { logAudit } from "../../lib/audit";
import {
  CreateProduitDto, UpdateProduitDto,
  ProduitQueryDto, ProduitPublicQueryDto, AddImageDto,
} from "./produit.schema";
import { categorieService } from "../categorie/categorie.service";

export const produitService = {

  async listPublic(params: ProduitPublicQueryDto) {
    const { produits, total } = await produitRepository.findAllPublic({
      page:         params.page,
      limit:        params.limit,
      id_marque:    params.id_marque,
      id_categorie: params.id_categorie,
      id_activite:  params.id_activite,
      marque_slug:  params.marque,
      division:     params.division,
      search:       params.search,
    });
    return { data: produits, meta: paginate(total, params.page, params.limit) };
  },

  async getBySlugPublic(slug: string) {
    const p = await produitRepository.findBySlugPublic(slug);
    if (!p || !p.actif) throw { status: 404, message: "Produit introuvable" };
    return p;
  },

  async list(params: ProduitQueryDto) {
    const { produits, total } = await produitRepository.findAll(params);
    return { data: produits, meta: paginate(total, params.page, params.limit) };
  },

  async getById(id: number) {
    const p = await produitRepository.findById(id);
    if (!p) throw { status: 404, message: "Produit introuvable" };
    return p;
  },

  async create(data: CreateProduitDto, id_admin: number) {
    const existing = await produitRepository.findBySlug(data.slug);
    if (existing) throw { status: 409, message: "Ce slug est déjà utilisé" };

    // Vérifie que la catégorie est une feuille (pas de sous-catégories)
    await categorieService.assertIsLeaf(data.id_categorie);

    // Si id_activite non fourni → déduire depuis la catégorie
    let payload = { ...data };
    if (!payload.id_activite && payload.id_categorie) {
      const { prisma } = await import("../../lib/prisma");
      const cat = await prisma.categorie.findUnique({ where: { id_categorie: payload.id_categorie } });
      if (cat?.id_activite) payload.id_activite = cat.id_activite;
    }

    const produit = await produitRepository.create(payload);
    await logAudit({
      id_admin, action: "CREATE", entity_name: "produit",
      entity_id: produit.id_produit,
      detail: { nom: data.nom, id_categorie: data.id_categorie, id_marque: data.id_marque },
    });
    return produit;
  },

  async update(id: number, data: UpdateProduitDto, id_admin: number) {
    const before = await produitService.getById(id);

    // Si la catégorie change, vérifier que la nouvelle est une feuille
    if (data.id_categorie && data.id_categorie !== before.id_categorie) {
      await categorieService.assertIsLeaf(data.id_categorie);
    }

    const produit = await produitRepository.update(id, data);
    await logAudit({
      id_admin, action: "UPDATE", entity_name: "produit", entity_id: id,
      detail: { before: { nom: before.nom, actif: before.actif }, after: { nom: data.nom, actif: data.actif } },
    });
    return produit;
  },

  async delete(id: number, id_admin: number) {
    const before = await produitService.getById(id);
    await produitRepository.delete(id);
    await logAudit({
      id_admin, action: "DELETE", entity_name: "produit", entity_id: id,
      detail: {
        snapshot: {
          nom:          before.nom,
          slug:         before.slug,
          id_categorie: before.id_categorie,
          id_marque:    before.id_marque,
          division:     before.division,
          actif:        before.actif,
        },
      },
    });
  },

  async addImage(id: number, data: AddImageDto, id_admin: number) {
    const produit = await produitRepository.addImage(id, data);
    await logAudit({ id_admin, action: "ADD_IMAGE", entity_name: "produit", entity_id: id, detail: { url: data.url } });
    return produit;
  },

  async updateImage(id_imgP: number, data: { is_principale?: boolean; alt?: string | null }, id_admin: number) {
    const image = await produitRepository.updateImage(id_imgP, data);
    await logAudit({ id_admin, action: "UPDATE_IMAGE", entity_name: "produit_image", entity_id: id_imgP });
    return image;
  },

  async setPrincipale(id_produit: number, id_imgP: number, id_admin: number) {
    const image = await produitRepository.setPrincipale(id_produit, id_imgP);
    await logAudit({ id_admin, action: "SET_PRINCIPALE", entity_name: "produit_image", entity_id: id_imgP });
    return image;
  },

  async deleteImage(id_imgP: number, id_admin: number) {
    await produitRepository.deleteImage(id_imgP);
    await logAudit({ id_admin, action: "DELETE", entity_name: "produit_image", entity_id: id_imgP });
  },
};
