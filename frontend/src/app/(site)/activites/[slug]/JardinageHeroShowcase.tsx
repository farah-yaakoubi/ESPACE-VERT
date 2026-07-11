"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Search, Truck } from "lucide-react";

const FALLBACK_IMAGE = "/images/hero/jardinage-desktop.webp";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/** Rouge / anthracite figés — volontairement hors palette `ev-*` afin de ne
 *  jamais être écrasés par une future évolution du thème `.theme-machinisme`. */
const RED      = "#e30613";
const RED_DARK = "#b3050f";
const INK      = "#0c0c0e";
const INK_2    = "#17181c";

interface JardinageHeroCategory {
  id_categorie: number;
  nom: string;
}

interface JardinageHeroShowcaseProps {
  activiteSlug: string;
  fallbackImage?: string;
  ctaHref?: string;
  categories?: JardinageHeroCategory[];
}

const TABS = [
  { label: "Tous les produits", active: true },
];

export function JardinageHeroShowcase({
  activiteSlug,
  fallbackImage = FALLBACK_IMAGE,
  ctaHref = "#produits-activite",
  categories = [],
}: JardinageHeroShowcaseProps) {
  const [image, setImage] = useState<string>(fallbackImage);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE}/hero-slides?page=activite:${activiteSlug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { image: string; actif: boolean; ordre: number }[]) => {
        if (cancelled) return;
        const first = data.filter((s) => s.actif).sort((a, b) => a.ordre - b.ordre)[0];
        if (first?.image) setImage(first.image);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activiteSlug]);

  const topCategories = categories.slice(0, 6);

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: INK }}>
      <div className="relative min-h-[560px] lg:min-h-[620px] flex items-stretch pb-24 lg:pb-28">
        {/* ── Photo plein format ─────────────────────────────────────── */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Équipements de jardinage et machinisme" className="h-full w-full object-cover" />
        </div>

        {/* ── Voile sombre diagonal (côté gauche) ──────────────────────── */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(100deg, ${INK} 0%, ${INK} 40%, rgba(12,12,14,0.72) 56%, rgba(12,12,14,0.15) 78%, rgba(12,12,14,0) 92%)`,
          }}
        />

        {/* ── Contenu texte ───────────────────────────────────────────── */}
        <div
          className="relative z-10 container-ev flex items-center w-full"
          style={{ paddingTop: "calc(var(--nav-h, 80px) + 28px)" }}
        >
          <div className="max-w-xl">
            <p
              className="text-[12px] sm:text-[13px] font-extrabold tracking-[0.22em] uppercase mb-3"
              style={{ color: RED }}
            >
              Matériel professionnel, location
            </p>

            <h1
              className="font-black uppercase leading-[1.06] tracking-tight text-[clamp(2rem,4.2vw,3.1rem)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="block text-white">Notre collection</span>
              <span className="block" style={{ color: RED }}>Premium d&apos;équipements..</span>
            </h1>

            <p className="mt-4 text-[13.5px] sm:text-sm font-medium text-white/70 max-w-md">
              Tondeuses, motoculture, outillage thermique et électrique — le matériel où les
              professionnels et les particuliers exigeants trouvent robustesse et performance.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={ctaHref}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-[13.5px] font-bold text-white uppercase tracking-wide transition-colors duration-200"
                style={{ backgroundColor: RED }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = RED_DARK)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = RED)}
              >
                Voir le catalogue
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* ── Carte produit vedette flottante ─────────────────────────── */}
        <div className="absolute right-5 bottom-32 sm:bottom-36 lg:bottom-40 z-10 hidden sm:flex items-center gap-3 rounded-xl bg-white/95 backdrop-blur-sm px-4 py-3 shadow-2xl max-w-[260px]">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full shrink-0"
            style={{ backgroundColor: RED }}
          >
            <Truck size={18} strokeWidth={2.2} className="text-white" />
          </span>
          <div>
            <p className="text-[12.5px] font-bold text-gray-900 leading-tight">Livraison rapide</p>
          </div>
        </div>
      </div>

      {/* ── Barre de recherche flottante (style "MotorX") ─────────────── */}
      <div className="relative z-20 container-ev">
        <div className="-mt-20 lg:-mt-24">
          {/* Onglets */}
          <div className="flex items-center gap-1 mb-0">
            {TABS.map((tab) => (
              <a
                key={tab.label}
                href={ctaHref}
                className="px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide rounded-t-lg transition-colors"
                style={
                  tab.active
                    ? { backgroundColor: INK_2, color: "#fff" }
                    : { backgroundColor: "rgba(255,255,255,0.9)", color: "#1f2023" }
                }
              >
                {tab.label}
              </a>
            ))}
          </div>

          {/* Barre */}
          <div className="rounded-xl rounded-tl-none bg-white shadow-2xl px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
              <div className="flex-1">
                <label className="flex flex-col gap-1 border border-gray-200 rounded-lg px-3.5 py-2 focus-within:border-[--jm-red] transition-colors" style={{ ["--jm-red" as any]: RED }}>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Catégorie</span>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) window.location.hash = "";
                    }}
                    className="text-[13px] font-semibold text-gray-800 bg-transparent outline-none -mt-0.5"
                  >
                    <option value="">Toutes les catégories</option>
                    {topCategories.map((c) => (
                      <option key={c.id_categorie} value={c.id_categorie}>{c.nom}</option>
                    ))}
                  </select>
                </label>
              </div>

              <a
                href={ctaHref}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-[13px] font-bold text-white uppercase tracking-wide shrink-0 transition-colors duration-200"
                style={{ backgroundColor: RED }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = RED_DARK)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = RED)}
              >
                <Search size={16} />
                Voir les produits
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}