import { z } from "zod";

export const TrackSchema = z.object({
  token_visiteur: z.string().optional(),
  url:            z.string().max(500).optional(),
  titre:          z.string().max(255).optional(),
  duree:          z.number().int().min(0).optional(),
  // Tracking recherche
  search_query:   z.string().max(500).optional(),
  search_results: z.number().int().min(0).optional().default(0),
});

export const VisiteurQuerySchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const StatsVisiteurQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

export type TrackDto               = z.infer<typeof TrackSchema>;
export type VisiteurQueryDto       = z.infer<typeof VisiteurQuerySchema>;
export type StatsVisiteurQueryDto  = z.infer<typeof StatsVisiteurQuerySchema>;
