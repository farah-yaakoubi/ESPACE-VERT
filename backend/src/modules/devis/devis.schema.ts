// src/modules/devis/devis.schema.ts
import { z } from "zod";

// ── Statuts (miroir enum Prisma) ──────────────────────────────────────────────
export const DEVIS_STATUTS = ["nouveau", "en_cours", "traite", "rejete"] as const;
export type DevisStatut = typeof DEVIS_STATUTS[number];

// ── Schémas publics ───────────────────────────────────────────────────────────
export const CreateDevisSchema = z.object({
  nom:            z.string().min(2).max(150),
  email:          z.string().email().max(180),
  telephone:      z.string().max(30).optional().nullable(),
  message:        z.string().max(2000).optional().nullable(),
  id_produit:     z.number().int().positive().optional().nullable(),
  token_visiteur: z.string().max(128).optional(),
});

// ── Schémas admin ─────────────────────────────────────────────────────────────
export const UpdateDevisSchema = z.object({
  statut:        z.enum(DEVIS_STATUTS).optional(),
  note_interne:  z.string().max(2000).optional().nullable(),
  reponse_admin: z.string().max(2000).optional().nullable(),
  id_admin:      z.number().int().positive().optional(),   // injecté côté service
});

export const DevisQuerySchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
  statut: z.enum(DEVIS_STATUTS).optional(),
  search: z.string().optional(),
});

// ── Types inférés ────────────────────────────────────────────────────────────
export type CreateDevisDto = z.infer<typeof CreateDevisSchema>;
export type UpdateDevisDto = z.infer<typeof UpdateDevisSchema>;
export type DevisQueryDto  = z.infer<typeof DevisQuerySchema>;
