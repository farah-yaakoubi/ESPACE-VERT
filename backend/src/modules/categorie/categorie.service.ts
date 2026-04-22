import { categorieRepository } from "./categorie.repository";
import { logAudit } from "../../lib/audit";
import { CreateCategorieDto, UpdateCategorieDto, CategorieQueryDto } from "./categorie.schema";

export const categorieService = {
  async listPublic(params: CategorieQueryDto) { return categorieRepository.findAllPublic(params); },
  async list(params: CategorieQueryDto)       { return categorieRepository.findAll(params); },
  async getById(id: number) {
    const c = await categorieRepository.findById(id);
    if (!c) throw { status: 404, message: "Catégorie introuvable" };
    return c;
  },
  async create(data: CreateCategorieDto, id_admin: number) {
    const existing = await categorieRepository.findBySlug(data.slug);
    if (existing) throw { status: 409, message: "Ce slug est déjà utilisé" };
    const cat = await categorieRepository.create(data);
    await logAudit({ id_admin, action: "CREATE", entity_name: "categorie", entity_id: cat.id_categorie, detail: { nom: data.nom } });
    return cat;
  },
  async update(id: number, data: UpdateCategorieDto, id_admin: number) {
    const before = await categorieService.getById(id);
    const cat = await categorieRepository.update(id, data);
    await logAudit({ id_admin, action: "UPDATE", entity_name: "categorie", entity_id: id, detail: { before: { nom: before.nom }, after: { nom: data.nom } } });
    return cat;
  },
  async delete(id: number, id_admin: number) {
    const before = await categorieService.getById(id);
    await categorieRepository.delete(id);
    await logAudit({ id_admin, action: "DELETE", entity_name: "categorie", entity_id: id,
      detail: { snapshot: { nom: before.nom, slug: before.slug, id_marque: before.id_marque, id_activite: before.id_activite } } });
  },
};
