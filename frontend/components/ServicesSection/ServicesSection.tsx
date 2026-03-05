"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { TruckIcon, ShieldCheckIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

const IcoSeed    = (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 22V12M12 12C12 6 7 4 2 5c0 6 3 10 8 11 1 .3 2 0 2-4z"/><path d="M12 12c0-6 5-8 10-7-1 6-4 10-8 11-1 .3-2 0-2-4z"/></svg>;
const IcoPipe    = (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 8h12a4 4 0 0 1 4 4v.5"/><path d="M3 8l3-3M3 8l3 3"/><circle cx="19" cy="14.5" r="1.5"/></svg>;
const IcoLeaf    = (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M20 5c0 0-8 0-13 5C4 13 4 19 4 19s6 0 9-3c5-5 5-11 7-11z"/><path d="M4 19l7-7"/></svg>;
const IcoTractor = (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="6" cy="17" r="3"/><circle cx="16" cy="18" r="2"/><path d="M9 17h5V12L11 7H5v10M14 12h5l-2-5"/></svg>;
const IcoWind    = (p: any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 8h13a4 4 0 1 0-4-4"/><path d="M3 12h10a3 3 0 1 1-3 3"/></svg>;

const SERVICE_CONFIGS = [
  { id:"seeds",        href:"/activites/semences-et-plants",      Icon:IcoSeed,    labelKey:"seeds_label", descKey:"seeds_desc", color:"#1a3d0a", bg:"#f0f9eb", border:"#c6e6a0" },
  { id:"irrigation",   href:"/activites/irrigation",              Icon:IcoPipe,    labelKey:"irr_label",   descKey:"irr_desc",   color:"#0d3b6e", bg:"#eff6ff", border:"#bfdbfe" },
  { id:"fertilization",href:"/activites/fertilisation",           Icon:IcoLeaf,    labelKey:"fert_label",  descKey:"fert_desc",  color:"#2d5a1b", bg:"#f0fdf4", border:"#a7f3d0" },
  { id:"machinery",    href:"/activites/machinisme-et-jardinage", Icon:IcoTractor, labelKey:"mach_label",  descKey:"mach_desc",  color:"#7c2d12", bg:"#fff7ed", border:"#fed7aa" },
  { id:"spraying",     href:"/activites/pulverisation",           Icon:IcoWind,    labelKey:"spray_label", descKey:"spray_desc", color:"#134e4a", bg:"#f0fdfa", border:"#99f6e4" },
];

const EXTRA_ICONS = [TruckIcon, ShieldCheckIcon, AcademicCapIcon];
const EXTRA_KEYS = [
  { title:"delivery_title", desc:"delivery_desc" },
  { title:"quality_title",  desc:"quality_desc" },
  { title:"training_title", desc:"training_desc" },
] as const;

export default function ServicesSection() {
  const t      = useTranslations("services");
  const locale = useLocale();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-[#2d5a1b] rounded-full" />
            <span className="text-xs font-black uppercase tracking-widest text-[#4a7c2f]">{t("tag")}</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-3">{t("title")}</h2>
          <p className="text-lg text-gray-500 max-w-2xl">{t("subtitle")}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {SERVICE_CONFIGS.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}>
              <Link href={`/${locale}${s.href}`}
                className="group flex flex-col h-full rounded-2xl border-2 p-6 transition-all duration-250 hover:-translate-y-1 hover:shadow-xl"
                style={{ borderColor:s.border, background:"#fff" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = s.bg; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
                <motion.div whileHover={{ scale:1.1, rotate:-5 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background:s.bg, color:s.color }}>
                  <s.Icon className="w-7 h-7" />
                </motion.div>
                <h3 className="text-[17px] font-black text-gray-900 mb-2">
                  <span className="group-hover:text-[#1a3d0a]">{t(s.labelKey)}</span>
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{t(s.descKey)}</p>
                <div className="mt-5 flex items-center gap-2 text-sm font-bold" style={{ color:s.color }}>
                  {t("learnMore")}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="rounded-3xl overflow-hidden"
          style={{ background:"linear-gradient(135deg, #1a3d0a 0%, #2d5a1b 60%, #4a7c2f 100%)" }}>
          <div className="relative p-8 lg:p-12">
            <div className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ backgroundImage:"radial-gradient(circle, white 1px, transparent 1px)", backgroundSize:"28px 28px" }} />
            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
              {EXTRA_KEYS.map((keys, i) => (
                <motion.div key={i} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                  className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0 text-white">
                    {(() => { const Icon = EXTRA_ICONS[i]; return <Icon className="w-7 h-7" />; })()}
                  </div>
                  <div>
                    <p className="text-white font-black text-[16px]">{t(keys.title)}</p>
                    <p className="text-white/60 text-sm">{t(keys.desc)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.3 }} className="text-center mt-12">
          <Link href={`/${locale}/contact`}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#1a3d0a] hover:bg-[#2d5a1b] text-white rounded-2xl font-bold text-[15px] transition-all shadow-lg hover:-translate-y-0.5">
            {t("cta")}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
