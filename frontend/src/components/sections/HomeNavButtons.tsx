"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Droplets, Leaf, ShieldCheck, Sprout, Wrench } from "lucide-react";
import { useRef, useState } from "react";

const GREEN_DARK = "#0a6030";
const GREEN_MAIN = "#7dc040";

const ACTIVITES = [
  {
    href: "/activites/semences-et-plants",
    label: "Semences & Plants",
    image: "/images/activites/semences-plants.webp",
    icon: Sprout,
    badge: "Activite principale",
    description: "Des semences de qualite superieure pour des recoltes abondantes et durables.",
  },
  {
    href: "/activites/irrigation",
    label: "Irrigation",
    image: "/images/activites/irrigation.webp",
    icon: Droplets,
  },
  {
    href: "/activites/fertilisation",
    label: "Fertilisation",
    image: "/images/activites/fertilisation.webp",
    icon: ShieldCheck,
  },
  {
    href: "/activites/machinisme-et-jardinage",
    label: "Machinisme",
    image: "/images/hero/jardinage-desktop.webp",
    icon: Wrench,
  },
  {
    href: "/activites/pulverisation",
    label: "Pulverisation",
    image: "/images/activites/pulverisation.webp",
    icon: Leaf,
  },
];

const MARQUES = [
  {
    href: "/marques/fertivert",
    label: "Fertivert",
    image: "/logos/FERTIVERT LOGO.png",
    themeLabel: "Fertilisation",
    description: "Solutions innovantes en nutrition des plantes pour des cultures plus performantes.",
    accent: "#8ac94f",
    copyColor: "rgba(231,244,236,0.9)",
    linkColor: "#8ac94f",
    cardBackground: "linear-gradient(180deg,#0d5a32 0%,#084824 100%)",
    cardBorder: "rgba(8,72,36,0.12)",
    logoPanel: "rgba(5,43,22,0.16)",
    logoBorder: "rgba(255,255,255,0.08)",
    glow: "0 28px 60px rgba(10,96,48,0.22)",
    decor: "plant" as const,
    featured: true,
  },
  {
    href: "/marques/pulvert",
    label: "Pulvert",
    image: "/logos/PULVERT LOGO1.png",
    themeLabel: "Pulverisation",
    description: "Specialiste des solutions de protection des cultures efficaces et responsables.",
    accent: "#8fbf2f",
    copyColor: "#405247",
    linkColor: "#5f9d1f",
    cardBackground: "linear-gradient(180deg,#f3f8ea 0%,#eef5e2 100%)",
    cardBorder: "rgba(125,192,64,0.16)",
    logoPanel: "rgba(255,255,255,0.9)",
    logoBorder: "rgba(125,192,64,0.14)",
    glow: "0 24px 56px rgba(119,160,61,0.16)",
    decor: "spray" as const,
    featured: false,
  },
  {
    href: "/marques/matar",
    label: "Matar",
    image: "/logos/MATAR LOGO1.png",
    themeLabel: "Irrigation",
    description: "Engages pour des productions durables et un avenir plus vert.",
    accent: "#2f78d8",
    copyColor: "#445066",
    linkColor: "#2f78d8",
    cardBackground: "linear-gradient(180deg,#ffffff 0%,#f8fbff 100%)",
    cardBorder: "rgba(47,120,216,0.12)",
    logoPanel: "#ffffff",
    logoBorder: "rgba(47,120,216,0.12)",
    glow: "0 24px 56px rgba(98,139,203,0.14)",
    decor: "water" as const,
    featured: false,
  },
];

function ArrowThin({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 7H26M26 7L20 1M26 7L20 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlantSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 420" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38 420C43 360 52 315 68 278C86 236 112 200 144 166C149 160 157 160 161 165C165 170 165 177 160 182C128 216 106 249 90 288C76 323 67 367 63 420H38Z" fill="currentColor" />
      <path d="M127 164C118 123 127 89 157 63C178 45 202 34 228 29C228 58 219 84 201 105C182 128 158 145 127 164Z" fill="currentColor" />
      <path d="M152 224C144 187 152 158 175 137C193 121 213 111 236 107C236 135 228 158 212 177C195 197 175 212 152 224Z" fill="currentColor" />
      <path d="M93 215C66 195 50 169 46 137C43 113 47 91 59 72C79 85 94 101 104 121C115 143 111 174 93 215Z" fill="currentColor" />
      <path d="M75 301C49 282 34 258 29 228C26 208 28 189 36 171C56 181 71 195 82 214C94 235 92 264 75 301Z" fill="currentColor" />
      <path d="M149 324C143 293 150 268 168 249C184 232 202 222 223 219C223 243 216 263 203 279C189 297 171 311 149 324Z" fill="currentColor" />
    </svg>
  );
}

