// src/modules/faq/faq.repository.ts
import { prisma } from "../../lib/prisma";
import { CreateFaqDto, UpdateFaqDto, FaqQueryDto } from "./faq.schema";

export const faqRepository = {

  async findAllPublic(params: FaqQueryDto) {
    const where: any = { active: true };
    if (params.categorie) where.categorie = params.categorie;
    return prisma.faq.findMany({
      where,
      orderBy: [{ categorie: "asc" }, { ordre: "asc" }],
      select: { id_faq: true, question: true, reponse: true, categorie: true, ordre: true },
    });
  },

  async findAll(params: FaqQueryDto) {
    const where: any = {};
    if (params.categorie) where.categorie = params.categorie;
    return prisma.faq.findMany({ where, orderBy: [{ categorie: "asc" }, { ordre: "asc" }] });
  },

  async findById(id_faq: number) {
    return prisma.faq.findUnique({ where: { id_faq } });
  },

  async create(data: CreateFaqDto) {
    return prisma.faq.create({ data: { ...data, active: true } });
  },

  async update(id_faq: number, data: UpdateFaqDto) {
    return prisma.faq.update({ where: { id_faq }, data });
  },

  async delete(id_faq: number) {
    return prisma.faq.delete({ where: { id_faq } });
  },
};
