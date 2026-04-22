import { prisma } from "../../lib/prisma";
import { CreateProduitDto, UpdateProduitDto, ProduitQueryDto, AddImageDto } from "./produit.schema";

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
  activite:  { select: { nom: true, slug: true } }, // ← NOUVEAU
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
    if (id_categorie) where.id_categorie = id_categorie;
    if (id_activite)  where.id_activite  = id_activite; // ← filtre direct
    if (division)     where.division     = division;
    if (marque_slug) {
      const m = await prisma.marque.findUnique({ where: { slug: marque_slug } });
      if (!m) return { produits: [], total: 0 };
      where.id_marque = m.id_marque;
    }
    if (search) {
      where.OR = [
        { nom:         { contains: search } },
        { description: { contains: search } },
      ];
    }
    const [total, produits] = await Promise.all([
      prisma.produit.count({ where }),
      prisma.produit.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: [{ ordre: "asc" }, { nom: "asc" }],
        include: PUBLIC_INCLUDE,
      }),
    ]);
    return { produits, total };
  },

  async findBySlugPublic(slug: string) {
    return prisma.produit.findUnique({
      where:   { slug },
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
    const [total, produits] = await Promise.all([
      prisma.produit.count({ where }),
      prisma.produit.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { ordre: "asc" },
        include: ADMIN_INCLUDE,
      }),
    ]);
    return { produits, total };
  },

  async findById(id_produit: number) {
    return prisma.produit.findUnique({
      where:   { id_produit },
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

  async deleteImage(id_imgP: number) {
    return prisma.produitImage.delete({ where: { id_imgP } });
  },
};
