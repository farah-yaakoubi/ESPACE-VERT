// src/modules/faq/faq.schema.ts
import { z } from "zod";

export const CreateFaqSchema = z.object({
  question:  z.string().min(1),
  reponse:   z.string().min(1),
  categorie: z.string().max(120).optional().nullable(),
  ordre:     z.number().int().min(0).optional().default(0),
});

export const UpdateFaqSchema = CreateFaqSchema.partial().extend({
  active: z.boolean().optional(),
});

export const FaqQuerySchema = z.object({
  categorie: z.string().optional(),
});

export type CreateFaqDto = z.infer<typeof CreateFaqSchema>;
export type UpdateFaqDto = z.infer<typeof UpdateFaqSchema>;
export type FaqQueryDto  = z.infer<typeof FaqQuerySchema>;
