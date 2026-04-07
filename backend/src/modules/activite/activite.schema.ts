// src/modules/activite/activite.schema.ts
import { z } from "zod";

export const CreateActiviteSchema = z.object({
  nom:         z.string().min(1).max(150),
  slug:        z.string().min(1).max(180).regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
  image:       z.string().url().max(500).optional().nullable(),
  ordre:       z.number().int().min(0).optional().default(0),
});

export const UpdateActiviteSchema = CreateActiviteSchema.partial().extend({
  actif: z.boolean().optional(),
});

export type CreateActiviteDto = z.infer<typeof CreateActiviteSchema>;
export type UpdateActiviteDto = z.infer<typeof UpdateActiviteSchema>;