function DotPattern({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="brand-dots" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="140" height="140" fill="url(#brand-dots)" />
    </svg>
  );
}

function SprayPattern({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="76" cy="112" r="56" stroke="currentColor" strokeWidth="4" opacity="0.55" />
      <circle cx="76" cy="112" r="82" stroke="currentColor" strokeWidth="2.5" opacity="0.22" />
      <path d="M119 99L194 77" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.72" />
      <path d="M124 112H207" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.72" />
      <path d="M119 125L194 148" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.72" />
      <path d="M146 84L168 76M166 93L195 84M174 110L211 110M166 128L195 136M146 140L168 149" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeDasharray="4 10" opacity="0.72" />
    </svg>
  );
}

function WaveAccent({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M240 160H73C95 141 119 132 143 133C169 134 194 145 240 160Z" fill="#d9ecff" />
      <path d="M240 160H97C116 143 137 134 160 136C186 138 209 148 240 160Z" fill="#bde5ef" />
      <path d="M240 160H120C139 147 160 140 182 141C202 142 220 149 240 160Z" fill="#a7d7ef" />
    </svg>
  );
}

function IrrigationPattern({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 157C42 135 69 124 97 125C129 126 159 142 185 157C211 172 233 181 260 182" stroke="currentColor" strokeWidth="12" strokeLinecap="round" opacity="0.3" />
      <path d="M34 190C61 168 89 157 118 158C149 159 178 174 203 189C223 200 242 205 260 206" stroke="currentColor" strokeWidth="9" strokeLinecap="round" opacity="0.24" />
      <circle cx="173" cy="84" r="30" stroke="currentColor" strokeWidth="6" opacity="0.18" />
      <circle cx="173" cy="84" r="56" stroke="currentColor" strokeWidth="3" opacity="0.12" />
      <path d="M173 38C182 53 190 65 190 77C190 93 182 108 173 118C163 108 156 93 156 77C156 65 164 53 173 38Z" fill="currentColor" opacity="0.28" />
    </svg>
  );
}

