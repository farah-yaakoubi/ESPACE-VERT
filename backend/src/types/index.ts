// src/types/index.ts
// ══════════════════════════════════════════════════════
//  Types partagés — alignés sur les enums Prisma
// ══════════════════════════════════════════════════════

// ─── JWT ──────────────────────────────────────────────
export type JwtPayload = {
  id_admin: number;
  email:    string;
  id_role:  number;
  nom:      string;
};

// ─── Audit ────────────────────────────────────────────
export type AuditAction =
  | "LOGIN" | "LOGOUT"
  | "CREATE" | "UPDATE" | "DELETE"
  | "VIEW" | "REPLY" | "STATUS_CHANGE";

// ─── Statuts métier (miroir des enums Prisma) ─────────
export type DevisStatut = "nouveau" | "en_cours" | "traite" | "rejete";
export type RdvStatut   = "nouveau" | "confirme" | "annule" | "termine";
export type Division    = "standard" | "pro" | "garden";

// ─── Réponse API standard ─────────────────────────────
export interface ApiSuccess<T = unknown> {
  success: true;
  data:    T;
  meta?:   PaginationMeta;
}

export interface ApiError {
  success: false;
  error:   string;
}

export interface PaginationMeta {
  total: number;
  page:  number;
  pages: number;
  limit: number;
}

// ─── Augmentation Express ─────────────────────────────
declare global {
  namespace Express {
    interface Request {
      admin?: JwtPayload;
    }
  }
}
