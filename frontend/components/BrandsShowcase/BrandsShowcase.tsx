"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale } from "next-intl";

const IcoFlask = (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M9 3h6M10 3v6L5 17a2 2 0 0 0 1.7 3h10.6A2 2 0 0 0 19 17l-5-8V3"/><path d="M7 16h10"/></svg>;
const IcoPump  = (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><rect x="4" y="7" width="8" height="12" rx="1"/><path d="M12 10h4a2 2 0 0 1 2 2v5M18 17h2M4 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IcoDrop  = (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 2L6 10a7 7 0 1 0 12 0L12 2z"/></svg>;

const brands = [
  {
    id: "fertivert",
    name: "Fertivert",
    sub: "Fertilisation & Nutrition",
    tagline: "Pro · Garden",
    desc: "Gamme complète d'engrais organiques, minéraux et biostimulants pour l'agriculture professionnelle et le jardinage.",
    Icon: IcoFlask,
    grad: "linear-gradient(135deg, #0a6030 0%, #2d5a1b 55%, #4a7c2f 100%)",
    accent: "#0a6030",
    items: ["Support de Culture", "Engrais de Fond", "Engrais Organique", "Fertilisant Spécialisé"],
  },
  {
    id: "pulvert",
    name: "Pulvert",
    sub: "Pulvérisation & Traitement",
    tagline: "Pro",
    desc: "Solutions de pulvérisation professionnelles — matériel de traitement des cultures haute précision.",
    Icon: IcoPump,
    grad: "linear-gradient(135deg, #fdfbea 0%, #f4f0c4 55%, #e8e090 100%)",
    accent: "#6b5a00",
    items: ["Pulvérisateurs à dos", "Pulvérisateurs sur roues", "Accessoires & pièces"],
  },
  {
    id: "matar",
    name: "Matar",
    sub: "Irrigation & Arrosage",
    tagline: "Pro",
    desc: "Systèmes d'irrigation goutte-à-goutte, aspersion et micro-irrigation pour toutes cultures.",
    Icon: IcoDrop,
    grad: "linear-gradient(135deg, #eff8ff 0%, #d4eeff 55%, #b8dfff 100%)",
    accent: "#1b4d7a",
    items: ["Goutte-à-goutte", "Aspersion", "Raccorderie & tuyaux"],
  },
];

export default function BrandsShowcase() {
  const locale = useLocale();

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
            <span className="text-xs font-black uppercase tracking-widest text-[#4a7c2f]">Nos marques</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-3">
            Des marques de confiance
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl">
            Chaque marque couvre un domaine d'expertise précis pour répondre à tous vos besoins agricoles.
          </p>
        </motion.div>

        {/* ── Grille ── */}
        <div className="grid md:grid-cols-3 gap-6">
          {brands.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/${locale}/marques/${b.id}`} className="group block h-full">
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="relative rounded-3xl overflow-hidden h-full shadow-lg hover:shadow-2xl transition-shadow"
                  style={{ background: b.grad }}
                >
                  {/* Motif déco */}
                  <div className="absolute inset-0 opacity-8 pointer-events-none"
                    style={{ backgroundImage: "radial-gradient(circle, rgba(10,96,48,0.08) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                  <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/30 rounded-full pointer-events-none" />
                  <div className="absolute -left-4 top-1/2 w-16 h-16 bg-white/20 rounded-full pointer-events-none" />

                  <div className="relative z-10 p-8 flex flex-col h-full min-h-[340px]">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center group-hover:bg-white/80 transition-colors border border-white/50">
                        <b.Icon className="w-7 h-7" style={{ color: b.accent }} />
                      </div>
                      <span className="text-[11px] font-black border px-2.5 py-1 rounded-full bg-white/50">
                        {b.tagline}
                      </span>
                    </div>

                    {/* Nom */}
                    <h3 className="text-3xl font-black mb-1">{b.name}</h3>
                    <p className="text-sm font-semibold mb-4 opacity-70">{b.sub}</p>

                    {/* Description */}
                    <p className="text-[13px] leading-relaxed mb-6 flex-1 opacity-75">{b.desc}</p>

                    {/* Items */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {b.items.map(item => (
                        <span key={item}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/60 border border-white/40">
                          {item}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 font-bold text-sm group-hover:gap-3 transition-all">
                      <span>Découvrir la gamme</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Lien voir toutes */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            href={`/${locale}/marques`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0a6030] hover:bg-[#2d5a1b] text-white rounded-2xl font-bold text-[15px] transition-all shadow-lg shadow-[#0a6030]/20 hover:-translate-y-0.5"
          >
            Voir toutes nos marques
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
