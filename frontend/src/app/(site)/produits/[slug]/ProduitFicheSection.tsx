"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut, Package } from "lucide-react";

interface Img {
  url: string;
  alt?: string | null;
  is_principale?: boolean;
  conditionnement?: string | null;
}

/* ── Palette par conditionnement ─────────────────────────────── */
const COND_PALETTES = [
  { bg: "#e8f5e9", border: "#66bb6a", text: "#1b5e20", tab: "#2e7d32", accent: "#4caf50" },
  { bg: "#e3f2fd", border: "#64b5f6", text: "#0d47a1", tab: "#1565c0", accent: "#2196f3" },
  { bg: "#fff3e0", border: "#ffa726", text: "#e65100", tab: "#ef6c00", accent: "#ff9800" },
  { bg: "#f3e5f5", border: "#ba68c8", text: "#4a148c", tab: "#6a1b9a", accent: "#9c27b0" },
  { bg: "#fce4ec", border: "#f48fb1", text: "#880e4f", tab: "#c2185b", accent: "#e91e63" },
  { bg: "#e0f7fa", border: "#4dd0e1", text: "#006064", tab: "#00838f", accent: "#00bcd4" },
];

function getPalette(idx: number) {
  return COND_PALETTES[idx % COND_PALETTES.length];
}

/* ── Tailles des cadres : du grand au petit ───────────────────── */
// Plus le conditionnement est à gauche (index 0) → plus grand
const FRAME_SIZES = [
  { width: "100%", aspectRatio: "1/1",   label: "xl"  },
  { width: "90%",  aspectRatio: "1/1",   label: "lg"  },
  { width: "80%",  aspectRatio: "1/1",   label: "md"  },
  { width: "70%",  aspectRatio: "1/1",   label: "sm"  },
  { width: "60%",  aspectRatio: "1/1",   label: "xs"  },
  { width: "55%",  aspectRatio: "1/1",   label: "xxs" },
];

function getFrameSize(idx: number) {
  return FRAME_SIZES[Math.min(idx, FRAME_SIZES.length - 1)];
}

/* ── Diaporama unifié (toutes images mélangées) ───────────────── */
interface SlideItem {
  img: Img;
  condLabel: string | null;
  condIdx: number;
}

