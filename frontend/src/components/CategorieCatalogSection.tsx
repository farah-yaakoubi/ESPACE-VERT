"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CategorieDetail, CategorieDetailSousCat } from "@/types/api";
import { getProductHref } from "@/lib/product-url";

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
    <div className="relative w-full h-full">
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
            className="object-contain transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.06]"
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
function ProduitHoverCard({ p }: { p: { id_produit: number; slug: string; nom: string; description?: string | null; marque?: { slug?: string | null } | null; activite?: { slug?: string | null } | null; images: { url: string; alt: string | null }[] } }) {
  const [hovered, setHovered] = useState(false);
  const img = p.images?.[0];

  return (
    <Link href={getProductHref(p)}
      className="group flex h-full flex-col items-center text-center focus:outline-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {!hovered ? (
            <motion.div key="static" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="absolute inset-0">
              {img
                ? <Image src={img.url} alt={img.alt ?? p.nom} fill className="object-contain transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.06]" sizes="(max-width:640px)100vw,(max-width:1024px)50vw,25vw" />
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
      </div>

      <p
        className="mt-4 text-[1.05rem] font-semibold leading-snug text-[#1b2118] line-clamp-2 transition-colors group-hover:text-ev-700"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {p.nom}
      </p>

      <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ev-700 px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-300 group-hover:bg-ev-800 group-hover:shadow-md group-hover:-translate-y-0.5">
        Voir le produit
        <ChevronRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

/* ── Carte sous-catégorie — sans cadre, flotte, style aligné sur "Semences" ──
   Navigue vers /categories/{slug} (vraie navigation Next.js) plutôt que de
   changer un état local : chaque niveau de l'arborescence obtient ainsi une
   URL propre, un fil d'Ariane correct et un bouton "retour" du navigateur
   qui fonctionne de manière logique, même sur des arborescences profondes
   (ex: Semences et Plants > Semences Maraîchère > Pro > Semences Hybride
   > Tomate > Alyenta).                                                    ── */
function SousCatCoverCard({ souscat, large = false }: { souscat: CategorieDetailSousCat; large?: boolean }) {
  const previews = !souscat.image
    ? (souscat.produits ?? []).slice(0, 4).flatMap(p => p.images.slice(0, 1))
    : [];

  return (
    <Link
      href={`/categories/${souscat.slug}`}
      className="group flex flex-col items-center text-center focus:outline-none"
    >
      <div className="relative flex h-44 w-full items-center justify-center">
        {souscat.image ? (
          <Image
            src={souscat.image}
            alt={souscat.nom}
            fill
            className="object-contain transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.06]"
            sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
          />
        ) : previews.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {previews.map((img, i) => (
              <div key={i} className="relative aspect-square bg-ev-50 rounded-lg overflow-hidden">
                <Image src={img.url} alt="" fill className="object-contain p-1" sizes="80px" />
              </div>
            ))}
            {previews.length < 4 && Array.from({ length: 4 - previews.length }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-ev-50 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="flex h-44 w-full items-center justify-center rounded-full bg-ev-50 text-3xl text-ev-300">
            🌿
          </div>
        )}
      </div>

      <p
        className="mt-4 text-[1.05rem] font-semibold leading-snug text-[#1b2118] transition-colors group-hover:text-ev-700"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {souscat.nom}
      </p>

      <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ev-700 px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-300 group-hover:bg-ev-800 group-hover:shadow-md group-hover:-translate-y-0.5">
        Voir produits
        <ChevronRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Composant principal — chaque sous-catégorie est un vrai lien /categories/{slug}
   (plus de sélection en état local), pour un historique de navigation cohérent
   et un bouton "retour" du navigateur qui fonctionne à n'importe quelle
   profondeur d'arborescence.
══════════════════════════════════════════════════════════════════════════════ */
export function CategorieCatalogSection({ cat }: { cat: CategorieDetail }) {
  const sousCats = cat.sous_cats ?? [];
  if (sousCats.length === 0) return null;

  const sousCatsAvecImage = sousCats.filter(sc => !!sc.image && sc.image.trim() !== "");
  const sousCatsSansImage = sousCats.filter(sc => !sc.image || sc.image.trim() === "");

  return (
    <section className="container-ev pb-16">
      {sousCatsAvecImage.length > 0 && (
        <div className={[
          "mb-12",
          sousCatsAvecImage.length === 1
            ? "flex justify-center"
            : sousCatsAvecImage.length === 2
            ? "grid grid-cols-2 max-w-2xl mx-auto gap-5"
            : sousCatsAvecImage.length === 3
            ? "grid grid-cols-3 max-w-3xl mx-auto gap-5"
            : sousCatsAvecImage.length === 4
            ? "grid grid-cols-2 sm:grid-cols-4 gap-5"
            : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5",
        ].join(" ")}>
          {sousCatsAvecImage.map(sc => (
            <SousCatCoverCard
              key={sc.id_categorie}
              souscat={sc}
              large={sousCatsAvecImage.length <= 2}
            />
          ))}
        </div>
      )}
      {sousCatsSansImage.map(sc => {
        const produits = sc.produits ?? [];
        // Même sans produit direct ni image, la sous-catégorie peut contenir
        // d'autres niveaux plus bas dans l'arborescence : on affiche toujours
        // un lien vers sa page plutôt que de la faire disparaître (ancien
        // comportement qui créait des impasses de navigation).
        if (produits.length === 0) {
          return (
            <Link key={sc.id_categorie} href={`/categories/${sc.slug}`}
              className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-gray-100 hover:border-ev-200 hover:bg-ev-50/40 transition-colors px-5 py-4 group">
              <div className="flex items-center gap-2">
                <Package size={15} className="text-ev-600 shrink-0" />
                <h3 className="text-base font-bold text-gray-800">{sc.nom}</h3>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ev-700 group-hover:translate-x-0.5 transition-transform">
                Voir <ChevronRight size={14} />
              </span>
            </Link>
          );
        }
        return (
          <div key={sc.id_categorie} className="mb-10">
            <Link href={`/categories/${sc.slug}`} className="flex items-center gap-2 mb-4 w-fit group">
              <Package size={15} className="text-ev-600 shrink-0" />
              <h3 className="text-base font-bold text-gray-800 group-hover:text-ev-700 transition-colors">{sc.nom}</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {produits.length} produit{produits.length > 1 ? "s" : ""}
              </span>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-ev-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {produits.map(p => <ProduitHoverCard key={p.id_produit} p={p} />)}
            </div>
          </div>
        );
      })}
    </section>
  );
}