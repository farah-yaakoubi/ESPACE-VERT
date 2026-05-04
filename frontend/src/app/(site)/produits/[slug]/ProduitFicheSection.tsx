"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";

interface Img {
  url: string;
  alt?: string | null;
  is_principale?: boolean;
  conditionnement?: string | null;
}

/* ── Palette par index conditionnement ─────────────────────────── */
const COND_PALETTES = [
  { bg: "#e8f5e9", border: "#66bb6a", text: "#1b5e20", dot: "#2e7d32", tabBg: "#2e7d32" },
  { bg: "#e3f2fd", border: "#64b5f6", text: "#0d47a1", dot: "#1565c0", tabBg: "#1565c0" },
  { bg: "#fff3e0", border: "#ffa726", text: "#e65100", dot: "#ef6c00", tabBg: "#e65100" },
  { bg: "#f3e5f5", border: "#ba68c8", text: "#4a148c", dot: "#6a1b9a", tabBg: "#6a1b9a" },
  { bg: "#fce4ec", border: "#f48fb1", text: "#880e4f", dot: "#ad1457", tabBg: "#c2185b" },
  { bg: "#e0f7fa", border: "#4dd0e1", text: "#006064", dot: "#00838f", tabBg: "#00838f" },
];

function getPalette(idx: number) {
  return COND_PALETTES[idx % COND_PALETTES.length];
}

/* ── Mini galerie pour un conditionnement ─────────────────────── */
function CondGallery({ images, nom }: { images: Img[]; nom: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);
  const safeIdx = Math.min(active, images.length - 1);
  const mainImg = images[safeIdx];

  const prev = () => setActive(a => (a - 1 + images.length) % images.length);
  const next = () => setActive(a => (a + 1) % images.length);

  return (
    <>
      <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-gray-100 group cursor-zoom-in"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        onClick={() => { setLightbox(true); setZoom(1); }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={safeIdx}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0">
            <Image src={mainImg.url} alt={mainImg.alt ?? nom} fill
              className="object-contain p-5" sizes="(max-width:768px)50vw,25vw" priority />
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 text-[10px] font-semibold text-gray-600 shadow">
            <Maximize2 size={10} /> Agrandir
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white">
              <ChevronLeft size={14} className="text-gray-700" />
            </button>
            <button onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white">
              <ChevronRight size={14} className="text-gray-700" />
            </button>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 pointer-events-none">
              {images.map((_, i) => (
                <span key={i} className={`rounded-full transition-all duration-200 bg-black/25 ${i === safeIdx ? "w-4 h-1.5" : "w-1.5 h-1.5"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-1.5 mt-2 overflow-x-auto">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${i === safeIdx ? "border-gray-500 shadow-sm" : "border-gray-200 hover:border-gray-400"}`}>
              <Image src={img.url} alt="" fill className="object-contain p-1" sizes="48px" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
            onClick={() => { setLightbox(false); setZoom(1); }}>
            <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={e => e.stopPropagation()}>
              <span className="text-white/60 text-sm">{nom} · {safeIdx + 1}/{images.length}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-2 text-white/70 hover:text-white rounded-lg"><ZoomOut size={16}/></button>
                <span className="text-white/50 text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="p-2 text-white/70 hover:text-white rounded-lg"><ZoomIn size={16}/></button>
                <button onClick={() => { setLightbox(false); setZoom(1); }} className="p-2 text-white/70 hover:text-white rounded-lg ml-2"><X size={18}/></button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center" onClick={e => e.stopPropagation()}>
              <div style={{ position:"relative", width:"min(800px,90vw)", height:"min(700px,80vh)", transform:`scale(${zoom})`, transformOrigin:"center" }}>
                <Image src={mainImg.url} alt={mainImg.alt ?? nom} fill className="object-contain" sizes="100vw"/>
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-4 py-4 shrink-0" onClick={e => e.stopPropagation()}>
                <button onClick={prev} className="p-2 text-white/70 hover:text-white rounded-full"><ChevronLeft size={22}/></button>
                <div className="flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setActive(i)} className={`rounded-full transition-all ${i === safeIdx ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/30"}`}/>
                  ))}
                </div>
                <button onClick={next} className="p-2 text-white/70 hover:text-white rounded-full"><ChevronRight size={22}/></button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Composant principal ────────────────────────────────────────── */
export function ProduitFicheSection({ images, nomProduit }: { images: Img[]; nomProduit: string; conditionnements?: string[] }) {
  // Grouper par conditionnement
  const grouped: Record<string, Img[]> = {};
  const sans: Img[] = [];

  for (const img of images) {
    if (img.conditionnement) {
      if (!grouped[img.conditionnement]) grouped[img.conditionnement] = [];
      grouped[img.conditionnement].push(img);
    } else {
      sans.push(img);
    }
  }

  const conditionnements = Object.keys(grouped);
  const hasSeveral = conditionnements.length > 1 || (conditionnements.length >= 1 && sans.length > 0);

  // Si pas de conditionnements distincts → galerie classique simple
  if (!hasSeveral) {
    const allImgs = [...(grouped[conditionnements[0]] ?? []), ...sans];
    return <CondGallery images={allImgs.length ? allImgs : images} nom={nomProduit} />;
  }

  return (
    <div className="space-y-4">
      {/* Grid des conditionnements */}
      <div className={`grid gap-4 ${conditionnements.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
        {conditionnements.map((cond, idx) => {
          const pal = getPalette(idx);
          return (
            <div key={cond} className="rounded-2xl overflow-hidden border"
              style={{ borderColor: pal.border, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              {/* Tab header */}
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: pal.tabBg }}>
                <span className="w-2 h-2 rounded-full bg-white/60" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">{cond}</span>
                <span className="ml-auto text-[10px] text-white/60">{grouped[cond].length} photo{grouped[cond].length > 1 ? "s" : ""}</span>
              </div>
              <div className="p-3" style={{ background: pal.bg }}>
                <CondGallery images={grouped[cond]} nom={`${nomProduit} — ${cond}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Images sans conditionnement (vues génériques) */}
      {sans.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-gray-200"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-700">
            <span className="w-2 h-2 rounded-full bg-white/50" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Vue générale</span>
            <span className="ml-auto text-[10px] text-white/50">{sans.length} photo{sans.length > 1 ? "s" : ""}</span>
          </div>
          <div className="p-3 bg-gray-50">
            <CondGallery images={sans} nom={nomProduit} />
          </div>
        </div>
      )}
    </div>
  );
}
