// src/modules/faq/faq.schema.ts
import { z } from "zod";

export const CreateFaqSchema = z.object({
  question:  z.string().min(5).max(500),
  reponse:   z.string().min(5).max(3000),
  categorie: z.string().max(120).optional().nullable(),
  ordre:     z.number().int().min(0).default(0),
  active:    z.boolean().default(true),
});

export const UpdateFaqSchema = CreateFaqSchema.partial();

export const FaqQuerySchema = z.object({
  categorie: z.string().optional(),
  active:    z.enum(["true","false"]).optional(),
});

export type CreateFaqDto = z.infer<typeof CreateFaqSchema>;
export type UpdateFaqDto = z.infer<typeof UpdateFaqSchema>;
export type FaqQueryDto  = z.infer<typeof FaqQuerySchema>;
