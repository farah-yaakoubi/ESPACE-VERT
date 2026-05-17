import { prisma } from "../../lib/prisma";
import { CreateMarqueDto, UpdateMarqueDto } from "./marque.schema";

export const marqueRepository = {

  async findAllPublic() {
    return prisma.marque.findMany({
      where:   { actif: true },
      orderBy: { nom: "asc" },
      select:  { id_marque: true, nom: true, slug: true, logo: true, banniere: true, description: true, actif: true },
    });
  },

  async findBySlugPublic(slug: string) {
    return prisma.marque.findUnique({
      where:   { slug },
      include: {
        categories: {
          where:   { actif: true, parent_id: null }, // catégories racines (niveau 1)
          orderBy: { ordre: "asc" },
          select:  {
            id_categorie: true, nom: true, slug: true, description: true,
            image: true, id_activite: true, parent_id: true, ordre: true,
            // ✅ FIX : inclure les sous-catégories (niveau 2)
            sous_cats: {
              where:   { actif: true },
              orderBy: { ordre: "asc" },
              select:  { id_categorie: true, nom: true, slug: true, parent_id: true, ordre: true },
            },
          },
        },
        produits: {
          where:   {
            actif: true,
            categorie: { is: {} },
          },
          orderBy: { ordre: "asc" },
          select:  {
            id_produit: true, nom: true, slug: true, description: true,
            fiche_technique: true, division: true, tags: true, created_at: true,
            categorie: { select: { nom: true, slug: true } },
            images: { where: { is_principale: true }, take: 1, select: { url: true, alt: true } },
          },
        },
      },
    });
  },

  async findAll() {
    return prisma.marque.findMany({
      orderBy: { nom: "asc" },
      include: { _count: { select: { produits: true, categories: true } } },
    });
  },

  async findById(id_marque: number) {
    return prisma.marque.findUnique({
      where:   { id_marque },
      include: {
        categories: { orderBy: { ordre: "asc" } },
        produits: {
          where: { categorie: { is: {} } },
          take: 10,
          orderBy: { ordre: "asc" },
        },
      },
    });
  },

  async findBySlug(slug: string) {
    return prisma.marque.findUnique({ where: { slug } });
  },

  async create(data: CreateMarqueDto) {
    return prisma.marque.create({ data: { ...data, slug: data.slug.toLowerCase(), actif: true } });
  },

  async update(id_marque: number, data: UpdateMarqueDto) {
    return prisma.marque.update({ where: { id_marque }, data });
  },

  async delete(id_marque: number) {
    return prisma.marque.delete({ where: { id_marque } });
  },
};