// src/modules/rdv/rdv.schema.ts
import { z } from "zod";

export const CreateRdvSchema = z.object({
  nom:            z.string().min(1).max(150),
  email:          z.string().email().max(180),
  telephone:      z.string().max(30).optional().nullable(),
  date_souhaitee: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD attendu"),
  heure:          z.string().max(10).optional().nullable(),
  objet:          z.string().max(255).optional().nullable(),
  agence:         z.string().max(120).optional().nullable(),
  message:        z.string().optional().nullable(),
  token_visiteur: z.string().optional(),
});

export const UpdateRdvSchema = z.object({
  statut:       z.enum(["nouveau", "confirme", "annule", "termine"]).optional(),
  note_interne: z.string().optional().nullable(),
});

export const RdvQuerySchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
  statut: z.enum(["nouveau", "confirme", "annule", "termine"]).optional(),
});

export type CreateRdvDto = z.infer<typeof CreateRdvSchema>;
export type UpdateRdvDto = z.infer<typeof UpdateRdvSchema>;
export type RdvQueryDto  = z.infer<typeof RdvQuerySchema>;
