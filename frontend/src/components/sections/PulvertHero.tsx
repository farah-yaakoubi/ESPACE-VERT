import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PulvertHeroProps {
  // Conservé pour compatibilité avec les pages existantes (non utilisé dans le hero).
  categories?: unknown[];
  ctaHref?: string;
  image?: string;
}

const DEFAULT_HERO_IMAGE = "/images/pulverisation/big-banner-pulverisation.webp";

export function PulvertHero({
  ctaHref = "#categories-pulvert",
  image = DEFAULT_HERO_IMAGE,
}: PulvertHeroProps) {
  return (
    <section className="relative flex min-h-[560px] flex-col overflow-hidden bg-[#eef4e7] pt-[calc(var(--nav-h)+8px)] md:min-h-[640px]">
      <style>{`
        @keyframes pulvertFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulvertSweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .pulvert-anim { opacity: 0; animation: pulvertFadeUp 0.9s ease-out forwards; }
        .pulvert-anim-1 { animation-delay: 0.1s; }
        .pulvert-anim-2 { animation-delay: 0.45s; }
        .pulvert-anim-3 { animation-delay: 0.8s; }
        .pulvert-shine {
          background: linear-gradient(100deg, #fff 35%, #f4b923 50%, #fff 65%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: pulvertFadeUp 0.9s ease-out 0.1s forwards, pulvertSweep 6s linear 1.2s infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .pulvert-anim, .pulvert-shine { animation: none; opacity: 1; }
          .pulvert-shine { color: #fff; background: none; }
        }
      `}</style>

      <Image
        src={image}
        alt="Pulvérisateurs Pulvert et PulverAgro"
        fill
        priority
        className="object-cover object-bottom"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/70 via-black/35 to-transparent" />

      <div className="relative z-10 mt-auto mx-auto flex max-w-6xl flex-col items-center px-4 pb-10 text-center md:pb-14">
        <h1
          className="pulvert-anim pulvert-shine text-balance text-[2.25rem] font-black uppercase leading-none drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)] sm:text-5xl lg:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Solutions de pulvérisation avancées
        </h1>
        <p className="pulvert-anim pulvert-anim-2 mt-3 text-lg font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] md:text-2xl">
          Précision, performance, productivité
        </p>
        <Link
          href={ctaHref}
          className="pulvert-anim pulvert-anim-3 mt-6 inline-flex items-center gap-2 rounded bg-[#f4b923] px-7 py-3 text-sm font-extrabold text-[#0b3d2a] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-white"
        >
          Explorer nos produits
          <ChevronRight size={15} />
        </Link>
      </div>
    </section>
  );
}