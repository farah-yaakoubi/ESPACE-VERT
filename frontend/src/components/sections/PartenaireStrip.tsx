"use client";
/**
 * PartenaireStrip — carousel infini de logos partenaires
 * Les logos sont chargés depuis /public/logosPartenaires/
 * Laisser les placeholders — l'utilisateur ajoutera ses images après
 */
import { useRef, useEffect } from "react";
import Image from "next/image";

// ⚠️  Ajoutez vos logos dans /public/logosPartenaires/ et listez-les ici
const PARTENAIRES = [
  { nom: "Mendial Irrigation",  logo: "/logosPartenaires/logo mendial irrigation.png"  },
  { nom: "Stajap",              logo: "/logosPartenaires/logo stajap.png"               },
  { nom: "Baddar Agricole",     logo: "/logosPartenaires/logo baddar agricole.png"      },
  // ← Ajoutez d'autres partenaires ici :
  // { nom: "Partenaire 4", logo: "/logosPartenaires/votre-logo.png" },
];

// Dupliquer pour l'effet infini sans coupure visible
const ITEMS = [...PARTENAIRES, ...PARTENAIRES, ...PARTENAIRES];

export function PartenaireStrip() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef  = useRef<number>(0);
  const posRef   = useRef<number>(0);
  const SPEED    = 0.4; // px/frame — ajustez la vitesse ici

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const loop = () => {
      posRef.current += SPEED;
      const itemW = track.scrollWidth / 3; // 1 des 3 copies
      if (posRef.current >= itemW) posRef.current = 0;
      track.style.transform = `translateX(-${posRef.current}px)`;
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <section className="py-14 bg-white border-y border-sand-200 overflow-hidden">
      <div className="container-ev mb-8 text-center">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.22em]">Nos Partenaires</p>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        {/* Fondu gauche */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(90deg, white, transparent)" }} />
        {/* Fondu droit */}
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(270deg, white, transparent)" }} />

        <div ref={trackRef} className="flex items-center gap-12 w-max will-change-transform">
          {ITEMS.map((p, i) => (
            <div key={i}
              className="flex items-center justify-center w-44 h-20 px-6 rounded-2xl border border-sand-100 hover:border-ev-200 bg-sand-50 hover:bg-ev-50 transition-all group cursor-default shrink-0">
              <Image
                src={p.logo}
                alt={p.nom}
                width={140}
                height={60}
                className="object-contain max-h-12 w-auto opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                onError={() => {}}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
