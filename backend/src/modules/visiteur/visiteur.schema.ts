// src/modules/visiteur/visiteur.schema.ts
import { z } from "zod";

export const TrackSchema = z.object({
  token_visiteur: z.string().optional(),
  url:            z.string().max(500).optional(),
  titre:          z.string().max(255).optional(),
  duree:          z.number().int().min(0).optional(),
});

export const VisiteurQuerySchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export type TrackDto          = z.infer<typeof TrackSchema>;
export type VisiteurQueryDto  = z.infer<typeof VisiteurQuerySchema>;
