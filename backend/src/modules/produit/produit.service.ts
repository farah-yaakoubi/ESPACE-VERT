import { logAudit } from "../../lib/audit";
import { getEmbedding } from "../../lib/embedding";
import { paginate } from "../../lib/pagination";
import { prisma } from "../../lib/prisma";
import { categorieService } from "../categorie/categorie.service";
import { produitRepository } from "./produit.repository";
import {
    AddImageDto,
    CreateProduitDto,
    ProduitPublicQueryDto,
    ProduitQueryDto,
    UpdateProduitDto,
} from "./produit.schema";

// ── Génération du SKU ──────────────────────────────────────────────────────────
// Format : <PREFIX_MARQUE>-<PREFIX_ACTIVITE>-<SEQUENCE 4 chiffres>
// Exemple : FV-FERT-0001  (Fertivert · Fertilisation · 1er produit de cette combinaison)
//           PV-PULV-0003  (Pulvert · Pulvérisation · 3e produit de cette combinaison)
//           MT-IRR-0012   (Matar · Irrigation · 12e produit de cette combinaison)
//
// Règles de construction des préfixes :
//   - On retire les tirets du slug, on prend les premières lettres en majuscules.
//   - Marque   : 2–4 lettres (ex: "fertivert" → "FV" via initiales, "pulvert" → "PV")
//   - Activité : 2–4 lettres (ex: "fertilisation" → "FERT", "irrigation" → "IRR")
//   - Séquence : comptage global de tous les produits partageant ce préfixe MARQUE-ACTIVITE,
//                ce qui garantit l'unicité même après des suppressions.
//
// Algorithme anti-collision :
//   1. Compter les SKU existants qui commencent par "MARQUE-ACTIVITE-".
//   2. Incrémenter jusqu'à trouver un SKU libre (protection rollback/concurrent).

/** Extrait un préfixe court et lisible depuis un slug.
 *  Stratégie : initiales des mots pour les slugs composés (fertivert → FV),
 *  sinon premières lettres du mot unique (pulvert → PULV, irrigation → IRR). */
function slugToPrefix(slug: string, maxLen: number): string {
  // Séparer sur les tirets
  const parts = slug.toLowerCase().split("-").filter(Boolean);

  if (parts.length >= 2) {
    // Slug composé → initiales (fertivert → F+V, espace-vert → E+V)
    // Mais si une partie fait ≥ 3 lettres et l'autre 1 seule, on prend les 2 premières du mot le plus long
    const initials = parts.map(p => p[0].toUpperCase()).join("");
    return initials.slice(0, maxLen).padEnd(2, "X");
  }

  // Mot unique : extraire les consonnes ou les premières lettres
  const word = parts[0].replace(/[aeiou]/gi, "");      // retirer les voyelles
  const raw  = word.length >= 2 ? word : parts[0];      // fallback si tout voyelles
  return raw.slice(0, maxLen).toUpperCase().padEnd(2, "X");
}

async function generateSku(id_categorie: number): Promise<string> {
  const categorie = await prisma.categorie.findUnique({
    where:   { id_categorie },
    select:  {
      id_activite: true,
      activite:    { select: { slug: true, nom: true } },
      marque:      { select: { slug: true, nom: true } },
    },
  });

  // 2. Construire les préfixes
  // Une catégorie peut n'avoir aucune marque associée (ex: catégorie rattachée
  // uniquement à une activité) → on retombe sur un préfixe générique "GEN".
  const prefixMarque   = categorie?.marque
    ? slugToPrefix(categorie.marque.slug, 4)
    : "GEN";
  const prefixActivite = categorie?.activite
    ? slugToPrefix(categorie.activite.slug, 4)
    : "GEN";

  const base = `${prefixMarque}-${prefixActivite}`;   // ex: "FV-FERT"

  // 3. Compter tous les SKU existants avec ce préfixe (séquence globale, pas mensuelle)
  //    → garantit que supprimer un produit ne crée pas de trou réutilisé
  const count = await prisma.produit.count({
    where: { sku: { startsWith: base + "-" } } as any,
  });

  // 4. Trouver le prochain numéro libre (protection anti-collision concurrente)
  let seq = count + 1;
  let sku = `${base}-${String(seq).padStart(4, "0")}`;

  while (await prisma.produit.findFirst({ where: { sku } as any })) {
    seq++;
    sku = `${base}-${String(seq).padStart(4, "0")}`;
  }

  return sku;  // ex: "FV-FERT-0001"
}

async function syncProduitEmbedding(idProduit: number): Promise<void> {
  const produit = await prisma.produit.findUnique({
    where: { id_produit: idProduit },
    include: { categorie: { include: { marque: true } } },
  });

  if (!produit) return;

  const chunk = [
    produit.nom,
    produit.categorie?.marque?.nom,
    produit.categorie?.nom,
    produit.usage,
    produit.description,
    produit.descriptif_var,
    produit.type_semence,
    produit.fiche_technique,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!chunk) return;

  const vector = await getEmbedding(chunk);
  const db = prisma as any;

  await db.produitEmbedding.upsert({
    where: { id_produit: idProduit },
    create: { id_produit: idProduit, chunk, embedding: vector },
    update: { chunk, embedding: vector },
  });
}

