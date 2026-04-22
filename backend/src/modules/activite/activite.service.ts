import { activiteRepository } from "./activite.repository";
import { logAudit } from "../../lib/audit";
import { CreateActiviteDto, UpdateActiviteDto } from "./activite.schema";

export const activiteService = {
  async listPublic() { return activiteRepository.findAllPublic(); },

  async getBySlugPublic(slug: string) {
    const a = await activiteRepository.findBySlugPublic(slug);
    if (!a) throw { status: 404, message: "Activité introuvable" };
    return a;
  },

  async list() { return activiteRepository.findAll(); },

  async getById(id: number) {
    const a = await activiteRepository.findById(id);
    if (!a) throw { status: 404, message: "Activité introuvable" };
    return a;
  },

  async create(data: CreateActiviteDto, id_admin: number) {
    const existing = await activiteRepository.findBySlug(data.slug);
    if (existing) throw { status: 409, message: "Ce slug est déjà utilisé" };
    const activite = await activiteRepository.create(data);
    await logAudit({
      id_admin, action: "CREATE", entity_name: "activite",
      entity_id: activite.id_activite, detail: { nom: data.nom },
    });
    return activite;
  },

  async update(id: number, data: UpdateActiviteDto, id_admin: number) {
    const before = await activiteService.getById(id);
    const activite = await activiteRepository.update(id, data);
    await logAudit({
      id_admin, action: "UPDATE", entity_name: "activite", entity_id: id,
      detail: { before: { nom: before.nom }, after: { nom: data.nom } },
    });
    return activite;
  },

  async delete(id: number, id_admin: number) {
    const before = await activiteService.getById(id);
    await activiteRepository.delete(id);
    await logAudit({
      id_admin, action: "DELETE", entity_name: "activite", entity_id: id,
      detail: { snapshot: { nom: before.nom, slug: before.slug } },
    });
  },
};
