import { prisma } from "../../lib/prisma";
import { AddImageDto, CreateProduitDto, ProduitQueryDto, UpdateProduitDto } from "./produit.schema";

const PUBLIC_INCLUDE = {
  categorie: {
    select: {
      id_categorie: true, nom: true, slug: true, translations: true, id_marque: true,
      parent: { select: { nom: true, slug: true, translations: true } },
      activite: { select: { id_activite: true, nom: true, slug: true } },
      marque: { select: { nom: true, slug: true, logo: true, translations: true } },
    },
  },
  images:    { orderBy: { ordre: "asc" as const } },
} as const;

const ADMIN_INCLUDE = {
  categorie: { select: { nom: true, slug: true, marque: { select: { nom: true, slug: true } } } },
  images:    { orderBy: { ordre: "asc" as const } },
} as const;

// Include léger pour la liste admin (seulement l'image principale)
// La marque est héritée de la catégorie.
const ADMIN_LIST_INCLUDE = {
  categorie: {
    select: {
      id_categorie: true, nom: true, slug: true, id_marque: true,
      marque: { select: { nom: true, slug: true } },
      activite: { select: { id_activite: true, nom: true, slug: true } },
    },
  },
  images:    { where: { is_principale: true }, take: 1 },
} as const;

const PRODUCT_CATALOG_ORDER = [
  { ordre: "asc" as const },
  { created_at: "asc" as const },
  { id_produit: "asc" as const },
];

function withInheritedRefs<T extends { categorie?: any }>(produit: T) {
  return {
    ...produit,
    marque: produit.categorie?.marque ?? null,
    activite: produit.categorie?.activite ?? null,
  };
}

type CategoryPathEntry = { id_categorie: number; nom: string; slug: string; translations: any };

// Charge TOUTES les catégories en une seule requête (table légère, une
// centaine de lignes) et construit une map id → {nom, slug, parent_id, ...}.
// Sert de base à `buildCategoryPath` / `buildCategoryPathsForMany` pour
// remonter la chaîne de parents en mémoire, sans requête supplémentaire par
// catégorie ni par produit (pas de N+1).
async function loadCategoryMap() {
  const cats = await prisma.categorie.findMany({
    select: { id_categorie: true, nom: true, slug: true, translations: true, parent_id: true },
  });
  return new Map(cats.map((c) => [c.id_categorie, c]));
}

// Remonte toute la chaîne de catégories parentes (via parent_id) jusqu'à la
// racine, quelle que soit la profondeur — contrairement à un simple
// `include: { parent: true } }` qui ne remonte qu'un seul niveau. Utilisé
// pour reconstituer le fil d'Ariane complet d'un produit (ex. Semences
// maraîchères > Pro > Hybride > Tomate > <produit>), tel qu'il existe
// réellement en base, quel que soit le nombre de niveaux intermédiaires.
function pathFromMap(
  categorieId: number | null | undefined,
  map: Map<number, { id_categorie: number; nom: string; slug: string; translations: any; parent_id: number | null }>
): CategoryPathEntry[] {
  const path: CategoryPathEntry[] = [];
  let currentId = categorieId ?? null;
  const seen = new Set<number>(); // garde-fou anti-boucle si des données incohérentes existaient
  while (currentId && !seen.has(currentId) && path.length < 12) {
    seen.add(currentId);
    const cat = map.get(currentId);
    if (!cat) break;
    path.unshift({ id_categorie: cat.id_categorie, nom: cat.nom, slug: cat.slug, translations: cat.translations });
    currentId = cat.parent_id;
  }
  return path;
}

// Version "produit unique" (fiche détail) : charge la map une fois puis
// calcule le chemin — même coût qu'avant (une requête), juste factorisé.
async function buildCategoryPath(categorieId: number | null | undefined): Promise<CategoryPathEntry[]> {
  const map = await loadCategoryMap();
  return pathFromMap(categorieId, map);
}

