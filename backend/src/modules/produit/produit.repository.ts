import { prisma } from  "../../lib/prisma";
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
// IMPORTANT : id_categorie et id_marque sont aussi renvoyés au niveau produit
// (champs scalaires natifs de la table) pour que le formulaire d'édition puisse
// pré-sélectionner la catégorie et la marque sans faire de recherche par nom.
const ADMIN_LIST_INCLUDE = {
  marque:    { select: { nom: true, slug: true } },
  categorie: { select: { id_categorie: true, nom: true, slug: true } },
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
      // Récupérer TOUTES les catégories appartenant à cette activité
      // + leurs descendants (sous-catégories profondes sans id_activite direct)
      const activiteCats = await prisma.categorie.findMany({
        where:  { id_activite },
        select: { id_categorie: true },
      });
      const allCats = await prisma.categorie.findMany({
        select: { id_categorie: true, parent_id: true },
      });
      const collectCatIds = (parentId: number): number[] => {
        const children = allCats.filter(c => c.parent_id === parentId);
        return [parentId, ...children.flatMap(c => collectCatIds(c.id_categorie))];
      };
      const allCatIds = activiteCats.flatMap(c => collectCatIds(c.id_categorie));

      where.OR = [
        { id_activite: id_activite },
        { id_categorie: { in: allCatIds.length > 0 ? allCatIds : [-1] } },
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