// src/modules/marque/marque.schema.ts
import { z } from "zod";

const TranslationsSchema = z.record(z.enum(["fr", "ar", "en"]), z.record(z.string(), z.string().nullable())).optional();

export const CreateMarqueSchema = z.object({
  nom:         z.string().min(1).max(120),
  slug:        z.string().min(1).max(160).regex(/^[a-z0-9-]+$/, "Slug invalide"),
  description: z.string().optional().nullable(),
  translations: TranslationsSchema,
  logo:        z.string().url().max(500).optional().nullable(),
  banniere:    z.string().url().max(500).optional().nullable(),
  type_marque: z.enum(["groupe", "partenaire"]).optional().default("groupe"),
});

export const UpdateMarqueSchema = CreateMarqueSchema.partial().extend({
  actif: z.boolean().optional(),
});

export type CreateMarqueDto = z.infer<typeof CreateMarqueSchema>;
export type UpdateMarqueDto = z.infer<typeof UpdateMarqueSchema>;