// Version "liste de produits" : UNE seule requête pour charger l'arbre des
// catégories, puis calcule le chemin de chacun des produits fournis en
// mémoire — évite une requête par produit affiché (pas de N+1) tout en
// donnant à chaque élément de liste son `categoriePath` complet, nécessaire
// pour construire l'URL canonique côté frontend sans redirection.
async function attachCategoryPaths<T extends { categorie?: { id_categorie?: number } | null }>(
  produits: T[]
): Promise<(T & { categoriePath: CategoryPathEntry[] })[]> {
  if (produits.length === 0) return [];
  const map = await loadCategoryMap();
  return produits.map((p) => ({ ...p, categoriePath: pathFromMap(p.categorie?.id_categorie, map) }));
}

async function collectCategorieIds(filters: { id_categorie?: number; id_activite?: number; id_marque?: number; actifOnly?: boolean }) {
  const where: any = {};
  if (filters.actifOnly) where.actif = true;

  const allCats = await prisma.categorie.findMany({
    where,
    select: { id_categorie: true, parent_id: true, id_activite: true, id_marque: true },
  });

  const directIds = new Set<number>();
  if (filters.id_categorie) directIds.add(filters.id_categorie);
  if (filters.id_activite) {
    allCats
      .filter(c => c.id_activite === filters.id_activite)
      .forEach(c => directIds.add(c.id_categorie));
  }
  if (filters.id_marque) {
    allCats
      .filter(c => c.id_marque === filters.id_marque)
      .forEach(c => directIds.add(c.id_categorie));
  }

  const collected = new Set<number>();
  const collectDescendants = (rootId: number) => {
    if (collected.has(rootId)) return;
    collected.add(rootId);
    allCats
      .filter(c => c.parent_id === rootId)
      .forEach(c => collectDescendants(c.id_categorie));
  };

  directIds.forEach(collectDescendants);
  return [...collected];
}

/**
 * Recherche globale : retourne l'ensemble des id_categorie dont le nom,
 * la marque ou l'activité correspond au terme recherché — plus toutes
 * leurs sous-catégories descendantes (pour qu'une recherche sur une
 * catégorie parente ("Jardinage") remonte aussi les produits rangés
 * dans ses sous-catégories ("Tondeuses", "Débroussailleuses", …)).
 */
async function collectCategorieIdsMatchingSearch(search: string, actifOnly = true) {
  const where: any = {};
  if (actifOnly) where.actif = true;

  const allCats = await prisma.categorie.findMany({
    where,
    select: {
      id_categorie: true, parent_id: true, nom: true,
      marque:   { select: { nom: true } },
      activite: { select: { nom: true } },
    },
  });

  const term = search.trim().toLowerCase();
  if (!term) return [];

  const directIds = allCats
    .filter(c =>
      c.nom.toLowerCase().includes(term) ||
      c.marque?.nom?.toLowerCase().includes(term) ||
      c.activite?.nom?.toLowerCase().includes(term)
    )
    .map(c => c.id_categorie);

  const collected = new Set<number>();
  const collectDescendants = (rootId: number) => {
    if (collected.has(rootId)) return;
    collected.add(rootId);
    allCats
      .filter(c => c.parent_id === rootId)
      .forEach(c => collectDescendants(c.id_categorie));
  };
  directIds.forEach(collectDescendants);
  return [...collected];
}

