"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale } from "next-intl";
import { getMarques, type MarquePublic } from "@/lib/api";

// ─── Icônes SVG inline ────────────────────────────────────────────────────────
const IcoFlask = (p: any) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M9 3h6M10 3v6L5 17a2 2 0 0 0 1.7 3h10.6A2 2 0 0 0 19 17l-5-8V3" />
    <path d="M7 16h10" />
  </svg>
);
const IcoPump = (p: any) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <rect x="4" y="7" width="8" height="12" rx="1" />
    <path d="M12 10h4a2 2 0 0 1 2 2v5M18 17h2M4 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const IcoDrop = (p: any) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M12 2L6 10a7 7 0 1 0 12 0L12 2z" />
  </svg>
);
const IcoLeaf = (p: any) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

// ── Configuration visuelle par slug de marque ─────────────────────────────────
const MARQUE_CONFIG: Record<string, {
  Icon:    (p: any) => JSX.Element;
  grad:    string;
  accent:  string;
  items:   string[];
  tagline: string;
  sub:     string;
}> = {
  fertivert: {
    Icon:    IcoFlask,
    grad:    "linear-gradient(135deg, #0a6030 0%, #2d5a1b 55%, #4a7c2f 100%)",
    accent:  "#0a6030",
    tagline: "Pro · Garden",
    sub:     "Fertilisation & Nutrition",
    items:   ["Support de Culture", "Engrais de Fond", "Engrais Organique", "Fertilisant Spécialisé"],
  },
  pulvert: {
    Icon:    IcoPump,
    grad:    "linear-gradient(135deg, #fdfbea 0%, #f4f0c4 55%, #e8e090 100%)",
    accent:  "#6b5a00",
    tagline: "Pro",
    sub:     "Pulvérisation & Traitement",
    items:   ["Pulvérisateurs à dos", "Pulvérisateurs sur roues", "Accessoires & pièces"],
  },
  matar: {
    Icon:    IcoDrop,
    grad:    "linear-gradient(135deg, #eff8ff 0%, #d4eeff 55%, #b8dfff 100%)",
    accent:  "#1b4d7a",
    tagline: "Pro",
    sub:     "Irrigation & Arrosage",
    items:   ["Goutte-à-goutte", "Aspersion", "Raccorderie & tuyaux"],
  },
};

const DEFAULT_CONFIG = {
  Icon:    IcoLeaf,
  grad:    "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 55%, #bbf7d0 100%)",
  accent:  "#16a34a",
  tagline: "",
  sub:     "",
  items:   [],
};

export default function BrandsShowcase() {
  const locale = useLocale();
  const [marques,  setMarques]  = useState<MarquePublic[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getMarques().then((res) => {
      if (res.success && res.data) setMarques(res.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-[#f2faf3]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-8 w-56 bg-gray-200 rounded-full animate-pulse mb-14" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="h-[320px] rounded-3xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#f2faf3]">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── En-tête ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-[#0a6030] rounded-full" />
            <span className="text-sm font-bold tracking-widest text-[#0a6030] uppercase">
              Nos Marques
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight max-w-xl">
            Des solutions pour chaque besoin agricole
          </h2>
        </motion.div>

        {/* ── Grille marques ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {marques.map((marque, i) => {
            const cfg = MARQUE_CONFIG[marque.slug] ?? DEFAULT_CONFIG;
            const { Icon, grad, accent, items, tagline, sub } = cfg;
            const isDark = marque.slug === "fertivert";

            return (
              <motion.div
                key={marque.id_marque}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  href={`/${locale}/marques/${marque.slug}`}
                  className="group block rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* ── Header coloré ── */}
                  <div
                    className="relative p-8 pb-6 overflow-hidden"
                    style={{ background: grad }}
                  >
                    <div
                      className="absolute inset-0 opacity-[0.05] pointer-events-none"
                      style={{
                        backgroundImage: "radial-gradient(circle, black 1px, transparent 1px)",
                        backgroundSize:  "24px 24px",
                      }}
                    />

                    <div className="relative flex items-start justify-between">
                      <div>
                        {tagline && (
                          <span
                            className="inline-block text-[11px] font-bold tracking-widest uppercase mb-3 px-3 py-1 rounded-full"
                            style={{
                              background: isDark ? "rgba(255,255,255,0.15)" : `${accent}22`,
                              color:      isDark ? "rgba(255,255,255,0.9)" : accent,
                            }}
                          >
                            {tagline}
                          </span>
                        )}
                        <h3
                          className="text-2xl font-black mb-1"
                          style={{ color: isDark ? "#fff" : accent }}
                        >
                          {marque.nom}
                        </h3>
                        <p
                          className="text-sm font-medium"
                          style={{ color: isDark ? "rgba(255,255,255,0.65)" : `${accent}99` }}
                        >
                          {sub || marque.description?.substring(0, 50)}
                        </p>
                      </div>
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: isDark ? "rgba(255,255,255,0.12)" : `${accent}18` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: isDark ? "#fff" : accent }} />
                      </div>
                    </div>
                  </div>

                  {/* ── Corps blanc ── */}
                  <div className="bg-white p-6">
                    {(items.length > 0 ? items : [marque.description ?? "Découvrir la gamme"]).map(
                      (item, j) => (
                        <div key={j} className="flex items-center gap-2.5 mb-2.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: accent }}
                          />
                          <span className="text-sm text-gray-600">{item}</span>
                        </div>
                      )
                    )}

                    <div
                      className="mt-4 flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all"
                      style={{ color: accent }}
                    >
                      Découvrir la gamme
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}