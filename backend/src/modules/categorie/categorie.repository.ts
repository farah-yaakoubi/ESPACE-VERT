// src/modules/categorie/categorie.repository.ts
// Remplace l'ancienne version — même interface publique, nouvelles fonctions d'arbre.
import { prisma } from "../../lib/prisma";
import { CreateCategorieDto, UpdateCategorieDto, CategorieQueryDto } from "./categorie.schema";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Nœud "plat" retourné par Prisma avant construction de l'arbre */
type CatFlat = {
  id_categorie: number;
  nom: string;
  slug: string;
  description: string | null;
  image: string | null;
  id_marque: number | null;
  id_activite: number | null;
  parent_id: number | null;
  ordre: number;
  actif: boolean;
  created_at: Date;
  [key: string]: unknown;
};

/** Nœud enrichi utilisé dans l'arbre renvoyé aux clients */
export type CatNode = CatFlat & { sous_cats: CatNode[] };

// ─── Utilitaire buildTree (O(n)) ─────────────────────────────────────────────
//
// STRATÉGIE ANTI N+1 :
//   On charge TOUTES les catégories d'une marque en UNE seule requête SQL,
//   puis on reconstitue l'arbre en mémoire avec une Map.
//   → 1 query quelle que soit la profondeur de l'arbre.
//
//   Alternative (Prisma include imbriqué) : simple à écrire mais génère
//   autant de requêtes que de niveaux × nœuds → à éviter en production.

function buildTree(flat: CatFlat[]): CatNode[] {
  const map = new Map<number, CatNode>();
  flat.forEach(c => map.set(c.id_categorie, { ...c, sous_cats: [] }));

  const roots: CatNode[] = [];
  map.forEach(node => {
    if (node.parent_id !== null && map.has(node.parent_id)) {
      map.get(node.parent_id)!.sous_cats.push(node);
    } else {
      roots.push(node);
    }
  });

  // Tri récursif par ordre à chaque niveau
  const sort = (nodes: CatNode[]): CatNode[] =>
    nodes.sort((a, b) => a.ordre - b.ordre).map(n => ({ ...n, sous_cats: sort(n.sous_cats) }));

  return sort(roots);
}

// ─── Sélecteur partagé ───────────────────────────────────────────────────────

const catSelect = {
  id_categorie: true,
  nom:          true,
  slug:         true,
  description:  true,
  image:        true,
  id_marque:    true,
  id_activite:  true,
  parent_id:    true,
  ordre:        true,
  actif:        true,
  created_at:   true,
} as const;

// ─── Repository ──────────────────────────────────────────────────────────────

