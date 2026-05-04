import { z } from "zod";

export const CreateProduitSchema = z.object({
  nom:                  z.string().min(1).max(200),
  slug:                 z.string().min(1).max(220).regex(/^[a-z0-9-]+$/, "Slug invalide"),
  description:          z.string().optional().nullable(),
  fiche_technique:      z.string().optional().nullable(),
  id_categorie:         z.number().int().positive(),
  id_marque:            z.number().int().positive().optional().nullable(),
  id_activite:          z.number().int().positive().optional().nullable(),
  division:             z.enum(["standard", "pro", "garden"]).default("standard"),
  tags:                 z.array(z.string()).optional().default([]),
  ordre:                z.number().int().min(0).optional().default(0),
  // ── Champs techniques ──────────────────────────────────────────
  sku:                  z.string().max(100).optional().nullable(),
  poids:                z.string().max(50).optional().nullable(),
  nature:               z.string().max(100).optional().nullable(),
  composition_chimique: z.string().optional().nullable(),
  usage:                z.string().optional().nullable(),
  biologique:           z.boolean().optional().nullable(),
  conditionnement:      z.string().max(200).optional().nullable(),
});

export const UpdateProduitSchema = CreateProduitSchema.partial().extend({
  actif: z.boolean().optional(),
});

export const ProduitQuerySchema = z.object({
  page:          z.coerce.number().int().min(1).default(1),
  limit:         z.coerce.number().int().min(1).max(500).default(20),
  id_marque:     z.coerce.number().int().positive().optional(),
  id_categorie:  z.coerce.number().int().positive().optional(),
  id_activite:   z.coerce.number().int().positive().optional(),
  marque:        z.string().optional(),
  division:      z.string().optional(),
  actif:         z.enum(["true","false"]).optional(),
  search:        z.string().optional(),
});

export const ProduitPublicQuerySchema = z.object({
  page:          z.coerce.number().int().min(1).default(1),
  limit:         z.coerce.number().int().min(1).max(500).default(20),
  id_marque:     z.coerce.number().int().positive().optional(),
  id_categorie:  z.coerce.number().int().positive().optional(),
  id_activite:   z.coerce.number().int().positive().optional(),
  marque:        z.string().optional(),
  division:      z.string().optional(),
  search:        z.string().optional(),
});

export const AddImageSchema = z.object({
  url:            z.string().url().max(500),
  alt:            z.string().max(255).optional().nullable(),
  ordre:          z.number().int().min(0).optional().default(0),
  is_principale:  z.boolean().optional().default(false),
  conditionnement: z.string().max(200).optional().nullable(),
});

export type CreateProduitDto      = z.infer<typeof CreateProduitSchema>;
export type UpdateProduitDto      = z.infer<typeof UpdateProduitSchema>;
export type ProduitQueryDto       = z.infer<typeof ProduitQuerySchema>;
export type ProduitPublicQueryDto = z.infer<typeof ProduitPublicQuerySchema>;
export type AddImageDto           = z.infer<typeof AddImageSchema>;
