// src/lib/audit.ts
import { prisma } from "./prisma";
import { AuditAction } from "../types";

export interface AuditParams {
  id_admin?:   number;
  action:      AuditAction;
  entity_name: string;
  entity_id?:  number;
  detail?:     object;
  ip_address?: string;
}

export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (e) {
    console.error("Audit log error:", e);
  }
}
