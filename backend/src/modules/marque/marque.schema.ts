// src/modules/marque/marque.schema.ts
import { z } from "zod";

export const CreateMarqueSchema = z.object({
  nom:         z.string().min(1).max(120),
  slug:        z.string().min(1).max(160).regex(/^[a-z0-9-]+$/, "Slug invalide"),
  description: z.string().optional().nullable(),
  logo:        z.string().url().max(500).optional().nullable(),
});

export const UpdateMarqueSchema = CreateMarqueSchema.partial().extend({
  actif: z.boolean().optional(),
});

export type CreateMarqueDto = z.infer<typeof CreateMarqueSchema>;
export type UpdateMarqueDto = z.infer<typeof UpdateMarqueSchema>;
