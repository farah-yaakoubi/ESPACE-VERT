import { prisma } from "../../lib/prisma";
import { CreateFaqDto, UpdateFaqDto, FaqQueryDto } from "./faq.schema";

export const faqRepository = {

  async findAllPublic(params: FaqQueryDto) {
    const where: Record<string, unknown> = { active: true };
    if (params.categorie) where.categorie = params.categorie;
    return prisma.faq.findMany({
      where,
      orderBy: [{ categorie: "asc" }, { ordre: "asc" }],
    });
  },

  async findAll(params: FaqQueryDto) {
    const where: Record<string, unknown> = {};
    if (params.active !== undefined) where.active = params.active === "true";
    if (params.categorie) where.categorie = params.categorie;
    return prisma.faq.findMany({
      where,
      orderBy: [{ categorie: "asc" }, { ordre: "asc" }],
    });
  },

  async findById(id_faq: number) {
    return prisma.faq.findUnique({ where: { id_faq } });
  },

  // Incrémenter nb_consultations à chaque lecture publique
  async incrementConsultation(id_faq: number) {
    return prisma.faq.update({
      where: { id_faq },
      data:  { nb_consultations: { increment: 1 } },
    });
  },

  async create(data: CreateFaqDto) {
    return prisma.faq.create({ data });
  },

  async update(id_faq: number, data: UpdateFaqDto) {
    return prisma.faq.update({ where: { id_faq }, data });
  },

  async delete(id_faq: number) {
    return prisma.faq.delete({ where: { id_faq } });
  },

  async getCategories() {
    const rows = await prisma.faq.findMany({
      where:    { active: true, categorie: { not: null } },
      distinct: ["categorie"],
      select:   { categorie: true },
      orderBy:  { categorie: "asc" },
    });
    return rows.map((r: { categorie: string | null }) => r.categorie).filter(Boolean);
  },

  // Top FAQs les plus consultées
  async getTopConsulted(limit = 10) {
    return prisma.faq.findMany({
      where:   { active: true, nb_consultations: { gt: 0 } },
      orderBy: { nb_consultations: "desc" },
      take:    limit,
    });
  },
};
