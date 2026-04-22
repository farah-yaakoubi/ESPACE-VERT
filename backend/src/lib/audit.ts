// src/lib/audit.ts
// FIX: Audit enrichi — sauvegarde l'objet AVANT suppression dans detail
import { prisma } from "./prisma";

export type AuditAction = "LOGIN"|"LOGOUT"|"CREATE"|"UPDATE"|"DELETE"|"REPLY"|"STATUS_CHANGE"|"TOGGLE"|"VIEW";

export interface AuditParams {
  id_admin?:    number;
  action:       AuditAction;
  entity_name:  string;
  entity_id?:   number;
  detail?:      object;      // ← objet avant delete, diff avant/après update, etc.
  ip_address?:  string;
}

export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

/**
 * Helper pour sauvegarder l'état d'un objet AVANT suppression.
 * Usage: await logAuditDelete(id_admin, "produit", id_produit, produit)
 */
export async function logAuditDelete(
  id_admin: number,
  entity_name: string,
  entity_id: number,
  snapshot: object,
  ip_address?: string,
): Promise<void> {
  await logAudit({
    id_admin,
    action:      "DELETE",
    entity_name,
    entity_id,
    detail:      { deleted_at: new Date().toISOString(), snapshot },
    ip_address,
  });
}
