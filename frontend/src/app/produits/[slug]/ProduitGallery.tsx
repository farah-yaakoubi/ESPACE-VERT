"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight,
  Maximize2, Grid3X3, Rows3, RotateCcw, Box, Play, Pause,
} from "lucide-react";

interface Img { url: string; alt?: string | null; is_principale?: boolean }

/* ── Simple CSS 3D rotation viewer ─────────────────────────────── */
function Viewer3D({ img, nom }: { img: Img; nom: string }) {
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [zoom3d, setZoom3d] = useState(1);
  const start = useRef({ x: 0, y: 0, rx: 0, ry: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    start.current = { x: e.clientX, y: e.clientY, rx: rotX, ry: rotY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    setRotY(start.current.ry + dx * 0.5);
    setRotX(start.current.rx - dy * 0.3);
  };
  const onMouseUp = () => setDragging(false);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    start.current = { x: t.clientX, y: t.clientY, rx: rotX, ry: rotY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const t = e.touches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    setRotY(start.current.ry + dx * 0.5);
    setRotX(start.current.rx - dy * 0.3);
  };

  return (
    <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-ev-50 to-sand-100 border border-sand-200"
      style={{ cursor: dragging ? "grabbing" : "grab", userSelect: "none" }}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp}>

      {/* Perspective stage */}
      <div style={{ perspective: "800px", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${zoom3d})`,
          transition: dragging ? "none" : "transform 0.3s ease",
          transformStyle: "preserve-3d",
          position: "relative",
          width: "70%",
          paddingBottom: "70%",
        }}>
          <Image src={img.url} alt={img.alt ?? nom} fill
            className="object-contain" sizes="50vw" draggable={false} />
        </div>
      </div>

      {/* Overlay hint */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
        <span className="bg-black/30 backdrop-blur-sm text-white text-[10px] font-medium px-3 py-1.5 rounded-full">
          ↔ Faire glisser pour tourner
        </span>
      </div>

      {/* Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        <button onClick={() => setZoom3d(z => Math.min(2, z + 0.2))}
          className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center shadow hover:bg-white transition-colors pointer-events-auto">
          <ZoomIn size={12} className="text-gray-700" />
        </button>
        <button onClick={() => setZoom3d(z => Math.max(0.5, z - 0.2))}
          className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center shadow hover:bg-white transition-colors pointer-events-auto">
          <ZoomOut size={12} className="text-gray-700" />
        </button>
        <button onClick={() => { setRotX(0); setRotY(0); setZoom3d(1); }}
          className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center shadow hover:bg-white transition-colors pointer-events-auto">
          <RotateCcw size={12} className="text-gray-700" />
        </button>
      </div>

      {/* 3D badge */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <span className="flex items-center gap-1.5 bg-ev-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
          <Box size={10} /> Vue 3D
        </span>
      </div>
    </div>
  );
}

/* ── Main Gallery ───────────────────────────────────────────────── */
export function ProduitGallery({ images, nomProduit }: { images: Img[]; nomProduit: string }) {
  const [active,   setActive]   = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom,     setZoom]     = useState(1);
  const [view,     setView]     = useState<"main" | "grid" | "3d">("main");
  const [autoplay, setAutoplay] = useState(images.length > 1); // autoplay actif par défaut si plusieurs images
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const prev = useCallback(() => setActive(a => (a - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive(a => (a + 1) % images.length),               [images.length]);

  // Autoplay diaporama
  useEffect(() => {
    if (autoplay && images.length > 1) {
      autoplayRef.current = setInterval(() => {
        setActive(a => (a + 1) % images.length);
      }, 3000);
    } else {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    }
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [autoplay, images.length]);

  useEffect(() => {
    if (!lightbox) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     { setLightbox(false); setZoom(1); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [lightbox, prev, next]);

  if (!images.length) return (
    <div className="aspect-square rounded-3xl bg-sand-100 flex flex-col items-center justify-center gap-3 text-gray-300">
      <div className="text-5xl opacity-30">🌿</div>
      <p className="text-sm">Aucune image disponible</p>
    </div>
  );

  const mainImg = images[active];

  return (
    <>
      <div className="space-y-3">
        {/* Controls: vue selector */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">
            {images.length > 1 ? `${active + 1} / ${images.length}` : "Photo produit"}
          </span>
          <div className="flex items-center gap-1 p-1 bg-sand-100 rounded-xl">
            {images.length > 1 && (
              <button onClick={() => setAutoplay(a => !a)} title={autoplay ? "Pause diaporama" : "Lancer le diaporama"}
                className={`p-1.5 rounded-lg transition-all ${autoplay ? "bg-ev-700 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                {autoplay ? <Pause size={13} /> : <Play size={13} />}
              </button>
            )}
            {([
              ["main", Rows3,    "Vue principale"],
              ["grid", Grid3X3,  "Galerie"],
              ["3d",   Box,      "Vue 3D interactive"],
            ] as const).map(([v, Icon, label]) => (
              <button key={v} onClick={() => setView(v)} title={label}
                className={`p-1.5 rounded-lg transition-all ${
                  view === v
                    ? "bg-white shadow-sm text-ev-700 font-semibold"
                    : "text-gray-400 hover:text-gray-600"
                }`}>
                <Icon size={13} />
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === "main" && (
            <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Image principale */}
              <div
                className="relative aspect-square rounded-3xl bg-white border border-sand-200 overflow-hidden shadow-card group cursor-zoom-in"
                onClick={() => { setLightbox(true); setZoom(1); }}
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
              >
                <Image src={mainImg.url} alt={mainImg.alt ?? nomProduit} fill priority
                  className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:1024px)100vw,50vw" />
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg flex items-center gap-1.5 text-xs font-semibold text-ev-700">
                    <Maximize2 size={13} /> Agrandir
                  </div>
                </div>
                {images.length > 1 && (
                  <>
                    <button onClick={e => { e.stopPropagation(); prev(); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 shadow-md hover:bg-white">
                      <ChevronLeft size={16} className="text-gray-700" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); next(); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 shadow-md hover:bg-white">
                      <ChevronRight size={16} className="text-gray-700" />
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 mt-3">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActive(i)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        i === active
                          ? "border-ev-600 shadow-md ring-2 ring-ev-200"
                          : "border-sand-200 hover:border-ev-300"
                      }`}>
                      <Image src={img.url} alt={img.alt ?? `${nomProduit} ${i + 1}`} fill
                        className="object-contain p-1.5" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === "grid" && (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 gap-2.5">
                {images.map((img, i) => (
                  <div key={i} onClick={() => { setActive(i); setView("main"); }}
                    className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all hover:shadow-lg ${
                      i === active ? "border-ev-600 ring-2 ring-ev-200" : "border-sand-200 hover:border-ev-300"
                    }`}
                    style={{ background: "#fff" }}>
                    <Image src={img.url} alt={img.alt ?? `${nomProduit} ${i + 1}`} fill
                      className="object-contain p-4" sizes="(max-width:768px)50vw,25vw" />
                    {i === active && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-ev-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Actif</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {view === "3d" && (
            <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Viewer3D img={mainImg} nom={nomProduit} />
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 mt-3">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActive(i)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        i === active ? "border-ev-600" : "border-sand-200 hover:border-ev-300"
                      }`}>
                      <Image src={img.url} alt={img.alt ?? `${nomProduit} ${i + 1}`} fill
                        className="object-contain p-1.5" sizes="56px" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Lightbox ────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
            onClick={() => { setLightbox(false); setZoom(1); }}
          >
            <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={e => e.stopPropagation()}>
              <span className="text-white/60 text-sm">{nomProduit} · {active + 1}/{images.length}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                  <ZoomOut size={16} />
                </button>
                <span className="text-white/50 text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(4, z + 0.25))}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                  <ZoomIn size={16} />
                </button>
                <button onClick={() => { setLightbox(false); setZoom(1); }}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg ml-2">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-hidden" onClick={e => e.stopPropagation()}>
              <div style={{ transform: `scale(${zoom})`, transition: "transform .2s", position: "relative", width: "min(900px, 90vw)", height: "min(700px, 80vh)" }}>
                <Image src={mainImg.url} alt={mainImg.alt ?? nomProduit} fill
                  className="object-contain" sizes="100vw" />
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-4 py-4 shrink-0" onClick={e => e.stopPropagation()}>
                <button onClick={prev} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                  <ChevronLeft size={24} />
                </button>
                <div className="flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setActive(i)}
                      className={`rounded-full transition-all ${i === active ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/30"}`} />
                  ))}
                </div>
                <button onClick={next} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
