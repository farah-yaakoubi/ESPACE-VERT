// src/modules/rdv/rdv.schema.ts
import { z } from "zod";

export const RDV_STATUTS = ["nouveau", "confirme", "annule", "termine"] as const;
export type RdvStatut = typeof RDV_STATUTS[number];

export const CreateRdvSchema = z.object({
  nom:            z.string().min(2).max(150),
  email:          z.string().email().max(180),
  telephone:      z.string().max(30).optional().nullable(),
  date_souhaitee: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD attendu"),
  heure:          z.string().max(10).optional().nullable(),
  objet:          z.string().max(255).optional().nullable(),
  agence:         z.string().max(120).optional().nullable(),
  message:        z.string().max(2000).optional().nullable(),
  token_visiteur: z.string().max(128).optional(),
});

export const UpdateRdvSchema = z.object({
  statut:        z.enum(RDV_STATUTS).optional(),
  note_interne:  z.string().max(2000).optional().nullable(),
  heure:         z.string().max(10).optional().nullable(),
  reponse_admin: z.string().max(2000).optional().nullable(),
});

export const RdvQuerySchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
  statut: z.enum(RDV_STATUTS).optional(),
  date:   z.string().optional(),
  agence: z.string().optional(),
});

export type CreateRdvDto = z.infer<typeof CreateRdvSchema>;
export type UpdateRdvDto = z.infer<typeof UpdateRdvSchema>;
export type RdvQueryDto  = z.infer<typeof RdvQuerySchema>;