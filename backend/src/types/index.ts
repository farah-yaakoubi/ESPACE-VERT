export type JwtPayload = {
  id_admin: number;
  email:    string;
  id_role:  number;
  nom:      string;
};

export type AuditAction =
  | "LOGIN" | "LOGOUT"
  | "CREATE" | "UPDATE" | "DELETE"
  | "VIEW";

export type StatutDevis = "nouveau" | "en_cours" | "traite" | "rejete";
export type StatutRdv   = "nouveau" | "confirme" | "annule" | "termine";