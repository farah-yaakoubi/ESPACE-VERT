import { marqueRepository } from "./marque.repository";
import { logAudit } from "../../lib/audit";
import { CreateMarqueDto, UpdateMarqueDto } from "./marque.schema";

export const marqueService = {
  async listPublic()  { return marqueRepository.findAllPublic(); },
  async getBySlugPublic(slug: string) {
    const m = await marqueRepository.findBySlugPublic(slug);
    if (!m || !m.actif) throw { status: 404, message: "Marque introuvable" };
    return m;
  },
  async list()        { return marqueRepository.findAll(); },
  async getById(id: number) {
    const m = await marqueRepository.findById(id);
    if (!m) throw { status: 404, message: "Marque introuvable" };
    return m;
  },
  async create(data: CreateMarqueDto, id_admin: number) {
    const existing = await marqueRepository.findBySlug(data.slug);
    if (existing) throw { status: 409, message: "Ce slug est déjà utilisé" };
    const marque = await marqueRepository.create(data);
    await logAudit({ id_admin, action: "CREATE", entity_name: "marque", entity_id: marque.id_marque, detail: { nom: data.nom } });
    return marque;
  },
  async update(id: number, data: UpdateMarqueDto, id_admin: number) {
    const before = await marqueService.getById(id);
    const marque = await marqueRepository.update(id, data);
    await logAudit({ id_admin, action: "UPDATE", entity_name: "marque", entity_id: id, detail: { before: { nom: before.nom }, after: { nom: data.nom } } });
    return marque;
  },
  async delete(id: number, id_admin: number) {
    const before = await marqueService.getById(id);
    await marqueRepository.delete(id);
    await logAudit({ id_admin, action: "DELETE", entity_name: "marque", entity_id: id,
      detail: { snapshot: { nom: before.nom, slug: before.slug, actif: before.actif } } });
  },
};
