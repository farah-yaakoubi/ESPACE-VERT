// src/modules/actualite/actualite.repository.ts
import { prisma } from "../../lib/prisma";
import { CreateActualiteDto, UpdateActualiteDto, ActualiteQueryDto } from "./actualite.schema";

const PUBLIC_SELECT = {
  id_actualite: true, titre: true, contenu: true,
  image: true, slug: true, publiee: true,
  published_at: true, created_at: true,
} as const;

export const actualiteRepository = {

  async findAllPublic(params: { page: number; limit: number }) {
    const { page, limit } = params;
    const where = { publiee: true };
    const [total, actualites] = await Promise.all([
      prisma.actualite.count({ where }),
      prisma.actualite.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { published_at: "desc" },
        select:  PUBLIC_SELECT,
      }),
    ]);
    return { actualites, total };
  },

  async findBySlugPublic(slug: string) {
    return prisma.actualite.findUnique({
      where:   { slug },
      include: { admin: { select: { nom: true } } },
    });
  },

  async findAll(params: ActualiteQueryDto) {
    const { page, limit } = params;
    const where: any = {};
    if (params.publiee !== undefined) where.publiee = params.publiee === "true";

    const [total, actualites] = await Promise.all([
      prisma.actualite.count({ where }),
      prisma.actualite.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { created_at: "desc" },
        include: { admin: { select: { nom: true } } },
      }),
    ]);
    return { actualites, total };
  },

  async findById(id_actualite: number) {
    return prisma.actualite.findUnique({
      where:   { id_actualite },
      include: { admin: { select: { nom: true } } },
    });
  },

  async findBySlug(slug: string) {
    return prisma.actualite.findUnique({ where: { slug } });
  },

  async create(data: CreateActualiteDto, id_admin: number) {
    return prisma.actualite.create({
      data: {
        ...data,
        slug:        data.slug.toLowerCase(),
        id_admin,
        published_at: data.publiee ? new Date() : null,
      },
    });
  },

  async update(id_actualite: number, data: UpdateActualiteDto & { published_at?: Date | null }) {
    return prisma.actualite.update({ where: { id_actualite }, data });
  },

  async delete(id_actualite: number) {
    return prisma.actualite.delete({ where: { id_actualite } });
  },
};
