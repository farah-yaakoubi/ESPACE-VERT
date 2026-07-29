import { z } from "zod";

export const TutorialVideoSchema = z.object({
  titre: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  url: z.string().url().max(500),
  thumbnail: z.string().url().max(500).optional().nullable(),
  page: z.string().min(1).max(80).default("pulvert"),
  ordre: z.coerce.number().int().default(0),
  actif: z.boolean().optional().default(true),
});

export const UpdateTutorialVideoSchema = TutorialVideoSchema.partial();

export const TutorialVideoQuerySchema = z.object({
  page: z.string().min(1).max(80).default("pulvert"),
  actif: z.enum(["true", "false"]).optional(),
});

export type TutorialVideoDto = z.infer<typeof TutorialVideoSchema>;
export type UpdateTutorialVideoDto = z.infer<typeof UpdateTutorialVideoSchema>;
export type TutorialVideoQueryDto = z.infer<typeof TutorialVideoQuerySchema>;
