// src/modules/contact/contact.schema.ts
import { z } from "zod";

export const CreateContactSchema = z.object({
  nom:            z.string().min(2).max(150),
  email:          z.string().email().max(180),
  sujet:          z.string().max(255).optional().nullable(),
  message:        z.string().min(10).max(3000),
  token_visiteur: z.string().max(128).optional(),
});

export const ReplyContactSchema = z.object({
  reponse: z.string().min(1).max(3000),
});

export const ContactQuerySchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
  lu:     z.enum(["true", "false"]).optional(),
  search: z.string().optional(),
});

export type CreateContactDto = z.infer<typeof CreateContactSchema>;
export type ReplyContactDto  = z.infer<typeof ReplyContactSchema>;
export type ContactQueryDto  = z.infer<typeof ContactQuerySchema>;
