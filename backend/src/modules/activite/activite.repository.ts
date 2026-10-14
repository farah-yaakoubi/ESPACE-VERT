import { prisma } from "../../lib/prisma";
import { CreateActiviteDto, UpdateActiviteDto } from "./activite.schema";

const PRODUCT_CATALOG_ORDER = [
  { ordre: "asc" as const },
  { created_at: "asc" as const },
  { id_produit: "asc" as const },
];

export const activiteRepository = {

  async findAllPublic() {
    return prisma.activite.findMany({
      where:   { actif: true },
      orderBy: { ordre: "asc" },
      select:  { id_activite: true, nom: true, slug: true, description: true, translations: true, image: true, banniere: true, ordre: true, actif: true },
    });
  },

  async findAll() {
    return prisma.activite.findMany({
      orderBy: { ordre: "asc" },
      include: { _count: { select: { categories: true } } },
    });
  },

  // Retourne l'activité avec ses catégories ET ses produits (via les catégories
  // directement liées + les catégories des marques liées via activiteMarque)
  async findBySlugPublic(slug: string) {
    const activite = await (prisma as any).activite.findUnique({
      where: { slug, actif: true },
      include: {
        categories: {
          where:   { actif: true },
          orderBy: { ordre: "asc" },
          select:  { id_categorie: true, nom: true, slug: true, description: true, translations: true, image: true, parent_id: true, id_marque: true },
        },
        // Marques liées à cette activité via la table de jonction
        marques: {
          select: { marque: { select: { id_marque: true, nom: true, slug: true, logo: true, translations: true } } },
        },
      },
    });
    if (!activite) return null;

    // Catégories directement liées à l'activité
    const directCatIds = new Set<number>(activite.categories.map((c: any) => c.id_categorie));

    // Marques liées via activiteMarque → récupérer aussi leurs catégories
    const marqueIds: number[] = (activite.marques ?? []).map((am: any) => am.marque.id_marque);
    let extraCatIds: number[] = [];
    if (marqueIds.length > 0) {
      const marqueCats = await (prisma as any).categorie.findMany({
        where:  { id_marque: { in: marqueIds }, actif: true },
        select: { id_categorie: true },
      });
      extraCatIds = marqueCats
        .map((c: any) => c.id_categorie)
        .filter((id: number) => !directCatIds.has(id));
    }

    // Les deux ensembles ci-dessus ne contiennent que les catégories taguées
    // *directement* (id_activite / id_marque) — il faut redescendre via
    // parent_id pour récupérer toute leur descendance (sous-catégories qui
    // n'ont pas ce tag mais en héritent via leur parent), sans quoi
    // l'arborescence de l'activité/marque s'arrête au premier niveau.
    const roots = [...directCatIds, ...extraCatIds];
    let allCatIds = roots;
    if (roots.length > 0) {
      const allActiveCats = await (prisma as any).categorie.findMany({
        where:  { actif: true },
        select: { id_categorie: true, parent_id: true },
      });
      const collected = new Set<number>();
      const collectDescendants = (rootId: number) => {
        if (collected.has(rootId)) return;
        collected.add(rootId);
        allActiveCats
          .filter((c: any) => c.parent_id === rootId)
          .forEach((c: any) => collectDescendants(c.id_categorie));
      };
      roots.forEach(collectDescendants);
      allCatIds = [...collected];
    }

    const PRODUIT_SELECT = {
      id_produit: true, nom: true, slug: true, description: true, translations: true,
      fiche_technique: true, division: true, tags: true, ordre: true, created_at: true,
      id_categorie: true,
      categorie: { select: { nom: true, slug: true, translations: true, marque: { select: { nom: true, slug: true, logo: true, translations: true } } } },
      images:    { where: { is_principale: true }, take: 1, select: { url: true, alt: true } },
    };

    const produits = allCatIds.length > 0 ? await (prisma as any).produit.findMany({
      where:   { id_categorie: { in: allCatIds }, actif: true },
      orderBy: PRODUCT_CATALOG_ORDER,
      select:  PRODUIT_SELECT,
    }) : [];

    // Marques présentes (pour le frontend)
    const marques = (activite.marques ?? []).map((am: any) => am.marque);

    return {
      ...activite,
      produits: produits.map((p: any) => ({ ...p, marque: p.categorie?.marque ?? null })),
      marques,
    };
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
