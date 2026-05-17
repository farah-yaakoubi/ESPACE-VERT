// src/hooks/usePermissionGuard.ts
// Redirige les admins sans la permission requise vers le dashboard
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenStore } from "@/lib/admin-api";
import { hasPermission, type Permission } from "@/lib/permissions";
import { toast } from "@/components/admin/Toast";

/**
 * Redirige vers /admin/dashboard si l'admin n'a pas la permission requise.
 * À placer en haut de chaque page admin protégée.
 *
 * Exemple : usePermissionGuard("produits.read")
 */
export function usePermissionGuard(permission: Permission) {
  const router = useRouter();

  useEffect(() => {
    const admin = tokenStore.getAdmin();
    if (!hasPermission(admin, permission)) {
      toast.error("Accès refusé", "Vous n'avez pas les droits pour accéder à cette section.");
      router.replace("/admin/dashboard");
    }
  }, [permission, router]);
}
