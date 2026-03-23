import { prisma } from "./prisma";
import { AuditAction } from "../types";

export async function logAudit(params: {
  id_admin?:   number;
  action:      AuditAction;
  entity_name: string;
  entity_id?:  number;
  detail?:     object;
  ip_address?: string;
}) {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (e) {
    console.error("Audit log error:", e);
  }
}