export const produitRepository = {

  // ── Public ─────────────────────────────────────────────────────
  async findAllPublic(params: {
    page: number; limit: number;
    id_marque?: number; id_categorie?: number; id_activite?: number;
    marque_slug?: string; division?: string; search?: string;
  }) {
    const { page, limit, id_marque, id_categorie, id_activite, marque_slug, division, search } = params;
    const where: any = { actif: true };

    if (marque_slug) {
      const m = await prisma.marque.findUnique({ where: { slug: marque_slug } });
      if (!m) return { produits: [], total: 0 };
      where.id_categorie = { in: await collectCategorieIds({ id_marque: m.id_marque, actifOnly: true }) };
    } else if (id_marque || id_categorie || id_activite) {
      const catIds = await collectCategorieIds({ id_categorie, id_activite, id_marque, actifOnly: true });
      where.id_categorie = catIds.length > 0 ? { in: catIds } : -1;
    }

    if (division) where.division = division;

    if (search) {
      // Recherche globale : nom / description du produit, OU catégorie
      // (+ marque / activité de cette catégorie, + toutes ses sous-catégories).
      const matchingCatIds = await collectCategorieIdsMatchingSearch(search, true);
      where.OR = [
        { nom:         { contains: search } },
        { description: { contains: search } },
        ...(matchingCatIds.length > 0 ? [{ id_categorie: { in: matchingCatIds } }] : []),
      ];
    }
    const [total, produits] = await Promise.all([
      prisma.produit.count({ where }),
      prisma.produit.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: PRODUCT_CATALOG_ORDER,
        include: PUBLIC_INCLUDE,
      }),
    ]);
    const withPaths = await attachCategoryPaths(produits.map(withInheritedRefs));
    return { produits: withPaths, total };
  },

  async findBySlugPublic(slug: string) {
    const produit = await prisma.produit.findFirst({
      where:   { slug },
      include: {
        categorie: {
          include: {
            activite:  { select: { id_activite: true, nom: true, slug: true } },
            marque:    { select: { nom: true, slug: true, logo: true, description: true, translations: true } },
            parent:    { select: { nom: true, slug: true, translations: true } },
            sous_cats: { select: { nom: true, slug: true, translations: true } },
          },
        },
        images: { orderBy: { ordre: "asc" } },
      },
    });
    if (!produit) return null;
    const categoriePath = await buildCategoryPath(produit.categorie?.id_categorie);
    return { ...withInheritedRefs(produit), categoriePath };
  },

  async findBySkuPublic(sku: string) {
    const produit = await prisma.produit.findFirst({
      where:   { sku } as any,
      include: {
        categorie: {
          include: {
            activite:  { select: { id_activite: true, nom: true, slug: true } },
            marque:    { select: { nom: true, slug: true, logo: true, description: true, translations: true } },
            parent:    { select: { nom: true, slug: true, translations: true } },
            sous_cats: { select: { nom: true, slug: true, translations: true } },
          },
        },
        images: { orderBy: { ordre: "asc" } },
      },
    });
    if (!produit) return null;
    const categoriePath = await buildCategoryPath(produit.categorie?.id_categorie);
    return { ...withInheritedRefs(produit), categoriePath };
  },

  async findBySku(sku: string) {
    return prisma.produit.findFirst({ where: { sku } as any });
  },

  // ── Admin ───────────────────────────────────────────────────────
  async findAll(params: ProduitQueryDto) {
    const { page, limit, id_marque, id_categorie, id_activite, division, search } = params;
    const actif = params.actif === undefined ? undefined : params.actif === "true";
    const where: any = {};
    if (id_marque || id_categorie || id_activite) {
      const catIds = await collectCategorieIds({ id_categorie, id_activite, id_marque });
      where.id_categorie = catIds.length > 0 ? { in: catIds } : -1;
    }
    if (division)            where.division     = division;
    if (actif !== undefined) where.actif        = actif;
    if (search) {
      const matchingCatIds = await collectCategorieIdsMatchingSearch(search, false);
      where.OR = [
        { nom:         { contains: search } },
        { description: { contains: search } },
        ...(matchingCatIds.length > 0 ? [{ id_categorie: { in: matchingCatIds } }] : []),
      ];
    }
    const [total, produits] = await Promise.all([
      prisma.produit.count({ where }),
      prisma.produit.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: PRODUCT_CATALOG_ORDER,
        include: ADMIN_LIST_INCLUDE,  // liste légère — seulement image principale
      }),
    ]);
    return { produits: produits.map(withInheritedRefs), total };
  },

  async findById(id_produit: number) {
    const produit = await prisma.produit.findFirst({
      where:   { id_produit },
      include: {
        categorie: { include: { marque: true, activite: true } },
        images:    { orderBy: { ordre: "asc" } },
      },
    });
    return produit ? withInheritedRefs(produit) : null;
  },

  async findBySlug(slug: string) {
    return prisma.produit.findUnique({ where: { slug } });
  },

  // ── Mutations ──────────────────────────────────────────────────
  async create(data: CreateProduitDto & { sku: string }) {
    const produit = await prisma.produit.create({
      data: { ...data, slug: data.slug.toLowerCase(), actif: true },
      include: {
        categorie: { select: { nom: true, marque: { select: { nom: true } } } },
      },
    });
    return withInheritedRefs(produit);
  },

  async update(id_produit: number, data: UpdateProduitDto) {
    // Extraire les IDs de relation — Prisma update() veut connect/disconnect, pas les scalaires directs
    const { id_categorie, id_marque, ...rest } = data as any;
    const relData: any = { ...rest };
    if (id_categorie !== undefined && id_categorie !== null)
      relData.categorie = { connect: { id_categorie } };
    return prisma.produit.update({ where: { id_produit }, data: relData });
  },

  async delete(id_produit: number) {
    // Récupérer toutes les images avant suppression pour nettoyer les fichiers physiques
    const images = await prisma.produitImage.findMany({
      where: { id_produit },
      select: { url: true },
    });

    const deleted = await prisma.produit.delete({ where: { id_produit } });

    // Supprimer les fichiers physiques après suppression en DB
    if (images.length > 0) {
      const { default: fs } = await import("fs");
      const { default: path } = await import("path");

      for (const img of images) {
        if (!img.url) continue;
        try {
          let filePath: string | null = null;

          if (img.url.startsWith("http://") || img.url.startsWith("https://")) {
            const { URL } = await import("url");
            const parsed = new URL(img.url);
            if (parsed.pathname.startsWith("/uploads/")) {
              filePath = path.join(process.cwd(), parsed.pathname.replace(/^\//, ""));
            }
          } else if (img.url.startsWith("/uploads/")) {
            filePath = path.join(process.cwd(), img.url.replace(/^\//, ""));
          }

          if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch {
          // Ne pas bloquer si la suppression d'un fichier échoue
        }
      }
    }

    return deleted;
  },

  // ── Images ────────────────────────────────────────────────────
  async addImage(id_produit: number, data: AddImageDto) {
    if (data.is_principale) {
      await prisma.produitImage.updateMany({ where: { id_produit }, data: { is_principale: false } });
    }
    return prisma.produitImage.create({ data: { id_produit, ...data } });
  },

  async updateImage(id_imgP: number, data: Partial<{ alt: string | null; is_principale: boolean; ordre: number; conditionnement: string | null }>) {
    return prisma.produitImage.update({ where: { id_imgP }, data });
  },

  async setPrincipale(id_produit: number, id_imgP: number) {
    await prisma.produitImage.updateMany({ where: { id_produit }, data: { is_principale: false } });
    return prisma.produitImage.update({ where: { id_imgP }, data: { is_principale: true } });
  },

  async deleteImage(id_imgP: number) {
    // Récupérer l'URL avant suppression pour pouvoir effacer le fichier physique
    const img = await prisma.produitImage.findUnique({ where: { id_imgP } });
    const deleted = await prisma.produitImage.delete({ where: { id_imgP } });

    // Supprimer le fichier physique si l'URL pointe vers notre serveur local
    if (img?.url) {
      try {
        const { default: fs } = await import("fs");
        const { default: path } = await import("path");

        let filePath: string | null = null;

        // Cas 1 : URL absolue (http://... ou https://...)
        if (img.url.startsWith("http://") || img.url.startsWith("https://")) {
          const { URL } = await import("url");
          const parsed = new URL(img.url);
          if (parsed.pathname.startsWith("/uploads/")) {
            // parsed.pathname ex: "/uploads/images/abc123.jpg"
            // → on reconstruit le chemin relatif depuis process.cwd()
            const relativePath = parsed.pathname.replace(/^\//, ""); // "uploads/images/abc123.jpg"
            filePath = path.join(process.cwd(), relativePath);
          }
        }
        // Cas 2 : chemin relatif direct (ex: "/uploads/images/abc.jpg")
        else if (img.url.startsWith("/uploads/")) {
          const relativePath = img.url.replace(/^\//, "");
          filePath = path.join(process.cwd(), relativePath);
        }

        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // Ne pas bloquer si la suppression du fichier échoue
      }
    }

    return deleted;
  },
};
