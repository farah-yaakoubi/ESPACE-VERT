import { prisma } from "../../lib/prisma";
import { CreateProduitDto, UpdateProduitDto, ProduitQueryDto, AddImageDto } from "./produit.schema";

// Protège les listes publiques/admin contre des produits orphelins
// (id_categorie pointe vers une catégorie supprimée ou invalide).
function requireExistingCategorie(where: Record<string, unknown>) {
  return Object.keys(where).length === 0
    ? { categorie: { is: {} } }
    : { AND: [where, { categorie: { is: {} } }] };
}

const PUBLIC_INCLUDE = {
  marque:    { select: { nom: true, slug: true, logo: true } },
  categorie: {
    select: {
      id_categorie: true, nom: true, slug: true,
      parent: { select: { nom: true, slug: true } },
    },
  },
  activite:  { select: { nom: true, slug: true } }, // ← NOUVEAU
  images:    { orderBy: { ordre: "asc" as const } },
} as const;

const ADMIN_INCLUDE = {
  marque:    { select: { nom: true, slug: true } },
  categorie: { select: { nom: true, slug: true } },
  activite:  { select: { nom: true, slug: true } },
  images:    { orderBy: { ordre: "asc" as const } }, // ← toutes les images, pas seulement la principale
} as const;

// Include léger pour la liste admin (seulement l'image principale)
const ADMIN_LIST_INCLUDE = {
  marque:    { select: { nom: true, slug: true } },
  categorie: { select: { nom: true, slug: true } },
  activite:  { select: { nom: true, slug: true } },
  images:    { where: { is_principale: true }, take: 1 },
} as const;

export const produitRepository = {

  // ── Public ─────────────────────────────────────────────────────
  async findAllPublic(params: {
    page: number; limit: number;
    id_marque?: number; id_categorie?: number; id_activite?: number;
    marque_slug?: string; division?: string; search?: string;
  }) {
    const { page, limit, id_marque, id_categorie, id_activite, marque_slug, division, search } = params;
    const where: any = { actif: true };
    if (id_marque)    where.id_marque    = id_marque;
    if (id_categorie) {
      // Filtrage hiérarchique : inclure la catégorie sélectionnée ET tous ses descendants
      const allCats = await prisma.categorie.findMany({ select: { id_categorie: true, parent_id: true } });
      const collectIds = (rootId: number): number[] => {
        const ids: number[] = [rootId];
        const children = allCats.filter(c => c.parent_id === rootId);
        for (const child of children) ids.push(...collectIds(child.id_categorie));
        return ids;
      };
      const catIds = collectIds(id_categorie);
      where.id_categorie = catIds.length === 1 ? catIds[0] : { in: catIds };
    }
    if (id_activite) {
      // Un produit appartient à une activité soit directement (id_activite),
      // soit via sa catégorie (categorie.id_activite)
      where.OR = [
        { id_activite: id_activite },
        { categorie: { id_activite: id_activite } },
      ];
    }
    if (division)     where.division     = division;
    if (marque_slug) {
      const m = await prisma.marque.findUnique({ where: { slug: marque_slug } });
      if (!m) return { produits: [], total: 0 };
      where.id_marque = m.id_marque;
    }
    if (search) {
      const searchClause = [
        { nom:         { contains: search } },
        { description: { contains: search } },
      ];
      // Combiner avec id_activite si présent
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchClause }];
        delete where.OR;
      } else {
        where.OR = searchClause;
      }
    }
    const safeWhere = requireExistingCategorie(where);
    const [total, produits] = await Promise.all([
      prisma.produit.count({ where: safeWhere }),
      prisma.produit.findMany({
        where: safeWhere, skip: (page - 1) * limit, take: limit,
        orderBy: [{ ordre: "asc" }, { nom: "asc" }],
        include: PUBLIC_INCLUDE,
      }),
    ]);
    return { produits, total };
  },

  async findBySlugPublic(slug: string) {
    return prisma.produit.findFirst({
      where:   requireExistingCategorie({ slug }),
      include: {
        marque:    { select: { nom: true, slug: true, logo: true, description: true } },
        activite:  { select: { nom: true, slug: true } }, // ← NOUVEAU
        categorie: {
          include: {
            activite:  { select: { nom: true, slug: true } },
            marque:    { select: { nom: true, slug: true } },
            parent:    { select: { nom: true, slug: true } },
            sous_cats: { select: { nom: true, slug: true } },
          },
        },
        images: { orderBy: { ordre: "asc" } },
      },
    });
  },

  // ── Admin ───────────────────────────────────────────────────────
  async findAll(params: ProduitQueryDto) {
    const { page, limit, id_marque, id_categorie, id_activite, division, search } = params;
    const actif = params.actif === undefined ? undefined : params.actif === "true";
    const where: any = {};
    if (id_marque)           where.id_marque    = id_marque;
    if (id_categorie)        where.id_categorie = id_categorie;
    if (id_activite)         where.id_activite  = id_activite; // ← filtre direct
    if (division)            where.division     = division;
    if (actif !== undefined) where.actif        = actif;
    if (search) {
      where.OR = [
        { nom:         { contains: search } },
        { description: { contains: search } },
      ];
    }
    const safeWhere = requireExistingCategorie(where);
    const [total, produits] = await Promise.all([
      prisma.produit.count({ where: safeWhere }),
      prisma.produit.findMany({
        where: safeWhere, skip: (page - 1) * limit, take: limit,
        orderBy: { ordre: "asc" },
        include: ADMIN_LIST_INCLUDE,  // liste légère — seulement image principale
      }),
    ]);
    return { produits, total };
  },

  async findById(id_produit: number) {
    return prisma.produit.findFirst({
      where:   requireExistingCategorie({ id_produit }),
      include: {
        marque:    true,
        categorie: true,
        activite:  true, // ← NOUVEAU
        images:    { orderBy: { ordre: "asc" } },
      },
    });
  },

  async findBySlug(slug: string) {
    return prisma.produit.findUnique({ where: { slug } });
  },

  // ── Mutations ──────────────────────────────────────────────────
  async create(data: CreateProduitDto) {
    return prisma.produit.create({
      data: { ...data, slug: data.slug.toLowerCase(), actif: true },
      include: {
        marque:    { select: { nom: true } },
        categorie: { select: { nom: true } },
        activite:  { select: { nom: true } },
      },
    });
  },

  async update(id_produit: number, data: UpdateProduitDto) {
    return prisma.produit.update({ where: { id_produit }, data });
  },

  async delete(id_produit: number) {
    return prisma.produit.delete({ where: { id_produit } });
  },

  // ── Images ────────────────────────────────────────────────────
  async addImage(id_produit: number, data: AddImageDto) {
    if (data.is_principale) {
      await prisma.produitImage.updateMany({ where: { id_produit }, data: { is_principale: false } });
    }
    return prisma.produitImage.create({ data: { id_produit, ...data } });
  },

  async updateImage(id_imgP: number, data: Partial<{ alt: string | null; is_principale: boolean; ordre: number }>) {
    return prisma.produitImage.update({ where: { id_imgP }, data });
  },

  async setPrincipale(id_produit: number, id_imgP: number) {
    await prisma.produitImage.updateMany({ where: { id_produit }, data: { is_principale: false } });
    return prisma.produitImage.update({ where: { id_imgP }, data: { is_principale: true } });
  },

  async deleteImage(id_imgP: number) {
    return prisma.produitImage.delete({ where: { id_imgP } });
  },
};
