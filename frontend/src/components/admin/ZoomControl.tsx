"use client";
/**
 * Contrôle de taille d'affichage (A− / 100 % / A+) pour les pages admin.
 * Le niveau est mémorisé dans le navigateur. À utiliser avec `useZoom` :
 *
 *   const { zoom, setZoom } = useZoom("ev_zoom_activites");
 *   <div style={{ zoom }}> … <ZoomControl zoom={zoom} setZoom={setZoom} /> … </div>
 */
import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";

export const ZOOM_LEVELS = [1, 1.15, 1.3, 1.5];

export function useZoom(storageKey: string) {
  const [zoom, setZoomState] = useState(1);

  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(storageKey));
      if (ZOOM_LEVELS.includes(v)) setZoomState(v);
    } catch { /* stockage indisponible */ }
  }, [storageKey]);

  const setZoom = (v: number) => {
    setZoomState(v);
    try { localStorage.setItem(storageKey, String(v)); } catch { /* ignoré */ }
  };
  return { zoom, setZoom };
}

export function ZoomControl({ zoom, setZoom }: { zoom: number; setZoom: (v: number) => void }) {
  const i = ZOOM_LEVELS.indexOf(zoom);
  const step = (d: number) => setZoom(ZOOM_LEVELS[Math.min(Math.max(i + d, 0), ZOOM_LEVELS.length - 1)]);
  return (
    <div className="inline-flex items-center rounded-xl border border-gray-300 bg-white" title="Taille d'affichage">
      <button type="button" onClick={() => step(-1)} disabled={i <= 0} title="Réduire"
        className="flex h-10 w-10 items-center justify-center rounded-l-xl text-gray-600 hover:bg-gray-50 disabled:opacity-30">
        <Minus size={16} />
      </button>
      <button type="button" onClick={() => setZoom(1)} title="Taille normale"
        className="h-10 min-w-[58px] border-x border-gray-200 px-2 text-sm font-semibold text-[#1f4d34] hover:bg-[#f0f5f1]">
        {Math.round(zoom * 100)} %
      </button>
      <button type="button" onClick={() => step(1)} disabled={i >= ZOOM_LEVELS.length - 1} title="Agrandir"
        className="flex h-10 w-10 items-center justify-center rounded-r-xl text-gray-600 hover:bg-gray-50 disabled:opacity-30">
        <Plus size={16} />
      </button>
    </div>
  );
}