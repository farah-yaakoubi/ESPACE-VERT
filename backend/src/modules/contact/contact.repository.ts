// src/modules/contact/contact.repository.ts
import { prisma } from "../../lib/prisma";
import { ContactQueryDto, UpdateContactDto } from "./contact.schema";

export const contactRepository = {

  async findAll(params: ContactQueryDto) {
    const { page, limit } = params;
    const where: any = {};
    if (params.lu !== undefined) where.lu = params.lu === "true";
    const [total, messages] = await Promise.all([
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { created_at: "desc" },
        include: { admin: { select: { nom: true } } },
      }),
    ]);
    return { messages, total };
  },

  async findById(id_contact: number) {
    return prisma.contactMessage.findUnique({
      where:   { id_contact },
      include: { admin: { select: { nom: true } }, visiteur: { select: { pays: true, ip_address: true } } },
    });
  },

  async create(data: {
    nom: string; email: string; sujet?: string | null;
    message: string; id_visiteur?: number | null;
  }) {
    return prisma.contactMessage.create({ data: { ...data, lu: false } });
  },

  async update(id_contact: number, data: UpdateContactDto & { id_admin: number; replied_at?: Date }) {
    return prisma.contactMessage.update({ where: { id_contact }, data });
  },

  async delete(id_contact: number) {
    return prisma.contactMessage.delete({ where: { id_contact } });
  },
};
