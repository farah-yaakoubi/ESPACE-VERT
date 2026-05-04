"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const GREEN_DARK = "#0a6030";
const GREEN_MAIN = "#7dc040";

const ACTIVITES = [
  { href:"/activites/semences-et-plants",      label:"Semences & Plants",      image:"/images/activites/semences.jpg"  },
  { href:"/activites/irrigation",              label:"Irrigation",              image:"/images/activites/irrigation.jpg" },
  { href:"/activites/fertilisation",           label:"Fertilisation",           image:"/images/activites/fertilisation.jpg" },
  { href:"/activites/machinisme-et-jardinage", label:"Machinisme & Jardinage",  image:"/images/activites/machinisme.jpg" },
  { href:"/activites/pulverisation",           label:"Pulvérisation",           image:"/images/activites/pulverisation.jpg" },
];

const MARQUES = [
  { href:"/marques/fertivert", label:"Fertivert", image:"/logos/FERTIVERT LOGO.png" },
  { href:"/marques/pulvert",   label:"Pulvert",   image:"/logos/PULVERT LOGO1.png"   },
  { href:"/marques/matar",     label:"Matar",     image:"/logos/MATAR LOGO1.png"     },
];

function ArrowThin({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 7H26M26 7L20 1M26 7L20 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ActivityCard({ item, index }: { item: typeof ACTIVITES[0]; index: number }) {
  const [imgError, setImgError] = useState(false);
  return (
    <motion.div
      initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
      transition={{ delay: index * 0.07, duration:0.45, ease:[0.22,1,0.36,1] }}
      className="flex-1 min-w-0" style={{ height:"clamp(260px,40vw,440px)" }}>
      <Link href={item.href} className="group relative block w-full h-full overflow-hidden cursor-pointer">
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform">
          {!imgError ? (
            <Image src={item.image} alt={item.label} fill className="object-cover object-center" sizes="20vw" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full bg-[#1a3a20]" />
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 h-28 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 py-4 flex items-end justify-between">
          <span className="text-white font-bold leading-tight drop-shadow-sm" style={{ fontSize:"clamp(12px,1.1vw,15px)" }}>
            {item.label}
          </span>
          <motion.div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{
              width: 38, height: 38,
              background: "rgba(255,255,255,0.12)",
              border: "1.5px solid rgba(255,255,255,0.35)",
              backdropFilter: "blur(6px)",
            }}
            whileHover={{ scale: 1.12, background: GREEN_MAIN, borderColor: GREEN_MAIN }}
            transition={{ type:"spring", stiffness:400, damping:18 }}
          >
            <ArrowThin className="w-5 h-[10px] text-white transition-transform duration-300 group-hover:translate-x-0.5" />
          </motion.div>
        </div>
        <div className="absolute inset-0 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow:`inset 0 0 0 3px ${GREEN_MAIN}` }} />
      </Link>
    </motion.div>
  );
}

function BrandCard({ item, index }: { item: typeof MARQUES[0]; index: number }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <motion.div
      initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
      transition={{ delay: 0.1 + index * 0.09, duration:0.45, ease:[0.22,1,0.36,1] }}
      className="flex-1 min-w-0"
      style={{ height: 200 }}>
      <Link href={item.href} className="group relative block w-full h-full overflow-hidden cursor-pointer">

        {/* Image — même pattern que Hero */}
        <div className="absolute inset-0">
          {!imgErr ? (
            <Image
              src={item.image}
              alt={item.label}
              fill
              className="object-cover object-center"
              sizes="33vw"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gray-100" />
          )}
        </div>

        {/* Flèche bas droite au hover */}
        <div
          className="absolute bottom-3 right-4 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
          style={{ color: GREEN_DARK }}
        >
          <span className="text-[11px] font-semibold tracking-wide">Voir</span>
          <ArrowThin className="w-6 h-[9px]" />
        </div>

        {/* Outline vert au hover */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow:`inset 0 0 0 3px ${GREEN_MAIN}` }}
        />
      </Link>
    </motion.div>
  );
}

export default function HomeNavButtons() {
  return (
    <section style={{ background:"#ffffff" }}>
      {/* Header Activités */}
      <div className="px-6 pt-12 pb-5 max-w-[1400px] mx-auto flex items-end justify-between">
        <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color:GREEN_MAIN }}>Notre expertise</p>
          <h2 className="text-3xl font-black" style={{ color:"#1a2e1a" }}>
            Nos activités <span style={{ color:GREEN_DARK }}>agricoles</span>
          </h2>
        </motion.div>
        <Link href="/activites" className="hidden sm:flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color:GREEN_DARK }}>
          Voir tout <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex" style={{ gap:0 }} id="nos-activites">
        {ACTIVITES.map((item, i) => (
          <ActivityCard key={item.href} item={item} index={i} />
        ))}
      </div>

      {/* Header Marques */}
      <div id="nos-marques" className="px-6 pt-12 pb-4 max-w-[1400px] mx-auto flex items-end justify-between">
        <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color:GREEN_MAIN }}>Nos marques</p>
          <h2 className="text-3xl font-black" style={{ color:"#1a2e1a" }}>
            Trois marques, <span style={{ color:GREEN_DARK }}>une expertise</span>
          </h2>
        </motion.div>
        <Link href="/marques" className="hidden sm:flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color:GREEN_DARK }}>
          Voir tout <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex pb-12" style={{ gap:0 }}>
        {MARQUES.map((m, i) => (
          <BrandCard key={m.href} item={m} index={i} />
        ))}
      </div>
    </section>
  );
}