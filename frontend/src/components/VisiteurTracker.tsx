"use client";
/**
 * VisiteurTracker — NOUVEAU composant manquant
 *
 * POURQUOI LES VISITEURS N'APPARAISSAIENT PAS EN BASE :
 * Ce composant était absent du layout. Sans lui, aucune requête POST
 * vers /api/visiteurs/track n'était faite, donc aucun visiteur n'était
 * créé ou mis à jour dans la table `visiteurs`.
 *
 * FONCTIONNEMENT :
 * 1. Au premier chargement : envoie POST /visiteurs/track sans token
 *    → le backend crée un nouveau Visiteur et retourne son token_visiteur
 *    → on stocke ce token dans sessionStorage pour les prochaines visites
 * 2. À chaque changement de route (pathname) : enregistre la durée passée
 *    sur la page précédente via duree (en secondes)
 * 3. Le token_visiteur est aussi utilisé dans les formulaires (devis, contact, rdv)
 *    pour lier la demande au visiteur connu.
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const STORAGE_KEY = "ev_visitor_token";

interface TrackPayload {
  token_visiteur?: string;
  url:             string;
  titre?:          string;
  duree?:          number;
}

async function track(payload: TrackPayload): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/visiteurs/track`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
      cache:   "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    // Le backend retourne { success: true, data: { token_visiteur: "..." } }
    // ou { token_visiteur: "..." } directement selon la version
    return (
      json?.data?.token_visiteur ??
      json?.token_visiteur ??
      null
    );
  } catch {
    // Silencieux — le tracking ne doit jamais bloquer l'UX
    return null;
  }
}

export function VisiteurTracker() {
  const pathname  = usePathname();
  const startRef  = useRef<number>(Date.now());
  const tokenRef  = useRef<string | null>(null);

  // ── Initialisation au premier montage ──────────────────────────────────────
  useEffect(() => {
    // Récupérer le token existant depuis sessionStorage
    const stored = sessionStorage.getItem(STORAGE_KEY);
    tokenRef.current = stored;

    // Envoyer le tracking de cette première page
    track({
      token_visiteur: stored ?? undefined,
      url:            pathname,
      titre:          document.title,
    }).then((newToken) => {
      if (newToken) {
        tokenRef.current = newToken;
        sessionStorage.setItem(STORAGE_KEY, newToken);
        // Exposer le token globalement pour les formulaires
        if (typeof window !== "undefined") {
          (window as any).__ev_visitor_token = newToken;
        }
      }
    });

    startRef.current = Date.now();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Suivi des changements de page ──────────────────────────────────────────
  useEffect(() => {
    const duree = Math.round((Date.now() - startRef.current) / 1000);

    // N'envoyer que si le visiteur est resté plus de 2 secondes
    if (tokenRef.current && duree > 2) {
      track({
        token_visiteur: tokenRef.current,
        url:            pathname,
        titre:          document.title,
        duree,
      });
    }

    startRef.current = Date.now();
  }, [pathname]);

  // Ce composant ne rend rien — c'est un effet de bord pur
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
