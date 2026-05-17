"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "ev_visitor_token";

// Génère ou récupère le token visiteur
function getOrCreateToken(): string {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem(TOKEN_KEY);
  if (existing) return existing;
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  localStorage.setItem(TOKEN_KEY, token);
  return token;
}

// Vérifie si l'admin est connecté (exclure du tracking)
function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("ev_admin_token");
}

// Vérifie si la page est une page admin
function isAdminPage(path: string): boolean {
  return path.startsWith("/admin");
}

export function useVisitorTracker() {
  const pathname    = usePathname();
  const startRef    = useRef<number>(Date.now());
  const prevPathRef = useRef<string>("");

  useEffect(() => {
    // Ne pas tracker les admins ou les pages admin
    if (isAdmin() || isAdminPage(pathname)) return;

    const token = getOrCreateToken();
    const now = Date.now();

    // Envoyer la durée de la page PRÉCÉDENTE avant de changer
    const sendPrev = async () => {
      if (prevPathRef.current && prevPathRef.current !== pathname) {
        const duree = Math.round((now - startRef.current) / 1000);
        // On envoie la durée pour la page précédente avec duree réelle
        await fetch(`${BASE}/visiteurs/track`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token_visiteur: token,
            url:            prevPathRef.current,
            titre:          document.title,
            duree:          Math.min(duree, 3600), // max 1h
          }),
        }).catch(() => {});
      }
    };

    // Envoyer la page actuelle (sans durée, sera mise à jour au prochain changement)
    const sendCurrent = async () => {
      await fetch(`${BASE}/visiteurs/track`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token_visiteur: token,
          url:            pathname,
          titre:          document.title,
          duree:          0,
        }),
      }).catch(() => {});
    };

    const run = async () => {
      await sendPrev();
      prevPathRef.current = pathname;
      startRef.current = now;
      await sendCurrent();
    };

    run();

    // Au déchargement de la page, envoyer la durée finale
    const handleUnload = () => {
      if (isAdmin() || isAdminPage(pathname)) return;
      const duree = Math.round((Date.now() - startRef.current) / 1000);
      navigator.sendBeacon(
        `${BASE}/visiteurs/track`,
        JSON.stringify({
          token_visiteur: getOrCreateToken(),
          url:            pathname,
          titre:          document.title,
          duree:          Math.min(duree, 3600),
        }),
      );
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [pathname]);
}

// ── Hook de tracking des recherches ─────────────────────────────
export function useSearchTracker() {
  const trackSearch = async (query: string, nbResults: number) => {
    if (isAdmin() || !query.trim()) return;
    const token = getOrCreateToken();
    await fetch(`${BASE}/visiteurs/track`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token_visiteur: token,
        search_query:   query.trim(),
        search_results: nbResults,
      }),
    }).catch(() => {});
  };
  return { trackSearch };
}
