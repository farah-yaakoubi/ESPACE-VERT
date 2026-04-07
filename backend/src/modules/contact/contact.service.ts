// src/modules/contact/contact.service.ts
import { contactRepository } from "./contact.repository";
import { paginate } from "../../lib/response";
import { logAudit } from "../../lib/audit";
import { prisma } from "../../lib/prisma";
import { CreateContactDto, UpdateContactDto, ContactQueryDto } from "./contact.schema";

export const contactService = {

  // ── Public ────────────────────────────────────────────────────
  async send(data: CreateContactDto) {
    let id_visiteur: number | undefined;
    if (data.token_visiteur) {
      const v = await prisma.visiteur.findUnique({ where: { token_visiteur: data.token_visiteur } });
      if (v) id_visiteur = v.id_visiteur;
    }
    return contactRepository.create({
      nom:         data.nom.trim(),
      email:       data.email.toLowerCase().trim(),
      sujet:       data.sujet   ?? null,
      message:     data.message.trim(),
      id_visiteur: id_visiteur  ?? null,
    });
  },

  // ── Admin ─────────────────────────────────────────────────────
  async list(params: ContactQueryDto) {
    const { messages, total } = await contactRepository.findAll(params);
    return { data: messages, meta: paginate(total, params.page, params.limit) };
  },

  async getById(id: number) {
    const m = await contactRepository.findById(id);
    if (!m) throw { status: 404, message: "Message introuvable" };
    return m;
  },

  async update(id: number, data: UpdateContactDto, id_admin: number) {
    await contactService.getById(id);
    const replied_at = data.reponse ? new Date() : undefined;
    const message = await contactRepository.update(id, { ...data, id_admin, ...(replied_at && { replied_at }) });
    await logAudit({ id_admin, action: "UPDATE", entity_name: "message", entity_id: id });
    return message;
  },

  async delete(id: number, id_admin: number) {
    await contactService.getById(id);
    await contactRepository.delete(id);
    await logAudit({ id_admin, action: "DELETE", entity_name: "message", entity_id: id });
  },
};
