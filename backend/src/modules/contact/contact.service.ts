// src/modules/contact/contact.service.ts
import { contactRepository } from "./contact.repository";
import { paginate } from "../../lib/response";
import { logAudit } from "../../lib/audit";
import { prisma } from "../../lib/prisma";
import { CreateContactDto, ReplyContactDto, ContactQueryDto } from "./contact.schema";

export const contactService = {

  async send(data: CreateContactDto) {
    let id_visiteur: number | undefined;
    if (data.token_visiteur) {
      const v = await prisma.visiteur.findUnique({ where: { token_visiteur: data.token_visiteur } });
      if (v) id_visiteur = v.id_visiteur;
    }
    return contactRepository.create({
      nom:         data.nom.trim(),
      email:       data.email.toLowerCase().trim(),
      sujet:       data.sujet ?? null,
      message:     data.message,
      id_visiteur: id_visiteur ?? null,
    });
  },

  async list(params: ContactQueryDto) {
    const { messages, total } = await contactRepository.findAll(params);
    return { data: messages, meta: paginate(total, params.page, params.limit) };
  },

  async getById(id: number) {
    const m = await contactRepository.findById(id);
    if (!m) throw { status: 404, message: "Message introuvable" };
    return m;
  },

  async markRead(id: number, id_admin: number) {
    await contactService.getById(id);
    const m = await contactRepository.markRead(id);
    await logAudit({ id_admin, action: "UPDATE", entity_name: "contact", entity_id: id, detail: { action: "mark_read" } });
    return m;
  },

  async reply(id: number, dto: ReplyContactDto, id_admin: number) {
    const current = await contactService.getById(id);
    if (current.reponse) throw { status: 409, message: "Ce message a déjà reçu une réponse" };
    const m = await contactRepository.reply(id, dto.reponse, id_admin);
    await logAudit({ id_admin, action: "REPLY", entity_name: "contact", entity_id: id });
    return m;
  },

  async delete(id: number, id_admin: number) {
    await contactService.getById(id);
    await contactRepository.delete(id);
    await logAudit({ id_admin, action: "DELETE", entity_name: "contact", entity_id: id });
  },

  async countUnread() {
    return contactRepository.countUnread();
  },
};
