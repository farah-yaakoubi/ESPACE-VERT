import { prisma } from "../../lib/prisma";
import { CreateMarqueDto, UpdateMarqueDto } from "./marque.schema";

const PRODUCT_CATALOG_ORDER = [
  { ordre: "asc" as const },
  { created_at: "asc" as const },
  { id_produit: "asc" as const },
];

async function collectCategorieIdsByMarque(id_marque: number) {
  const allCats = await prisma.categorie.findMany({
    where: { actif: true },
    select: { id_categorie: true, parent_id: true, id_marque: true },
  });
  const roots = allCats.filter(c => c.id_marque === id_marque).map(c => c.id_categorie);
  const collected = new Set<number>();
  const collect = (id: number) => {
    if (collected.has(id)) return;
    collected.add(id);
    allCats.filter(c => c.parent_id === id).forEach(c => collect(c.id_categorie));
  };
  roots.forEach(collect);
  return [...collected];
}

export const marqueRepository = {

  async findAllPublic() {
    return prisma.marque.findMany({
      where:   { actif: true },
      orderBy: { nom: "asc" },
      select:  {
        id_marque: true, nom: true, slug: true, logo: true, banniere: true, description: true, translations: true, actif: true, type_marque: true,
        categories: {
          where:   { actif: true },
          orderBy: { ordre: "asc" },
          select:  { id_categorie: true, id_activite: true },
        },
      },
    });
  },

  async findBySlugPublic(slug: string) {
    const marque = await prisma.marque.findUnique({
      where:   { slug },
      include: {
        categories: {
          where:   { actif: true, parent_id: null },
          orderBy: { ordre: "asc" },
          select:  {
            id_categorie: true, nom: true, slug: true, description: true, translations: true,
            image: true, id_activite: true, parent_id: true, ordre: true,
            sous_cats: {
              where:   { actif: true },
              orderBy: { ordre: "asc" },
              select:  { id_categorie: true, nom: true, slug: true, translations: true, parent_id: true, ordre: true },
            },
          },
        },
      },
    });
    if (!marque) return null;

    const catIds = await collectCategorieIdsByMarque(marque.id_marque);
    const produits = await prisma.produit.findMany({
      where: { actif: true, id_categorie: catIds.length > 0 ? { in: catIds } : -1 },
      orderBy: PRODUCT_CATALOG_ORDER,
      select: {
        id_produit: true, nom: true, slug: true, description: true, translations: true,
        fiche_technique: true, division: true, tags: true, ordre: true, created_at: true,
        id_categorie: true,
        categorie: { select: { nom: true, slug: true, translations: true, marque: { select: { nom: true, slug: true, logo: true, translations: true } } } },
        // Toutes les photos du produit (pas seulement la principale) — nécessaire
        // pour l'effet de défilement au survol sur les cartes produit (variant "seed"),
        // identique à celui de la page Semences & Plants.
        images: { orderBy: [{ is_principale: "desc" }, { ordre: "asc" }], select: { url: true, alt: true } },
      },
    });

    return {
      ...marque,
      produits: produits.map((p) => ({ ...p, marque: p.categorie?.marque ?? null })),
    };
  },

  async findAll() {
    return prisma.marque.findMany({
      orderBy: { nom: "asc" },
      include: { _count: { select: { categories: true } } },
    });
  },

  async findById(id_marque: number) {
    return prisma.marque.findUnique({
      where:   { id_marque },
      include: {
        categories: { orderBy: { ordre: "asc" } },
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
