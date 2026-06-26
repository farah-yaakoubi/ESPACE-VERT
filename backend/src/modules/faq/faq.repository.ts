import { prisma } from "../../lib/prisma";
import { CreateFaqDto, FaqQueryDto, UpdateFaqDto } from "./faq.schema";

export const faqRepository = {

  async findAllPublic(params: FaqQueryDto) {
    const where: any = { active: true };
    if ((params as any).rubrique) where.rubrique = (params as any).rubrique;
    const rows = await prisma.faq.findMany({
      where,
      orderBy: { ordre: "asc" },
    });
    // Tri secondaire par rubrique côté applicatif (rubrique est nullable)
    return rows.sort((a: any, b: any) => {
      const ra = a.rubrique ?? "";
      const rb = b.rubrique ?? "";
      return ra.localeCompare(rb) || a.ordre - b.ordre;
    });
  },

  async findAll(params: FaqQueryDto) {
    const where: any = {};
    if (params.active !== undefined) where.active = params.active === "true";
    if ((params as any).rubrique) where.rubrique = (params as any).rubrique;
    const rows = await prisma.faq.findMany({
      where,
      orderBy: { ordre: "asc" },
    });
    // Tri secondaire par rubrique côté applicatif
    return rows.sort((a: any, b: any) => {
      const ra = a.rubrique ?? "";
      const rb = b.rubrique ?? "";
      return ra.localeCompare(rb) || a.ordre - b.ordre;
    });
  },

  async findById(id_faq: number) {
    return prisma.faq.findUnique({ where: { id_faq } });
  },

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
      where:    { active: true, rubrique: { not: null } },
      distinct: ["rubrique"],
      select:   { rubrique: true },
      orderBy:  { ordre: "asc" },
    });
    return rows
      .map((r: { rubrique: string | null }) => r.rubrique)
      .filter(Boolean)
      .sort();
  },

  async getTopConsulted(limit = 10) {
    return prisma.faq.findMany({
      where:   { active: true, nb_consultations: { gt: 0 } },
      orderBy: { nb_consultations: "desc" },
      take:    limit,
    });
  },
};