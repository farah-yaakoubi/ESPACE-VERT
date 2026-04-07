// src/modules/auth/auth.schema.ts
import { z } from "zod";

export const LoginSchema = z.object({
  email:    z.string().email().max(180),
  password: z.string().min(1),
});

export const RefreshSchema = z.object({
  refresh_token: z.string().min(1),
});

export const ChangePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password:     z.string().min(8, "Le mot de passe doit avoir au moins 8 caractères"),
});

export type LoginDto          = z.infer<typeof LoginSchema>;
export type RefreshDto        = z.infer<typeof RefreshSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
