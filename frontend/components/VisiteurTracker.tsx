"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackVisiteur } from "../lib/api";

const STORAGE_KEY = "ev_token";

export default function VisiteurTracker() {
  const pathname  = usePathname();
  const startRef  = useRef<number>(Date.now());
  const tokenRef  = useRef<string | null>(null);

  // Initialisation : récupérer ou créer le token visiteur
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    tokenRef.current = stored;
    trackVisiteur({
      token_visiteur: stored ?? undefined,
      url:   pathname,
      titre: document.title,
    }).then(token => {
      if (token) {
        tokenRef.current = token;
        sessionStorage.setItem(STORAGE_KEY, token);
      }
    });

    startRef.current = Date.now();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // À chaque changement de page : enregistrer la durée sur la page précédente
  useEffect(() => {
    const duree = Math.round((Date.now() - startRef.current) / 1000);
    if (tokenRef.current && duree > 2) {
      trackVisiteur({
        token_visiteur: tokenRef.current,
        url:   pathname,
        titre: document.title,
        duree,
      });
    }
    startRef.current = Date.now();
  }, [pathname]);

  return null;
}
