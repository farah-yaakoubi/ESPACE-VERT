"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package, ChevronRight, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CategorieDetail, CategorieDetailSousCat } from "@/types/api";

function mod(n: number, m: number) { return ((n % m) + m) % m; }

/* ── Carousel hover — zone image uniquement ───────────────────────────────── */
function ImageCarousel({ images, nom }: { images: { url: string; alt: string | null }[]; nom: string }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (images.length < 2) return;
    timerRef.current = setInterval(() => setCurrent(c => mod(c + 1, images.length)), 2800);
  }, [images.length]);

  const stop = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => { start(); return stop; }, [start, stop]);

  const go = (dir: 1 | -1, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    stop();
    setCurrent(c => mod(c + dir, images.length));
    start();
  };

  if (!images.length) return null;

  return (
    <div className="relative w-full h-full bg-gray-50">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={images[current].url}
            alt={images[current].alt ?? nom}
            fill
            className="object-contain p-4"
            sizes="(max-width:640px)100vw,(max-width:1024px)50vw,25vw"
          />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button onClick={e => go(-1, e)}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white/90 shadow hover:bg-white text-gray-700 font-bold text-sm">
            ‹
          </button>
          <button onClick={e => go(1, e)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white/90 shadow hover:bg-white text-gray-700 font-bold text-sm">
            ›
          </button>
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1 pointer-events-none">
            {images.map((_, i) => (
              <span key={i} className="rounded-full transition-all duration-300"
                style={{ width: i === current ? 12 : 4, height: 4, background: i === current ? "#1b5e38" : "rgba(0,0,0,0.15)" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Carte produit avec carousel hover ────────────────────────────────────── */
function ProduitHoverCard({ p }: { p: { id_produit: number; slug: string; nom: string; description?: string | null; images: { url: string; alt: string | null }[] } }) {
  const [hovered, setHovered] = useState(false);
  const img = p.images?.[0];

  return (
    <Link href={`/produits/${p.slug}`}
      className="group block rounded-2xl border overflow-hidden bg-white transition-all duration-300"
      style={{
        borderColor: hovered ? "#7dc040" : "#f3f4f6",
        boxShadow:   hovered ? "0 16px 40px rgba(61,165,53,0.16), 0 4px 12px rgba(61,165,53,0.10)" : "0 1px 3px rgba(0,0,0,0.05)",
        transform:   hovered ? "translateY(-6px)" : "translateY(0)",
        transition:  "transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, border-color 0.25s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Zone image */}
      <div className="relative h-48 bg-gray-50 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {!hovered ? (
            <motion.div key="static" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="absolute inset-0">
              {img
                ? <Image src={img.url} alt={img.alt ?? p.nom} fill className="object-contain p-4" sizes="(max-width:640px)100vw,(max-width:1024px)50vw,25vw" />
                : <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-10 select-none">🌱</div>
              }
            </motion.div>
          ) : (
            <motion.div key="carousel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="absolute inset-0">
              {p.images?.length > 0
                ? <ImageCarousel images={p.images} nom={p.nom} />
                : <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-10 select-none">🌱</div>
              }
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trait vert bas */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] origin-left transition-transform duration-500"
          style={{ background: "linear-gradient(to right,#7dc040,#1b5e38,#7dc040)", transform: hovered ? "scaleX(1)" : "scaleX(0)" }} />
      </div>

      {/* Infos */}
      <div className="p-4">
        <p className="font-semibold text-gray-800 text-sm leading-snug transition-colors line-clamp-2"
          style={{ color: hovered ? "#15803d" : "#1f2937" }}>
          {p.nom}
        </p>
        {p.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.description}</p>
        )}
        <div className="mt-3 flex items-center gap-1 text-ev-600 text-xs font-semibold transition-opacity duration-200"
          style={{ opacity: hovered ? 1 : 0 }}>
          <span>Voir le produit</span>
          <ChevronRight size={11} />
        </div>
      </div>
    </Link>
  );
}

/* ── Grille produits d'une sous-catégorie ─────────────────────────────────── */
function ProduitsGrid({ sousCat, onBack, parentNom }: {
  sousCat:   CategorieDetailSousCat;
  onBack:    () => void;
  parentNom: string;
}) {
  const produits = sousCat.produits ?? [];

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-gray-500 hover:text-ev-700 transition-colors group font-medium">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
          {parentNom}
        </button>
        <ChevronRight size={13} className="text-gray-300" />
        <span className="text-gray-800 font-semibold">{sousCat.nom}</span>
      </div>

      {sousCat.image && (
        <div className="relative h-36 rounded-2xl overflow-hidden mb-8">
          <Image src={sousCat.image} alt={sousCat.nom} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-center px-7 gap-3">
            <Layers size={18} className="text-white/80 shrink-0" />
            <h2 className="text-xl font-bold text-white drop-shadow">{sousCat.nom}</h2>
            {sousCat.description && (
              <p className="hidden sm:block text-sm text-white/70 ml-2 line-clamp-1">— {sousCat.description}</p>
            )}
          </div>
        </div>
      )}

      {!sousCat.image && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Layers size={18} className="text-ev-600" />
            <h2 className="text-xl font-bold text-gray-900">{sousCat.nom}</h2>
          </div>
          {sousCat.description && (
            <p className="text-gray-500 text-sm leading-relaxed max-w-xl">{sousCat.description}</p>
          )}
        </div>
      )}

      {produits.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-400 gap-3">
          <Package size={40} strokeWidth={1.5} className="opacity-40" />
          <p className="text-sm font-medium">Aucun produit dans cette catégorie pour le moment.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">
            {produits.length} produit{produits.length > 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {produits.map(p => <ProduitHoverCard key={p.id_produit} p={p} />)}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Carte sous-catégorie (inchangée) ─────────────────────────────────────── */
function SousCatCoverCard({ souscat, onClick }: { souscat: CategorieDetailSousCat; onClick: () => void }) {
  const count    = souscat.produits?.length ?? 0;
  const previews = !souscat.image
    ? (souscat.produits ?? []).slice(0, 4).flatMap(p => p.images.slice(0, 1))
    : [];

  return (
    <button onClick={onClick}
      className="group flex flex-col rounded-2xl border border-gray-100 hover:border-ev-300
        hover:shadow-xl transition-all duration-300 bg-white overflow-hidden text-left
        focus:outline-none focus:ring-2 focus:ring-ev-400 focus:ring-offset-2">
      <div className="relative overflow-hidden bg-gradient-to-br from-ev-50 to-ev-100" style={{ aspectRatio: "4 / 3" }}>
        {souscat.image ? (
          <Image src={souscat.image} alt={souscat.nom} fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:640px)50vw,(max-width:1024px)33vw,220px" />
        ) : previews.length > 0 ? (
          <div className="absolute inset-0 grid grid-cols-2 gap-1 p-3">
            {previews.map((img, i) => (
              <div key={i} className="relative bg-white rounded-lg overflow-hidden">
                <Image src={img.url} alt="" fill className="object-contain p-1" sizes="80px" />
              </div>
            ))}
            {previews.length < 4 && Array.from({ length: 4 - previews.length }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-ev-50 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-15 select-none">🌿</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 right-2">
          <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {count > 0 ? `${count} produit${count > 1 ? "s" : ""}` : "Voir"}
          </span>
        </div>
      </div>
      <div className="px-3.5 py-3 flex items-center justify-between gap-2 flex-1">
        <p className="text-sm font-bold text-gray-800 leading-tight line-clamp-2 group-hover:text-ev-700 transition-colors">
          {souscat.nom}
        </p>
        <ChevronRight size={14} className="text-gray-300 group-hover:text-ev-500 flex-shrink-0 transition-colors" />
      </div>
      {souscat.image && (souscat.produits ?? []).length > 0 && (
        <div className="px-3.5 pb-3 flex items-center gap-1.5 border-t border-gray-50 pt-2">
          {(souscat.produits ?? []).slice(0, 5).map(p => {
            const img = p.images?.[0];
            return (
              <div key={p.id_produit} className="relative w-7 h-7 rounded-md bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                {img ? <Image src={img.url} alt={p.nom} fill className="object-contain p-0.5" sizes="28px" />
                     : <div className="absolute inset-0 flex items-center justify-center text-xs opacity-20">🌱</div>}
              </div>
            );
          })}
          {count > 5 && <span className="text-[10px] text-ev-600 font-bold">+{count - 5}</span>}
        </div>
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Composant principal
══════════════════════════════════════════════════════════════════════════════ */
export function CategorieCatalogSection({ cat }: { cat: CategorieDetail }) {
  const [selectedSousCat, setSelectedSousCat] = useState<CategorieDetailSousCat | null>(null);
  const sousCats = cat.sous_cats ?? [];
  if (sousCats.length === 0) return null;

  if (selectedSousCat) {
    return (
      <section className="container-ev pb-16">
        <ProduitsGrid sousCat={selectedSousCat} parentNom={cat.nom} onBack={() => setSelectedSousCat(null)} />
      </section>
    );
  }

  const sousCatsAvecImage = sousCats.filter(sc => !!sc.image && sc.image.trim() !== "");
  const sousCatsSansImage = sousCats.filter(sc => !sc.image || sc.image.trim() === "");

  return (
    <section className="container-ev pb-16">
      {sousCatsAvecImage.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-12">
          {sousCatsAvecImage.map(sc => (
            <SousCatCoverCard key={sc.id_categorie} souscat={sc} onClick={() => setSelectedSousCat(sc)} />
          ))}
        </div>
      )}
      {sousCatsSansImage.map(sc => {
        const produits = sc.produits ?? [];
        if (produits.length === 0) return null;
        return (
          <div key={sc.id_categorie} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Package size={15} className="text-ev-600 shrink-0" />
              <h3 className="text-base font-bold text-gray-800">{sc.nom}</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {produits.length} produit{produits.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {produits.map(p => <ProduitHoverCard key={p.id_produit} p={p} />)}
            </div>
          </div>
        );
      })}
    </section>
  );
}