function ActivityShowcaseItem({
  item,
  index,
  featured = false,
}: {
  item: typeof ACTIVITES[0];
  index: number;
  featured?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const Icon = item.icon;
  const labelLines = featured ? item.label.split(" & ") : item.label.split(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full min-w-0"
    >
      <Link href={item.href} className="group block w-full cursor-pointer">
        <div
          className={`activity-card relative overflow-hidden border border-white/60 shadow-[0_18px_44px_rgba(10,96,48,0.12)] ${
            featured ? "min-h-[530px] rounded-[32px] sm:min-h-[560px]" : "min-h-[248px] rounded-[28px] sm:min-h-[264px]"
          }`}
        >
          <div
            aria-hidden
            className="absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(125,192,64,0.18), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(10,96,48,0.08))",
            }}
          />
          {!imgError ? (
            <Image
              src={item.image}
              alt={item.label}
              width={960}
              height={1240}
              quality={100}
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.08]"
              sizes={featured ? "(max-width:1024px) 100vw, 52vw" : "(max-width:640px) 100vw, (max-width:1024px) 50vw, 28vw"}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="absolute inset-0 bg-[#1a3a20]"
            />
          )}
          <div
            className={`absolute inset-0 z-10 transition-opacity duration-500 group-hover:opacity-90 ${
              featured
                ? "bg-[linear-gradient(180deg,rgba(8,28,11,0.08)_0%,rgba(8,28,11,0.34)_55%,rgba(8,28,11,0.74)_100%)]"
                : "bg-[linear-gradient(180deg,rgba(8,28,11,0.08)_0%,rgba(8,28,11,0.24)_56%,rgba(8,28,11,0.64)_100%)]"
            }`}
          />
          <div
            aria-hidden
            className="absolute inset-x-[14%] top-0 z-10 h-16 rounded-b-full bg-white/18 blur-2xl opacity-70 transition-all duration-700 group-hover:h-20 group-hover:opacity-100"
          />

          <div className="absolute left-5 top-5 z-20 sm:left-6 sm:top-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#89926f]/85 text-white shadow-[0_14px_32px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
              <Icon className="h-6 w-6" />
            </div>
          </div>

          <div className={`absolute inset-x-0 bottom-0 z-20 ${featured ? "p-6 sm:p-8" : "p-5 sm:p-6"}`}>
            {featured && item.badge && (
              <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#2dd36f] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-[0_10px_24px_rgba(45,211,111,0.28)]">
                <span className="text-sm">✦</span>
                {item.badge}
              </span>
            )}

            <div className={featured ? "max-w-[88%]" : "max-w-[88%]"}>
              <p className={`text-white ${featured ? "text-[2rem] font-black leading-[1.02] tracking-[-0.04em] sm:text-[2.35rem]" : "text-[1.05rem] font-black leading-[1.05] sm:text-[1.12rem]"}`}>
                {labelLines.map((line, lineIndex) => (
                  <span key={`${item.href}-${lineIndex}`} className="block">
                    {line}
                  </span>
                ))}
              </p>

              {featured && item.description && (
                <p className="mt-4 max-w-[24ch] text-[1.02rem] leading-8 text-white/90">
                  {item.description}
                </p>
              )}

              {featured && (
                <span className="mt-6 inline-flex items-center gap-2 text-base font-bold text-white">
                  Decouvrir
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function BrandShowcaseCard({
  item,
  index,
}: {
  item: (typeof MARQUES)[number];
  index: number;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: 0.08 + index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`min-w-0 ${item.featured ? "xl:pt-0" : "xl:pt-7"}`}
    >
      <Link
        href={item.href}
        className="group relative flex h-full min-h-[360px] flex-col overflow-hidden rounded-[30px] border p-5 sm:min-h-[420px] sm:p-6 xl:min-h-[535px]"
        style={{
          background: item.cardBackground,
          borderColor: item.cardBorder,
          boxShadow: item.glow,
        }}
      >
        <div
          aria-hidden
          className="brand-ambient absolute inset-0 opacity-80"
          style={{
            background: "radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 42%)",
          }}
        />

        <div
          aria-hidden
          className="brand-ambient absolute inset-0 scale-[1.02] transition-transform duration-700 group-hover:scale-[1.08]"
          style={{
            background:
              item.decor === "plant"
                ? "radial-gradient(circle at 22% 18%, rgba(138,201,79,0.22), transparent 26%), radial-gradient(circle at 80% 78%, rgba(255,255,255,0.10), transparent 20%)"
                : item.decor === "spray"
                  ? "radial-gradient(circle at 72% 26%, rgba(143,191,47,0.18), transparent 28%), radial-gradient(circle at 28% 82%, rgba(255,255,255,0.32), transparent 20%)"
                  : "radial-gradient(circle at 78% 18%, rgba(47,120,216,0.14), transparent 25%), radial-gradient(circle at 22% 82%, rgba(94,188,213,0.12), transparent 20%)",
          }}
        />

        {item.decor === "plant" && (
          <>
            <PlantSilhouette className="brand-float absolute -bottom-8 right-[-14px] z-0 h-[215px] w-[150px] text-white/8 transition-transform duration-700 group-hover:translate-y-[-8px] group-hover:scale-110" />
            <PlantSilhouette className="brand-float-delayed absolute left-[-22px] top-[112px] z-0 h-[120px] w-[80px] text-[#98d66b]/15" />
          </>
        )}

        {item.decor === "spray" && (
          <>
            <SprayPattern className="brand-float absolute right-[-24px] top-[34px] z-0 h-[186px] w-[186px] text-[#a8ce49] transition-transform duration-700 group-hover:scale-110" />
            <DotPattern className="absolute bottom-[-8px] right-[-6px] z-0 h-[140px] w-[140px] text-[#d5e6af]" />
          </>
        )}

        {item.decor === "water" && (
          <>
            <IrrigationPattern className="brand-float absolute bottom-[24px] right-[-12px] z-0 h-[170px] w-[200px] text-[#5fb8d5] transition-transform duration-700 group-hover:scale-110" />
            <WaveAccent className="absolute bottom-0 right-0 z-0 h-[110px] w-[170px] opacity-90 sm:h-[126px] sm:w-[190px]" />
          </>
        )}

        <div
          className="relative z-10 overflow-hidden rounded-[24px] border"
          style={{
            background: item.logoPanel,
            borderColor: item.logoBorder,
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                item.decor === "plant"
                  ? "linear-gradient(135deg, rgba(255,255,255,0.06), transparent 52%)"
                  : item.decor === "spray"
                    ? "linear-gradient(135deg, rgba(255,255,255,0.5), transparent 48%)"
                    : "linear-gradient(135deg, rgba(226,240,255,0.7), rgba(255,255,255,0.2) 52%, transparent 72%)",
            }}
          />
          {!imgError ? (
            <Image
              src={item.image}
              alt={item.label}
              width={720}
              height={420}
              quality={100}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 34vw"
              className="relative z-10 h-auto w-full object-contain px-2 py-1 transition-transform duration-700 group-hover:scale-[1.12]"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-[210px] items-center justify-center sm:h-[250px]">
              <span
                className="text-3xl font-black"
                style={{ color: item.linkColor, fontFamily: "var(--font-display)" }}
              >
                {item.label}
              </span>
            </div>
          )}
        </div>

        <div className="relative z-10 mt-4 flex flex-1 flex-col justify-end">
          <span
            className="mb-4 inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.22em]"
            style={{
              color: item.linkColor,
              background:
                item.decor === "plant"
                  ? "rgba(255,255,255,0.08)"
                  : item.decor === "spray"
                    ? "rgba(143,191,47,0.14)"
                    : "rgba(47,120,216,0.10)",
            }}
          >
            {item.themeLabel}
          </span>
          <span
            className="block h-[3px] w-12 rounded-full"
            style={{ background: item.accent }}
          />
          <p
            className="mt-5 max-w-[17ch] text-[15px] leading-8 sm:text-[16px]"
            style={{ color: item.copyColor }}
          >
            {item.description}
          </p>
          <span
            className="mt-7 inline-flex items-center gap-2 text-sm font-bold"
            style={{ color: item.linkColor }}
          >
            En savoir plus
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function HomeNavButtons() {
  const activitiesRef = useRef<HTMLDivElement>(null);
  const activitiesInView = useInView(activitiesRef, { once: false, margin: "-80px" });
  const brandsRef = useRef<HTMLDivElement>(null);
  const brandsInView = useInView(brandsRef, { once: false, margin: "-100px" });
  const featuredActivity = ACTIVITES[0];
  const secondaryActivities = ACTIVITES.slice(1);

  return (
    <>
      <style>{`
        @keyframes activityGlow {
          0%, 100% { box-shadow: 0 18px 44px rgba(10,96,48,0.12); }
          50% { box-shadow: 0 24px 54px rgba(125,192,64,0.16); }
        }

        @keyframes brandFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes brandFloatDelayed {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.03); }
        }

        @keyframes brandAmbient {
          0%, 100% { transform: scale(1.02) translate3d(0,0,0); opacity: 0.72; }
          50% { transform: scale(1.08) translate3d(6px,-4px,0); opacity: 0.96; }
        }

        .activity-card {
          animation: activityGlow 8.4s ease-in-out infinite;
        }

        .brand-float {
          animation: brandFloat 6.4s ease-in-out infinite;
        }

        .brand-float-delayed {
          animation: brandFloatDelayed 7.2s ease-in-out infinite;
        }

        .brand-ambient {
          animation: brandAmbient 8.5s ease-in-out infinite;
        }
      `}</style>

      <section style={{ background: "linear-gradient(180deg,#fcfdfb 0%,#f6fbf3 100%)" }}>
      <div id="nos-activites" ref={activitiesRef} className="container-ev relative pt-10 pb-8 sm:pt-12 sm:pb-10">
        <div
          aria-hidden
          className="absolute left-[2%] top-10 h-40 w-40 rounded-full blur-3xl"
          style={{ background: "rgba(125,192,64,0.08)" }}
        />
        <div
          aria-hidden
          className="absolute right-[14%] top-16 h-28 w-28 rounded-full blur-3xl"
          style={{ background: "rgba(125,192,64,0.10)" }}
        />

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[760px] pt-2">
            <motion.p
              animate={{ opacity: activitiesInView ? 1 : 0, x: activitiesInView ? 0 : -40 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3"
              style={{ color: GREEN_MAIN, fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 10 }}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-current" />
              Nos activites
            </motion.p>
            <motion.h2
              animate={{ opacity: activitiesInView ? 1 : 0, x: activitiesInView ? 0 : -48 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(2.6rem,4.9vw,5.2rem)] font-black leading-[0.94] tracking-[-0.055em]"
              style={{ color: "#102315" }}
            >
              Des solutions completes
              <br />
              <span style={{ color: GREEN_DARK }}>pour chaque besoin</span>
            </motion.h2>
            <motion.p
              animate={{ opacity: activitiesInView ? 1 : 0, y: activitiesInView ? 0 : 16 }}
              transition={{ duration: 0.45, delay: 0.16 }}
              className="mt-6 max-w-[360px] text-[17px] leading-8 text-[#667268]"
            >
              Decouvrez nos domaines d&apos;expertise pour accompagner chaque etape de votre production.
            </motion.p>
          </div>

          <motion.div
            animate={{ opacity: activitiesInView ? 1 : 0, y: activitiesInView ? 0 : 16 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="lg:shrink-0"
          >
            <Link
              href="/activites"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-[15px] font-bold text-white shadow-[0_18px_40px_rgba(10,96,48,0.24)] transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#0d7a39,#148a42)" }}
            >
              Voir toutes nos activites
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>

        <div className="relative z-10 mt-10 grid gap-7 xl:grid-cols-[1.15fr_1.1fr] xl:items-stretch">
          <ActivityShowcaseItem item={featuredActivity} index={0} featured />

          <div className="grid gap-7 sm:grid-cols-2">
            {secondaryActivities.map((item, index) => (
              <ActivityShowcaseItem key={item.href} item={item} index={index + 1} />
            ))}
          </div>
        </div>
      </div>

      <div
        id="nos-marques"
        ref={brandsRef}
        className="relative overflow-hidden"
        style={{
          background: "radial-gradient(circle at 18% 16%, rgba(125,192,64,0.08), transparent 30%), linear-gradient(180deg,#fcfdf9 0%,#f9fbf5 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 78% 28%, rgba(125,192,64,0.09), transparent 16%)",
          }}
        />
        <PlantSilhouette className="absolute -left-14 bottom-[-26px] hidden h-[420px] w-[230px] text-[#dbe8c7] md:block" />
        <PlantSilhouette className="absolute right-[10%] top-[48px] hidden h-[180px] w-[96px] -scale-x-100 text-[#eef4e1] xl:block" />

        <div className="container-ev relative z-10 py-12 sm:py-14 xl:py-16">
          <div className="grid gap-8 xl:grid-cols-[minmax(290px,360px)_minmax(0,1fr)] xl:items-start xl:gap-10">
            <div className="max-w-[360px] xl:pt-4">
              <motion.div
                animate={{ opacity: brandsInView ? 1 : 0, x: brandsInView ? 0 : -34 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-3"
                style={{ color: GREEN_MAIN }}
              >
                <span className="text-[11px] font-extrabold uppercase tracking-[0.28em]">
                  Nos marques
                </span>
                <span className="h-px w-12 rounded-full bg-current" />
                <Leaf className="h-4 w-4" strokeWidth={2.1} />
              </motion.div>

              <motion.h2
                animate={{ opacity: brandsInView ? 1 : 0, x: brandsInView ? 0 : -40 }}
                transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 text-[clamp(2.35rem,5vw,5rem)] font-black leading-[0.9] tracking-[-0.055em]"
                style={{ color: "#0e2113" }}
              >
                Trois marques,
                <br />
                <span style={{ color: GREEN_DARK }}>une expertise</span>
              </motion.h2>

              <motion.p
                animate={{ opacity: brandsInView ? 1 : 0, y: brandsInView ? 0 : 16 }}
                transition={{ duration: 0.45, delay: 0.16 }}
                className="mt-5 max-w-[280px] text-[16px] leading-8 text-[#677367] sm:text-[17px]"
              >
                Une presentation plus simple et plus visuelle.
              </motion.p>

              <motion.div
                animate={{ opacity: brandsInView ? 1 : 0, y: brandsInView ? 0 : 16 }}
                transition={{ duration: 0.45, delay: 0.22 }}
                className="mt-8"
              >
                <Link
                  href="/marques"
                  className="inline-flex items-center gap-3 rounded-full px-6 py-4 text-sm font-bold text-white shadow-[0_22px_48px_rgba(10,96,48,0.24)] transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg,#0c6531,#168345)" }}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/14">
                    <Leaf className="h-4 w-4" strokeWidth={2.3} />
                  </span>
                  Decouvrir nos marques
                </Link>
              </motion.div>
            </div>

            <div>
              <motion.div
                animate={{ opacity: brandsInView ? 1 : 0, y: brandsInView ? 0 : -12 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="mb-5 hidden justify-end xl:flex"
              >
                <Link
                  href="/marques"
                  className="inline-flex items-center gap-2 text-[15px] font-bold transition-opacity hover:opacity-70"
                  style={{ color: GREEN_DARK }}
                >
                  Voir tout <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.06fr_0.98fr_0.98fr] xl:gap-5">
                {MARQUES.map((item, index) => (
                  <BrandShowcaseCard key={item.href} item={item} index={index} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 xl:hidden">
            <Link
              href="/marques"
              className="inline-flex items-center gap-2 text-sm font-bold"
              style={{ color: GREEN_DARK }}
            >
              Voir toutes les marques <ArrowThin className="h-[9px] w-6" />
            </Link>
          </div>
        </div>
      </div>

      </section>
    </>
  );
}