async function trySyncProduitEmbedding(idProduit: number): Promise<void> {
  try {
    await syncProduitEmbedding(idProduit);
  } catch (e) {
    console.error("[produit.service] syncProduitEmbedding error", e);
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

export const produitService = {

  /** Prévisualisation du SKU sans créer le produit — utilisé par le formulaire admin. */
  async previewSku(id_categorie: number): Promise<{ sku: string; prefix_marque: string; prefix_activite: string; sequence: number }> {
    const categorie = await prisma.categorie.findUnique({
      where:  { id_categorie },
      select: {
        id_activite: true,
        activite: { select: { slug: true, nom: true } },
        marque: { select: { slug: true, nom: true } },
      },
    });

    if (!categorie) throw { status: 404, message: "Catégorie introuvable" };

    // La marque est optionnelle : une catégorie rattachée uniquement à une
    // activité (sans marque propre) utilise un préfixe générique "GEN".
    const prefixMarque   = categorie.marque ? slugToPrefix(categorie.marque.slug, 4) : "GEN";
    const prefixActivite = categorie.activite ? slugToPrefix(categorie.activite.slug, 4) : "GEN";
    const base           = `${prefixMarque}-${prefixActivite}`;

    const count    = await prisma.produit.count({ where: { sku: { startsWith: base + "-" } } as any });
    const sequence = count + 1;
    const sku      = `${base}-${String(sequence).padStart(4, "0")}`;

    return { sku, prefix_marque: prefixMarque, prefix_activite: prefixActivite, sequence };
  },

  async listPublic(params: ProduitPublicQueryDto) {
    const { produits, total } = await produitRepository.findAllPublic({
      page:         params.page,
      limit:        params.limit,
      id_marque:    params.id_marque,
      id_categorie: params.id_categorie,
      id_activite:  params.id_activite,
      marque_slug:  params.marque,
      division:     params.division,
      search:       params.search,
    });
    return { data: produits, meta: paginate(total, params.page, params.limit) };
  },

  async getBySkuPublic(sku: string) {
    const p = await produitRepository.findBySkuPublic(sku);
    if (!p || !p.actif) throw { status: 404, message: "Produit introuvable" };
    return p;
  },

  // Compatibilité slug → redirige via SKU si possible
  async getBySlugPublic(slug: string) {
    const p = await produitRepository.findBySlugPublic(slug);
    if (!p || !p.actif) throw { status: 404, message: "Produit introuvable" };
    return p;
  },

  async list(params: ProduitQueryDto) {
    const { produits, total } = await produitRepository.findAll(params);
    return { data: produits, meta: paginate(total, params.page, params.limit) };
  },

  async getById(id: number) {
    const p = await produitRepository.findById(id);
    if (!p) throw { status: 404, message: "Produit introuvable" };
    return p;
  },

  async create(data: CreateProduitDto, id_admin: number) {
    // Unicité slug
    const existingSlug = await produitRepository.findBySlug(data.slug);
    if (existingSlug) throw { status: 409, message: "Ce slug est déjà utilisé" };

    // Vérifie que la catégorie est une feuille (pas de sous-catégories)
    await categorieService.assertIsLeaf(data.id_categorie);

    // Générer le SKU automatiquement (jamais fourni par le client)
    // On passe id_categorie pour extraire le préfixe activité (ex: FV-FERT-0001)
    const sku = await generateSku(data.id_categorie);

    // Récupérer la catégorie pour connaître l'activité et la marque associées.
    // La marque est optionnelle : une catégorie peut n'être rattachée qu'à une
    // activité (ex: catégories de semences génériques sans marque propre).
    const categorie = await prisma.categorie.findUnique({
      where: { id_categorie: data.id_categorie },
      select: { id_activite: true, id_marque: true },
    });
    if (!categorie) {
      throw { status: 404, message: "Catégorie introuvable" };
    }

    // Créer le produit et, si nécessaire, créer la liaison ActiviteMarque dans une transaction
    const produit = await prisma.$transaction(async (tx) => {
      const p = await tx.produit.create({
        data: { ...data, sku, slug: data.slug.toLowerCase(), actif: true },
        include: {
          categorie: { select: { nom: true, marque: { select: { nom: true } } } },
        },
      });

      const id_activite = categorie?.id_activite;
      const id_marque = categorie?.id_marque;
      if (id_marque && id_activite) {
        // cast tx to any because Prisma client needs to be regenerated after schema change
        const t: any = tx as any;
        const exists = await t.activiteMarque.findFirst({ where: { id_activite, id_marque } });
        if (!exists) {
          await t.activiteMarque.create({ data: { id_activite, id_marque } });
        }
      }

      return p;
    });

    await logAudit({
      id_admin, action: "CREATE", entity_name: "produit",
      entity_id: produit.id_produit,
      detail: { nom: data.nom, sku, id_categorie: data.id_categorie, id_marque: categorie.id_marque ?? null },
    });
    await trySyncProduitEmbedding(produit.id_produit);
    return produit;
  },

  async update(id: number, data: UpdateProduitDto, id_admin: number) {
    const before = await produitService.getById(id);

    // Si la catégorie change, vérifier que la nouvelle est une feuille
    if (data.id_categorie && data.id_categorie !== before.id_categorie) {
      await categorieService.assertIsLeaf(data.id_categorie);
    }

    // Le SKU n'est jamais modifiable
    const { sku: _sku, ...safeData } = data as any;

    const produit = await produitRepository.update(id, safeData);

    // Après mise à jour, s'assurer que la table de jonction activites_marques
    // contient la paire (id_activite, id_marque) si applicable.
    try {
      const prodFull = await produitRepository.findById(id);
      const id_activite = prodFull?.categorie?.id_activite ?? null;
      const id_marque = prodFull?.categorie?.id_marque ?? null;
      if (id_activite && id_marque) {
        const exists = await prisma.activiteMarque.findFirst({ where: { id_activite, id_marque } });
        if (!exists) {
          await prisma.activiteMarque.create({ data: { id_activite, id_marque } });
        }
      }
    } catch (e) {
      // Ne pas faire échouer la mise à jour si la création du lien échoue.
      console.error('[produit.service] error ensuring activiteMarque', e);
    }

    await logAudit({
      id_admin, action: "UPDATE", entity_name: "produit", entity_id: id,
      detail: {
        before: { nom: before.nom, actif: before.actif },
        after:  { nom: data.nom,   actif: data.actif   },
      },
    });
    await trySyncProduitEmbedding(id);
    return produit;
  },

  async delete(id: number, id_admin: number) {
    const before = await produitService.getById(id);
    await produitRepository.delete(id);
    await logAudit({
      id_admin, action: "DELETE", entity_name: "produit", entity_id: id,
      detail: {
        snapshot: {
          nom:          before.nom,
          sku:          (before as any).sku,
          slug:         before.slug,
          id_categorie: before.id_categorie,
          id_marque:    before.categorie?.id_marque,
          division:     before.division,
          actif:        before.actif,
        },
      },
    });
  },

  /**
   * Résout les 3 slugs de l'URL canonique /activites/[activite]/[marque]/[produit]
   * et renvoie le produit si la hiérarchie est cohérente.
   */
  async resolvePath(activiteSlug: string, marqueSlug: string, produitSlug: string) {
    const produit = await produitRepository.findBySlugPublic(produitSlug);
    if (!produit || !produit.actif) throw { status: 404, message: "Produit introuvable" };

    // Vérifier que le produit appartient bien à la marque
    if (produit.marque?.slug !== marqueSlug)
      throw { status: 404, message: "Ce produit n'appartient pas à cette marque" };

    // Vérifier que l'activité correspond à celle de la catégorie du produit
    // (on cherche sur la catégorie et ses ancêtres pour couvrir les sous-catégories)
    let cat: any = (produit as any).categorie;
    let foundActiviteSlug: string | null = null;
    if (cat) {
      // remonter tant que nécessaire
      while (cat) {
        if (cat.activite && cat.activite.slug) {
          foundActiviteSlug = cat.activite.slug;
          break;
        }
        if (!cat.parent_id) break;
        // récupérer le parent avec son activite
        cat = await prisma.categorie.findUnique({ where: { id_categorie: cat.parent_id }, include: { activite: true, parent: true } });
      }
    }

    if (foundActiviteSlug !== activiteSlug)
      throw { status: 404, message: "Ce produit n'appartient pas à cette activité" };

    return produit;
  },

  async addImage(id: number, data: AddImageDto, id_admin: number) {
    const produit = await produitRepository.addImage(id, data);
    await logAudit({ id_admin, action: "ADD_IMAGE", entity_name: "produit", entity_id: id, detail: { url: data.url } });
    return produit;
  },

  async updateImage(id_imgP: number, data: { is_principale?: boolean; alt?: string | null }, id_admin: number) {
    const image = await produitRepository.updateImage(id_imgP, data);
    await logAudit({ id_admin, action: "UPDATE_IMAGE", entity_name: "produit_image", entity_id: id_imgP });
    return image;
  },

  async setPrincipale(id_produit: number, id_imgP: number, id_admin: number) {
    const image = await produitRepository.setPrincipale(id_produit, id_imgP);
    await logAudit({ id_admin, action: "SET_PRINCIPALE", entity_name: "produit_image", entity_id: id_imgP });
    return image;
  },

  async deleteImage(id_imgP: number, id_admin: number) {
    await produitRepository.deleteImage(id_imgP);
    await logAudit({ id_admin, action: "DELETE", entity_name: "produit_image", entity_id: id_imgP });
  },
};