import { prisma } from "../../lib/prisma";
import { CreateActiviteDto, UpdateActiviteDto } from "./activite.schema";

export const activiteRepository = {

  async findAllPublic() {
    return prisma.activite.findMany({
      where:   { actif: true },
      orderBy: { ordre: "asc" },
      select:  { id_activite: true, nom: true, slug: true, description: true, image: true, banniere: true, ordre: true, actif: true },
    });
  },

  async findAll() {
    return prisma.activite.findMany({
      orderBy: { ordre: "asc" },
      include: { _count: { select: { categories: true, produits: true } } },
    });
  },

  // Retourne l'activité avec ses catégories ET ses produits directs
  async findBySlugPublic(slug: string) {
    return prisma.activite.findUnique({
      where: { slug, actif: true } as any,
      include: {
        categories: {
          where:   { actif: true },
          orderBy: { ordre: "asc" },
          select:  { id_categorie: true, nom: true, slug: true, description: true, image: true, parent_id: true, id_marque: true },
        },
        // ← Produits directement liés via id_activite
        produits: {
          where:   { actif: true },
          orderBy: [{ ordre: "asc" }, { nom: "asc" }],
          select:  {
            id_produit: true, nom: true, slug: true, description: true,
            division: true, tags: true, created_at: true,
            marque:    { select: { nom: true, slug: true, logo: true } },
            categorie: { select: { nom: true, slug: true } },
            images:    { where: { is_principale: true }, take: 1, select: { url: true, alt: true } },
          },
        },
      },
    });
  },

  async findById(id_activite: number) {
    return prisma.activite.findUnique({
      where:   { id_activite },
      include: { categories: { orderBy: { ordre: "asc" } } },
    });
  },

  async findBySlug(slug: string) {
    return prisma.activite.findUnique({ where: { slug } });
  },

  async create(data: CreateActiviteDto) {
    return prisma.activite.create({
      data: { ...data, slug: data.slug.toLowerCase(), actif: true },
    });
  },

  async update(id_activite: number, data: UpdateActiviteDto) {
    return prisma.activite.update({ where: { id_activite }, data });
  },

  async delete(id_activite: number) {
    return prisma.activite.delete({ where: { id_activite } });
  },
};
