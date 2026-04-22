// src/modules/contact/contact.repository.ts
import { prisma } from "../../lib/prisma";
import { ContactQueryDto } from "./contact.schema";

export const contactRepository = {

  async findAll(params: ContactQueryDto) {
    const { page, limit, lu, search } = params;
    const where: Record<string, unknown> = {};
    if (lu !== undefined) where.lu = lu === "true";
    if (search) {
      where.OR = [
        { nom:   { contains: search } },
        { email: { contains: search } },
        { sujet: { contains: search } },
      ];
    }
    const [total, messages] = await Promise.all([
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: "desc" },
        include: { admin: { select: { nom: true } } },
      }),
    ]);
    return { messages, total };
  },

  async findById(id_contact: number) {
    return prisma.contactMessage.findUnique({
      where:   { id_contact },
      include: {
        visiteur: { select: { ip_address: true, pays: true } },
        admin:    { select: { nom: true, email: true } },
      },
    });
  },

  async create(data: {
    nom: string; email: string; sujet?: string | null;
    message: string; id_visiteur?: number | null;
  }) {
    return prisma.contactMessage.create({ data });
  },

  async markRead(id_contact: number) {
    return prisma.contactMessage.update({
      where: { id_contact },
      data:  { lu: true },
    });
  },

  async reply(id_contact: number, reponse: string, id_admin: number) {
    return prisma.contactMessage.update({
      where: { id_contact },
      data:  { reponse, id_admin, lu: true, replied_at: new Date() },
    });
  },

  async delete(id_contact: number) {
    return prisma.contactMessage.delete({ where: { id_contact } });
  },

  async countUnread() {
    return prisma.contactMessage.count({ where: { lu: false } });
  },
};