function UnifiedSlideshow({ slides, nomProduit }: { slides: SlideItem[]; nomProduit: string }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [autoPlay, setAutoPlay] = useState(true);

  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [slides.length]);
  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length]);

  useEffect(() => {
    if (!autoPlay || lightbox) return;
    const t = setInterval(next, 3500);
    return () => clearInterval(t);
  }, [autoPlay, lightbox, next]);

  const slide = slides[current];
  const pal = slide.condIdx >= 0 ? getPalette(slide.condIdx) : { bg: "#f5f5f5", border: "#bdbdbd", text: "#424242", tab: "#616161", accent: "#9e9e9e" };

  return (
    <div className="w-full">
      {/* Slideshow principal */}
      <div
        className="relative overflow-hidden transition-colors duration-300"
        style={{
          background: "transparent",
          boxShadow: "none",
        }}
        onMouseEnter={() => setAutoPlay(false)}
        onMouseLeave={() => setAutoPlay(true)}
      >
        {/* Badge conditionnement */}
        {slide.condLabel && (
          <div
            className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md"
            style={{ background: "rgba(17,24,39,0.78)" }}
          >
            <Package size={11} />
            {slide.condLabel}
          </div>
        )}

        {/* Compteur */}
        <div className="absolute top-3 right-3 z-10 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {current + 1} / {slides.length}
        </div>

        {/* Image */}
        <div
          className="relative w-full cursor-zoom-in"
          style={{ aspectRatio: "4/3" }}
          onClick={() => { setLightbox(true); setZoom(1); }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={slide.img.url}
                alt={slide.img.alt ?? nomProduit}
                fill
                className="object-contain p-2 sm:p-4"
                sizes="(max-width:768px)100vw,60vw"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Hint agrandir */}
          <div className="absolute bottom-3 right-3 opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 text-[10px] font-semibold text-gray-600 shadow">
              <Maximize2 size={10} /> Agrandir
            </div>
          </div>
        </div>

        {/* Contrôles nav */}
        {slides.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
            >
              <ChevronLeft size={18} className="text-gray-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
            >
              <ChevronRight size={18} className="text-gray-700" />
            </button>
          </>
        )}

        {/* Barre de progression */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5">
          <motion.div
            className="h-full"
            style={{ background: "rgba(17,24,39,0.28)" }}
            animate={{ width: `${((current + 1) / slides.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Thumbnails avec indicateur de conditionnement */}
      {slides.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 pr-1 scrollbar-none">
          {slides.map((s, i) => {
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="relative shrink-0 rounded-xl overflow-hidden transition-all duration-200 bg-white"
                style={{
                  width: 56, height: 56,
                  border: `1px solid ${i === current ? "#94a3b8" : "#e5e7eb"}`,
                  boxShadow: i === current ? "0 6px 18px rgba(15,23,42,0.10)" : "none",
                }}
              >
                <Image src={s.img.url} alt="" fill className="object-contain p-1" sizes="56px" />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
            onClick={() => { setLightbox(false); setZoom(1); }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 shrink-0" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                {slide.condLabel && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.12)", color: "white" }}>
                    {slide.condLabel}
                  </span>
                )}
                <span className="text-white/60 text-sm">{nomProduit} · {current + 1}/{slides.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-2 text-white/70 hover:text-white rounded-lg"><ZoomOut size={16} /></button>
                <span className="text-white/50 text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="p-2 text-white/70 hover:text-white rounded-lg"><ZoomIn size={16} /></button>
                <button onClick={() => { setLightbox(false); setZoom(1); }} className="p-2 text-white/70 hover:text-white rounded-lg ml-2"><X size={18} /></button>
              </div>
            </div>
            <div className="flex-1 min-h-0 flex items-center justify-center px-4" onClick={e => e.stopPropagation()}>
              <div style={{ position: "relative", width: "min(800px,92vw)", height: "min(700px,68dvh)", transform: `scale(${zoom})`, transformOrigin: "center" }}>
                <Image src={slide.img.url} alt={slide.img.alt ?? nomProduit} fill className="object-contain" sizes="100vw" />
              </div>
            </div>
            {slides.length > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-4 shrink-0" onClick={e => e.stopPropagation()}>
                <button onClick={prev} className="p-2 text-white/70 hover:text-white rounded-full"><ChevronLeft size={22} /></button>
                <div className="flex gap-1.5">
                  {slides.map((s, i) => {
                    return (
                      <button key={i} onClick={() => setCurrent(i)}
                        className="rounded-full transition-all"
                        style={{
                          width: i === current ? 20 : 8,
                          height: 8,
                          background: i === current ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.3)",
                        }}
                      />
                    );
                  })}
                </div>
                <button onClick={next} className="p-2 text-white/70 hover:text-white rounded-full"><ChevronRight size={22} /></button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Grille de cadres du grand au petit ──────────────────────── */
function ConditionnementFrames({
  grouped,
  sans,
  nomProduit,
}: {
  grouped: Record<string, Img[]>;
  sans: Img[];
  nomProduit: string;
}) {
  const conditionnements = Object.keys(grouped);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {conditionnements.map((cond) => (
          <div
            key={cond}
            className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600"
          >
            <Package size={10} />
            {cond}
          </div>
        ))}
        {sans.length > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600">
            <Package size={10} />
            Vue générale
          </div>
        )}
      </div>

      <div className="space-y-4">
        {conditionnements.map((cond, idx) => {
          const imgs = grouped[cond];
          return (
            <motion.div
              key={cond}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.35 }}
              className="rounded-2xl bg-white px-3 py-3 sm:px-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500">{cond}</span>
                <span className="text-[11px] text-gray-400">{imgs.length} photo{imgs.length > 1 ? "s" : ""}</span>
              </div>

              <CondMiniGallery images={imgs} nom={`${nomProduit} — ${cond}`} />
            </motion.div>
          );
        })}

        {sans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: conditionnements.length * 0.06, duration: 0.35 }}
            className="rounded-2xl bg-white px-3 py-3 sm:px-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Vue générale</span>
              <span className="text-[11px] text-gray-400">{sans.length} photo{sans.length > 1 ? "s" : ""}</span>
            </div>
            <CondMiniGallery images={sans} nom={nomProduit} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ── Mini galerie dans un cadre ──────────────────────────────── */
function CondMiniGallery({ images, nom }: { images: Img[]; nom: string }) {
  const [active, setActive] = useState(0);
  const safe = Math.min(active, images.length - 1);
  const img = images[safe];

  return (
    <div className="space-y-3">
      <div className="relative h-[260px] overflow-hidden sm:h-[300px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={safe}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image src={img.url} alt={img.alt ?? nom} fill className="object-contain" sizes="(max-width:768px)100vw,50vw" />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive(a => (a - 1 + images.length) % images.length)}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => setActive(a => (a + 1) % images.length)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white"
            >
              <ChevronRight size={13} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {images.map((im, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white transition-all"
              style={{
                border: `1px solid ${i === safe ? "#94a3b8" : "#e5e7eb"}`,
                boxShadow: i === safe ? "0 6px 18px rgba(15,23,42,0.10)" : "none",
              }}
            >
              <Image src={im.url} alt="" fill className="object-contain p-1" sizes="56px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Composant principal ─────────────────────────────────────── */
export function ProduitFicheSection({
  images,
  nomProduit,
}: {
  images: Img[];
  nomProduit: string;
  conditionnements?: string[];
}) {
  const [mode, setMode] = useState<"diaporama" | "cadres">("diaporama");

  /* Grouper par conditionnement */
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

  /* Construire la liste de slides pour le diaporama unifié */
  const slides: SlideItem[] = [
    ...conditionnements.flatMap((cond, idx) =>
      grouped[cond].map(img => ({ img, condLabel: cond, condIdx: idx }))
    ),
    ...sans.map(img => ({ img, condLabel: null, condIdx: -1 })),
  ];

  /* Pas de conditionnements multiples → galerie simple */
  if (!hasSeveral) {
    const allImgs = [...(grouped[conditionnements[0]] ?? []), ...sans];
    const simplSlides: SlideItem[] = allImgs.map(img => ({ img, condLabel: null, condIdx: -1 }));
    return <UnifiedSlideshow slides={simplSlides.length ? simplSlides : images.map(img => ({ img, condLabel: null, condIdx: -1 }))} nomProduit={nomProduit} />;
  }

  return (
    <div className="space-y-4">
      {/* Toggle mode */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setMode("diaporama")}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
          style={mode === "diaporama"
            ? { background: "#1e293b", color: "white", borderColor: "#1e293b" }
            : { background: "white", color: "#64748b", borderColor: "#e2e8f0" }
          }
        >
          ▶ Diaporama
        </button>
        <button
          onClick={() => setMode("cadres")}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
          style={mode === "cadres"
            ? { background: "#1e293b", color: "white", borderColor: "#1e293b" }
            : { background: "white", color: "#64748b", borderColor: "#e2e8f0" }
          }
        >
          ⊞ Cadres
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === "diaporama" ? (
          <motion.div key="diaporama" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <UnifiedSlideshow slides={slides} nomProduit={nomProduit} />
          </motion.div>
        ) : (
          <motion.div key="cadres" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ConditionnementFrames grouped={grouped} sans={sans} nomProduit={nomProduit} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
