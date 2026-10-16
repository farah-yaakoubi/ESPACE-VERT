"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProduitsManager } from "@/components/admin/ProduitsManager";

/**
 * Page « Produits » indépendante : masquée pour le moment.
 * Les produits se gèrent depuis les pages Marques et Activités.
 * Pour la réafficher : passer ce drapeau à true et décommenter l'entrée
 * « Produits » dans le menu (AdminLayoutInner.tsx).
 */
const PAGE_PRODUITS_VISIBLE = false;

export default function AdminProduitsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!PAGE_PRODUITS_VISIBLE) router.replace("/admin/activites");
  }, [router]);

  if (!PAGE_PRODUITS_VISIBLE) return null;
  return <ProduitsManager />;
}