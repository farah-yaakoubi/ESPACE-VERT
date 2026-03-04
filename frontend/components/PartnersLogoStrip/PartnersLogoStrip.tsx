"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const PARTNERS = [
  { name: "", src: "/logosPartenaires/logo baddar agricole.png", href: "#" },
  { name: "", src: "/logosPartenaires/logo stajap.png", href: "#" },
  { name: "", src: "/logosPartenaires/logo mendial irrigation.png", href: "#" },
];

const GREEN_DARK = "#006428";
const GREEN_LIME = "#8cb43c";

export default function PartnersLogoStrip() {
  return (
    <section style={{ background: "#ffffff" }} className="pb-14">
      <div className="px-6 pt-12 pb-8 max-w-[1400px] mx-auto flex items-end justify-between">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-black" style={{ color: "#0d1a0d" }}>
            Nos <span style={{ color: GREEN_DARK }}>Partenaires</span>
          </h2>
        </motion.div>
      </div>

      <div className="px-6 max-w-[860px] mx-auto">
        <div className="grid grid-cols-3 gap-5">
          {PARTNERS.map((partner, i) => (
            <motion.a
              key={partner.name}
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1], type: "spring", stiffness: 300, damping: 22 }}
              className="group relative flex flex-col items-center justify-center overflow-hidden"
              style={{
                height: 130,
                borderRadius: 18,
                background: "#f8faf5",
                border: "1.5px solid #e2edd8",
                boxShadow: "0 2px 14px rgba(0,100,40,0.07)",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              {/* Hover bg */}
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, rgba(140,180,60,0.10) 0%, rgba(0,100,40,0.04) 100%)" }}
              />

              {/* Logo coloré + floating animation */}
              <div className="relative z-10 flex items-center justify-center" style={{ width: "72%", height: 68 }}>
                <motion.div
                  className="relative w-full h-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5 + i * 0.7, ease: "easeInOut", delay: i * 0.9 }}
                >
                  <Image
                    src={partner.src}
                    alt={partner.name}
                    fill
                    className="object-contain"
                    style={{ filter: "drop-shadow(0 3px 10px rgba(0,100,40,0.22))" }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = "none";
                      const parent = img.parentElement;
                      if (parent) parent.innerHTML = `<div style='display:flex;flex-direction:column;align-items:center;gap:6px'><div style='width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#e8f5e0,#d0ecc0);display:flex;align-items:center;justify-content:center'><svg width=21 height=21 fill=none stroke=#006428 stroke-width=1.8 viewBox='0 0 24 24'><rect x=3 y=3 width=18 height=18 rx=3/><path stroke-linecap=round d='M3 9h18M9 21V9'/></svg></div><span style='font-size:11px;font-weight:700;color:#006428'>${partner.name}</span></div>`;
                    }}
                  />
                </motion.div>
              </div>

              {/* Nom */}
              <p className="relative z-10 mt-2 text-[11px] font-semibold group-hover:text-[#006428] transition-colors duration-300"
                style={{ color: "#9aaa9a" }}>
                {partner.name}
              </p>

              {/* Barre verte bas au hover */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${GREEN_DARK}, ${GREEN_LIME})`, borderRadius: "0 0 17px 17px" }}
              />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}