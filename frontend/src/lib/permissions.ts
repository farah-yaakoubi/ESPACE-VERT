// src/lib/permissions.ts — Gestion des permissions côté frontend
import type { Admin } from "./admin-api";

export const PERMISSIONS = {
  // Catalogue
  PRODUITS_READ:    "produits.read",
  PRODUITS_WRITE:   "produits.write",
  PRODUITS_DELETE:  "produits.delete",
  MARQUES_WRITE:    "marques.write",
  CATEGORIES_WRITE: "categories.write",
  // CRM
  DEVIS_READ:       "devis.read",
  DEVIS_WRITE:      "devis.write",
  RDV_READ:         "rdv.read",
  RDV_WRITE:        "rdv.write",
  CONTACT_READ:     "contact.read",
  // Contenu
  ACTUALITES_WRITE: "actualites.write",
  FAQ_WRITE:        "faq.write",
  // Système
  ANALYTICS_READ:   "analytics.read",
  VISITEURS_READ:   "visiteurs.read",
  ADMINS_READ:      "admins.read",
  ADMINS_WRITE:     "admins.write",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Vérifie si un admin a une permission.
 * Le super admin (id_role=1) a toutes les permissions.
 */
export function hasPermission(admin: Admin | null, permission: Permission): boolean {
  if (!admin) return false;
  if (admin.id_role === 1) return true; // Super Admin = accès total
  const perms: string[] = Array.isArray((admin as any).permissions)
    ? (admin as any).permissions
    : [];
  return perms.includes(permission);
}

/** Vérifie si au moins une des permissions est accordée */
export function hasAnyPermission(admin: Admin | null, ...permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(admin, p));
}

export function isSuperAdminCheck(admin: Admin | null): boolean {
  return admin?.id_role === 1;
}
