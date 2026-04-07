// src/modules/categorie/categorie.schema.ts
import { z } from "zod";

export const CreateCategorieSchema = z.object({
  nom:         z.string().min(1).max(150),
  slug:        z.string().min(1).max(180).regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
  image:       z.string().url().max(500).optional().nullable(),
  id_activite: z.number().int().positive().optional().nullable(),
  id_marque:   z.number().int().positive().optional().nullable(),
  parent_id:   z.number().int().positive().optional().nullable(),
  ordre:       z.number().int().min(0).optional().default(0),
});

export const UpdateCategorieSchema = CreateCategorieSchema.partial().extend({
  actif: z.boolean().optional(),
});

export const CategorieQuerySchema = z.object({
  id_marque:   z.coerce.number().int().positive().optional(),
  id_activite: z.coerce.number().int().positive().optional(),
});

export type CreateCategorieDto  = z.infer<typeof CreateCategorieSchema>;
export type UpdateCategorieDto  = z.infer<typeof UpdateCategorieSchema>;
export type CategorieQueryDto   = z.infer<typeof CategorieQuerySchema>;
