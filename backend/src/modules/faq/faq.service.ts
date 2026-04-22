import { faqRepository } from "./faq.repository";
import { logAudit } from "../../lib/audit";
import { CreateFaqDto, UpdateFaqDto, FaqQueryDto } from "./faq.schema";

export const faqService = {
  async listPublic(params: FaqQueryDto) { return faqRepository.findAllPublic(params); },
  async listAdmin(params: FaqQueryDto)  { return faqRepository.findAll(params); },
  async getById(id: number) {
    const f = await faqRepository.findById(id);
    if (!f) throw { status: 404, message: "FAQ introuvable" };
    return f;
  },
  // Incrémenter le compteur de consultations (public)
  async incrementConsultation(id: number) {
    return faqRepository.incrementConsultation(id);
  },
  async create(data: CreateFaqDto, id_admin: number) {
    const faq = await faqRepository.create(data);
    await logAudit({ id_admin, action: "CREATE", entity_name: "faq", entity_id: faq.id_faq, detail: { question: data.question.substring(0, 80) } });
    return faq;
  },
  async update(id: number, data: UpdateFaqDto, id_admin: number) {
    const before = await faqService.getById(id);
    const faq = await faqRepository.update(id, data);
    await logAudit({ id_admin, action: "UPDATE", entity_name: "faq", entity_id: id, detail: { before: { question: before.question.substring(0, 60) } } });
    return faq;
  },
  async delete(id: number, id_admin: number) {
    const before = await faqService.getById(id);
    await faqRepository.delete(id);
    await logAudit({ id_admin, action: "DELETE", entity_name: "faq", entity_id: id,
      detail: { snapshot: { question: before.question.substring(0, 100), categorie: before.categorie } } });
  },
};
