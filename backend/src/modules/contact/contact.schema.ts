// src/modules/contact/contact.schema.ts
import { z } from "zod";

export const CreateContactSchema = z.object({
  nom:            z.string().min(1).max(150),
  email:          z.string().email().max(180),
  sujet:          z.string().max(255).optional().nullable(),
  message:        z.string().min(1),
  token_visiteur: z.string().optional(),
});

export const UpdateContactSchema = z.object({
  lu:      z.boolean().optional(),
  reponse: z.string().optional().nullable(),
});

export const ContactQuerySchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  lu:    z.enum(["true", "false"]).optional(),
});

export type CreateContactDto = z.infer<typeof CreateContactSchema>;
export type UpdateContactDto = z.infer<typeof UpdateContactSchema>;
export type ContactQueryDto  = z.infer<typeof ContactQuerySchema>;
