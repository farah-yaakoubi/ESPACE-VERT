// src/modules/faq/faq.service.ts
import { faqRepository } from "./faq.repository";
import { logAudit } from "../../lib/audit";
import { CreateFaqDto, UpdateFaqDto, FaqQueryDto } from "./faq.schema";

export const faqService = {

  async listPublic(params: FaqQueryDto) {
    return faqRepository.findAllPublic(params);
  },

  async list(params: FaqQueryDto) {
    return faqRepository.findAll(params);
  },

  async getById(id: number) {
    const f = await faqRepository.findById(id);
    if (!f) throw { status: 404, message: "FAQ introuvable" };
    return f;
  },

  async create(data: CreateFaqDto, id_admin: number) {
    const faq = await faqRepository.create(data);
    await logAudit({ id_admin, action: "CREATE", entity_name: "faq", entity_id: faq.id_faq });
    return faq;
  },

  async update(id: number, data: UpdateFaqDto, id_admin: number) {
    await faqService.getById(id);
    const faq = await faqRepository.update(id, data);
    await logAudit({ id_admin, action: "UPDATE", entity_name: "faq", entity_id: id });
    return faq;
  },

  async delete(id: number, id_admin: number) {
    await faqService.getById(id);
    await faqRepository.delete(id);
    await logAudit({ id_admin, action: "DELETE", entity_name: "faq", entity_id: id });
  },
};
