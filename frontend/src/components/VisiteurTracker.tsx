"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const BASE_URL   = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const STORAGE_KEY = "ev_visitor_token";

interface TrackPayload {
  token_visiteur?: string;
  url?:            string;
  titre?:          string;
  duree?:          number;
  search_query?:   string;
  search_results?: number;
  id_faq?:         number;
}

async function trackApi(payload: TrackPayload): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/visiteurs/track`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
      cache:   "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (
      json?.data?.token_visiteur ??
      json?.token_visiteur ??
      null
    );
  } catch {
    return null;
  }
}

export function VisiteurTracker() {
  const pathname  = usePathname();
  const startRef  = useRef<number>(Date.now());
  const tokenRef  = useRef<string | null>(null);

  // ── Initialisation au premier montage ──────────────────────────────────────
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    tokenRef.current = stored;

    // Tracking de la première page
    trackApi({
      token_visiteur: stored ?? undefined,
      url:            pathname,
      titre:          document.title,
    }).then((newToken) => {
      if (newToken) {
        tokenRef.current = newToken;
        sessionStorage.setItem(STORAGE_KEY, newToken);
        if (typeof window !== "undefined") {
          (window as any).__ev_visitor_token = newToken;
        }
      }

      // ── Exposer trackEvFaq globalement ──────────────────────────────────
      // Utilisé par ChatWidget : window.trackEvFaq(id_faq)
      (window as any).trackEvFaq = async (id_faq: number) => {
        const token = tokenRef.current ?? sessionStorage.getItem(STORAGE_KEY);
        if (!token || !id_faq) return;
        // Double appel : via /visiteurs/track (lie au visiteur) ET via /faq/:id/view
        await Promise.allSettled([
          trackApi({ token_visiteur: token, id_faq }),
          fetch(`${BASE_URL}/faq/${id_faq}/view`, { method: "POST", cache: "no-store" }),
        ]);
      };

      // ── Exposer trackSearch globalement ─────────────────────────────────
      // Utilisé par ChatWidget et tout composant de recherche public :
      //   window.trackSearch("engrais foliaire", 5)
      (window as any).trackSearch = async (query: string, nbResults = 0) => {
        const token = tokenRef.current ?? sessionStorage.getItem(STORAGE_KEY);
        if (!token || !query?.trim()) return;
        await trackApi({
          token_visiteur: token,
          search_query:   query.trim(),
          search_results: nbResults,
        });
      };
    });

    startRef.current = Date.now();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Suivi des changements de page ──────────────────────────────────────────
  useEffect(() => {
    const duree = Math.round((Date.now() - startRef.current) / 1000);

    if (tokenRef.current && duree > 2) {
      trackApi({
        token_visiteur: tokenRef.current,
        url:            pathname,
        titre:          document.title,
        duree,
      });
    }

    startRef.current = Date.now();
  }, [pathname]);

  return null;
}

/**
 * Utilitaire pour récupérer le token visiteur depuis les formulaires
 */
export function getVisitorToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    (window as any).__ev_visitor_token ??
    sessionStorage.getItem(STORAGE_KEY) ??
    undefined
  );
}
