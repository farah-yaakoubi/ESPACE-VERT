// src/modules/devis/devis.schema.ts
import { z } from "zod";

export const CreateDevisSchema = z.object({
  nom:             z.string().min(1).max(150),
  email:           z.string().email().max(180),
  telephone:       z.string().max(30).optional().nullable(),
  message:         z.string().optional().nullable(),
  id_produit:      z.number().int().positive().optional().nullable(),
  token_visiteur:  z.string().optional(),
});

export const UpdateDevisSchema = z.object({
  statut:       z.enum(["nouveau", "en_cours", "traite", "rejete"]).optional(),
  note_interne: z.string().optional().nullable(),
});

export const DevisQuerySchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
  statut: z.enum(["nouveau", "en_cours", "traite", "rejete"]).optional(),
});

export type CreateDevisDto = z.infer<typeof CreateDevisSchema>;
export type UpdateDevisDto = z.infer<typeof UpdateDevisSchema>;
export type DevisQueryDto  = z.infer<typeof DevisQuerySchema>;
