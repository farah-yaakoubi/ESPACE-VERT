// src/modules/categorie/categorie.repository.ts
import { prisma } from "../../lib/prisma";
import { CreateCategorieDto, UpdateCategorieDto, CategorieQueryDto } from "./categorie.schema";

export const categorieRepository = {

  async findAllPublic(params: CategorieQueryDto) {
    const where: any = { actif: true };
    if (params.id_marque)   where.id_marque   = params.id_marque;
    if (params.id_activite) where.id_activite = params.id_activite;
    return prisma.categorie.findMany({
      where, orderBy: { ordre: "asc" },
      select: { id_categorie: true, nom: true, slug: true, description: true, image: true, id_marque: true, id_activite: true, parent_id: true },
    });
  },

  async findAll(params: CategorieQueryDto) {
    const where: any = {};
    if (params.id_marque)   where.id_marque   = params.id_marque;
    if (params.id_activite) where.id_activite = params.id_activite;
    return prisma.categorie.findMany({
      where, orderBy: { ordre: "asc" },
      include: {
        marque:   { select: { nom: true, slug: true } },
        activite: { select: { nom: true, slug: true } },
        parent:   { select: { nom: true } },
        _count:   { select: { produits: true } },
      },
    });
  },

  async findById(id_categorie: number) {
    return prisma.categorie.findUnique({
      where:   { id_categorie },
      include: { marque: true, activite: true, parent: true, sous_cats: true, produits: { take: 5 } },
    });
  },

  async findBySlug(slug: string) {
    return prisma.categorie.findUnique({ where: { slug } });
  },

  async create(data: CreateCategorieDto) {
    return prisma.categorie.create({ data: { ...data, slug: data.slug.toLowerCase(), actif: true } });
  },

  async update(id_categorie: number, data: UpdateCategorieDto) {
    return prisma.categorie.update({ where: { id_categorie }, data });
  },

  async delete(id_categorie: number) {
    return prisma.categorie.delete({ where: { id_categorie } });
  },
};
