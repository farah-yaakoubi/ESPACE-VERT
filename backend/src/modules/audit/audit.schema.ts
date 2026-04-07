// src/modules/audit/audit.schema.ts
import { z } from "zod";

export const AuditQuerySchema = z.object({
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(30),
  entity_name: z.string().optional(),
  action:      z.enum(["LOGIN","LOGOUT","CREATE","UPDATE","DELETE","VIEW"]).optional(),
  id_admin:    z.coerce.number().int().positive().optional(),
});

export type AuditQueryDto = z.infer<typeof AuditQuerySchema>;
