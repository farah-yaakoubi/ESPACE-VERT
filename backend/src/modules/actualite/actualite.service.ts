// src/modules/actualite/actualite.service.ts
import { actualiteRepository } from "./actualite.repository";
import { paginate } from "../../lib/response";
import { logAudit } from "../../lib/audit";
import { CreateActualiteDto, UpdateActualiteDto, ActualiteQueryDto } from "./actualite.schema";

export const actualiteService = {

  async listPublic(params: { page: number; limit: number }) {
    const { actualites, total } = await actualiteRepository.findAllPublic(params);
    return { data: actualites, meta: paginate(total, params.page, params.limit) };
  },

  async getBySlugPublic(slug: string) {
    const a = await actualiteRepository.findBySlugPublic(slug);
    if (!a || !a.publiee) throw { status: 404, message: "Article introuvable" };
    return a;
  },

  async list(params: ActualiteQueryDto) {
    const { actualites, total } = await actualiteRepository.findAll(params);
    return { data: actualites, meta: paginate(total, params.page, params.limit) };
  },

  async getById(id: number) {
    const a = await actualiteRepository.findById(id);
    if (!a) throw { status: 404, message: "Actualité introuvable" };
    return a;
  },

  async create(data: CreateActualiteDto, id_admin: number) {
    const existing = await actualiteRepository.findBySlug(data.slug);
    if (existing) throw { status: 409, message: "Ce slug est déjà utilisé" };
    const actualite = await actualiteRepository.create(data, id_admin);
    await logAudit({ id_admin, action: "CREATE", entity_name: "actualite", entity_id: actualite.id_actualite });
    return actualite;
  },

  async update(id: number, data: UpdateActualiteDto, id_admin: number) {
    const existing = await actualiteService.getById(id);
    // Si on publie pour la première fois, on horodate
    const published_at = (data.publiee && !existing.publiee) ? new Date() : undefined;
    const actualite = await actualiteRepository.update(id, { ...data, ...(published_at && { published_at }) });
    await logAudit({ id_admin, action: "UPDATE", entity_name: "actualite", entity_id: id });
    return actualite;
  },

  async delete(id: number, id_admin: number) {
    await actualiteService.getById(id);
    await actualiteRepository.delete(id);
    await logAudit({ id_admin, action: "DELETE", entity_name: "actualite", entity_id: id });
  },
};