export const categorieRepository = {

  // ── PUBLIC ─────────────────────────────────────────────────────────────────

  /** Liste publique (actif:true). Si tree=true → arbre imbriqué. */
  async findAllPublic(params: CategorieQueryDto) {
    const where: Record<string, unknown> = { actif: true };
    if (params.id_marque)   where.id_marque   = params.id_marque;
    if (params.id_activite) where.id_activite = params.id_activite;

    const rows = await prisma.categorie.findMany({
      where,
      orderBy: [{ ordre: "asc" }, { nom: "asc" }],
      select: {
        ...catSelect,
        marque:   { select: { nom: true, slug: true } },
        activite: { select: { nom: true, slug: true } },
        _count:   { select: { produits: true } },
      },
    });

    return params.tree ? buildTree(rows as unknown as CatFlat[]) : rows;
  },

  // ── ARBRE COMPLET D'UNE MARQUE ─────────────────────────────────────────────
  //
  // Endpoint dédié : GET /api/public/marques/:slug/tree
  // Retourne l'arbre Marque → Catégories → Sous-cats… → Produits (feuilles).
  //
  // 2 requêtes SQL au total :
  //   1. Charger toutes les catégories de la marque
  //   2. Charger tous les produits de la marque
  // Puis assemblage en mémoire.

  async findTreeByMarqueSlug(slug: string) {
    // 1. Vérifier que la marque existe
    const marque = await prisma.marque.findUnique({
      where:  { slug },
      select: { id_marque: true, nom: true, slug: true, logo: true, description: true },
    });
    if (!marque) return null;

    // 2. Toutes les catégories de la marque — UNE seule requête
    const categories = await prisma.categorie.findMany({
      where:   { id_marque: marque.id_marque, actif: true },
      orderBy: [{ ordre: "asc" }, { nom: "asc" }],
      select:  catSelect,
    });

    // 3. Tous les produits de la marque — UNE seule requête
    const produits = await prisma.produit.findMany({
      where:   { id_marque: marque.id_marque, actif: true },
      orderBy: [{ ordre: "asc" }, { nom: "asc" }],
      select: {
        id_produit:   true,
        nom:          true,
        slug:         true,
        description:  true,
        id_categorie: true,
        division:     true,
        tags:         true,
        ordre:        true,
        images: {
          orderBy: [{ is_principale: "desc" }, { ordre: "asc" }],
          take:    1,
          select:  { url: true, alt: true },
        },
      },
    });

    // 4. Construire l'arbre de catégories
    const tree = buildTree(categories as unknown as CatFlat[]);

    // 5. Injecter les produits dans les nœuds-feuilles correspondants
    const produitsByCategorie = new Map<number, typeof produits>();
    produits.forEach(p => {
      const list = produitsByCategorie.get(p.id_categorie) ?? [];
      list.push(p);
      produitsByCategorie.set(p.id_categorie, list);
    });

    const attachProduits = (nodes: CatNode[]): (CatNode & { produits: typeof produits })[] =>
      nodes.map(node => ({
        ...node,
        produits:  produitsByCategorie.get(node.id_categorie) ?? [],
        sous_cats: attachProduits(node.sous_cats as CatNode[]),
      }));

    return {
      ...marque,
      categories: attachProduits(tree),
    };
  },

  // ── ADMIN ──────────────────────────────────────────────────────────────────

  async findAll(params: CategorieQueryDto) {
    const where: Record<string, unknown> = {};
    if (params.id_marque)   where.id_marque   = params.id_marque;
    if (params.id_activite) where.id_activite = params.id_activite;
    if (params.scope === "root") where.parent_id = null;

    return prisma.categorie.findMany({
      where,
      orderBy: [{ parent_id: "asc" }, { ordre: "asc" }, { nom: "asc" }],
      include: {
        marque:   { select: { nom: true, slug: true } },
        activite: { select: { nom: true, slug: true } },
        parent:   { select: { nom: true, id_categorie: true } },
        _count:   { select: { produits: true, sous_cats: true } },
      },
    });
  },

  async findById(id_categorie: number) {
    return prisma.categorie.findUnique({
      where:   { id_categorie },
      include: {
        marque:    true,
        activite:  true,
        parent:    true,
        sous_cats: { orderBy: { ordre: "asc" } },
        produits:  { take: 5, include: { images: { where: { is_principale: true }, take: 1 } } },
        _count:    { select: { produits: true, sous_cats: true } },
      },
    });
  },

  async findBySlug(slug: string) {
    return prisma.categorie.findUnique({ where: { slug } });
  },

  async isLeaf(id_categorie: number): Promise<boolean> {
    const count = await prisma.categorie.count({ where: { parent_id: id_categorie } });
    return count === 0;
  },

  async create(data: CreateCategorieDto) {
    return prisma.categorie.create({
      data: { ...data, slug: data.slug.toLowerCase(), actif: true },
    });
  },

  async update(id_categorie: number, data: UpdateCategorieDto) {
    return prisma.categorie.update({ where: { id_categorie }, data });
  },

  async delete(id_categorie: number) {
    // Grâce au CASCADE en DB, toute la descendance est supprimée automatiquement.
    return prisma.categorie.delete({ where: { id_categorie } });
  },
};
