// ══════════════════════════════════════════════════════
//  src/types/index.ts
//  Types partagés dans tout le projet
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
  | "VIEW";

// ─── Statuts métier ───────────────────────────────────
export type StatutDevis = "nouveau" | "en_cours" | "traite"  | "rejete";
export type StatutRdv   = "nouveau" | "confirme" | "annule"  | "termine";

// ─── Réponse API standard ─────────────────────────────
export interface ApiResponse<T = unknown> {
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

// ─── Params pagination communs ────────────────────────
export interface PaginationParams {
  page:  number;
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
