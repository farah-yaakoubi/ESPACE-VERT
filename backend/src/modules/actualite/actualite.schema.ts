// src/modules/actualite/actualite.schema.ts
import { z } from "zod";

export const CreateActualiteSchema = z.object({
  titre:   z.string().min(1).max(255),
  contenu: z.string().min(1),
  image:   z.string().url().max(500).optional().nullable(),
  slug:    z.string().min(1).max(280).regex(/^[a-z0-9-]+$/),
  publiee: z.boolean().optional().default(false),
});

export const UpdateActualiteSchema = CreateActualiteSchema.partial();

export const ActualiteQuerySchema = z.object({
  page:    z.coerce.number().int().min(1).default(1),
  limit:   z.coerce.number().int().min(1).max(50).default(12),
  publiee: z.enum(["true","false"]).optional(),
});

export type CreateActualiteDto  = z.infer<typeof CreateActualiteSchema>;
export type UpdateActualiteDto  = z.infer<typeof UpdateActualiteSchema>;
export type ActualiteQueryDto   = z.infer<typeof ActualiteQuerySchema>;
