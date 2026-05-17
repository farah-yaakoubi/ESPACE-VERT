// src/modules/admin/admin.schema.ts
import { z } from "zod";

export const CreateAdminSchema = z.object({
  nom:      z.string().min(1).max(120),
  email:    z.string().email().max(180),
  password: z.string().min(8, "Minimum 8 caractères"),
  id_role:  z.number().int().positive().optional().default(2),
});

export const UpdateAdminSchema = z.object({
  nom:         z.string().min(1).max(120).optional(),
  email:       z.string().email().max(180).optional(),
  password:    z.string().min(8).optional(),
  id_role:     z.number().int().positive().optional(),
  actif:       z.boolean().optional(),
  avatar:      z.string().url().nullable().optional(),
  permissions: z.array(z.string()).optional(), // ← ajouté
});

export type CreateAdminDto = z.infer<typeof CreateAdminSchema>;
export type UpdateAdminDto = z.infer<typeof UpdateAdminSchema>;