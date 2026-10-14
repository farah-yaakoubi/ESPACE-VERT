"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, ChevronRight, Droplet, Leaf, ShieldCheck } from "lucide-react";
import { SectionTitleLine } from "@/components/ui/SectionTitleIcon";
import { getActivityCategoryHrefById } from "@/lib/category-url";

const FALLBACK_IMAGE = "/images/hero/bg-fertivert.webp";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/** Valeurs par défaut si l'admin n'a pas encore défini de point de recadrage. */
const DEFAULT_FOCAL = { mobile: 38, tablette: 42, desktop: 45 };

/** Détecte le format d'écran courant (mêmes seuils que les breakpoints Tailwind sm/lg). */
function useBreakpoint(): "mobile" | "tablette" | "desktop" {
  const [bp, setBp] = useState<"mobile" | "tablette" | "desktop">("desktop");
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setBp(w < 640 ? "mobile" : w < 1024 ? "tablette" : "desktop");
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return bp;
}

interface FertilisantCategory {
  id_categorie: number;
  nom: string;
  slug?: string;
  parent_id?: number | null;
  image?: string | null;
}

interface FertilisantHeroShowcaseProps {
  /** Titre — seule chose qui change vraiment entre les deux pages. */
  title: string;
  subtitle?: string;
  /** Clé du hero-slide côté admin, ex. "activite:fertilisation" ou "marque:fertivert". */
  heroSlideKey: string;
  fallbackImage?: string;
  /** Si fourni, le hero utilise cette image fixe et ne va plus chercher
   *  le hero-slide côté admin (image figée, non modifiable depuis le back-office). */
  staticImage?: string;
  ctaHref?: string;
  fichesTechniquesHref?: string;
  categories?: FertilisantCategory[];
  /** Si fourni, les catégories pointent vers /activites/[slug]/categorie/[path]. */
  activiteSlug?: string;
  /** Ancre utilisée pour les liens de la grille de catégories. */
  categoryAnchor?: string;
  /** Bandeau croisé vers Pollinisation & Protection — mettre à null pour le masquer. */
  crossSellHref?: string | null;
  showTypeCards?: boolean;
  minimalHero?: boolean;
}

/** ⚠️ Reprend les allégations du mockup telles quelles — à confirmer. */
const POINTS_FORTS = [
  { icon: Leaf,        label: "100% Naturel" },
  { icon: Droplet,     label: "Rendement +30%" },
  { icon: ShieldCheck, label: "Certifié Bio" },
];


/* ── Hero simple — même structure que le hero Semences & plants ─────────── */
const TYPE_SPEED_MS = 85;
const LETTER_FADE_MS = 850;

/** Coupe le titre en 2 lignes (avant « avec » si présent, sinon au milieu). */
function splitTitle(title: string): string[] {
  const i = title.indexOf(" avec ");
  if (i > 0) return [title.slice(0, i), title.slice(i + 1)];
  const words = title.split(" ");
  if (words.length < 4) return [title];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

function useTypewriter(text: string, speedMs: number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    if (!text) return;
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, speedMs);
    return () => clearInterval(id);
  }, [text, speedMs]);
  return { count };
}

function SimpleFertilisantHero({
  title,
  subtitle,
  image,
  ctaHref,
}: {
  title: string;
  subtitle: string;
  image: string;
  ctaHref: string;
}) {
  const lines = splitTitle(title);
  const { count } = useTypewriter(lines.join("\n"), TYPE_SPEED_MS);

  return (
    <section className="relative overflow-hidden bg-sand-50">
      <div className="relative flex min-h-[480px] items-center justify-center overflow-hidden lg:min-h-[560px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="Fertilisation" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/25" />

        <div
          className="container-ev relative z-10 flex flex-col items-center text-center"
          style={{ paddingTop: "calc(var(--nav-h, 80px) + 12px)" }}
        >
          <p
            className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.22em] text-white sm:text-[13px]"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}
          >
            Fertilisation
          </p>

          <h1
            className="min-h-[2.2em] text-[clamp(2rem,4.4vw,3.2rem)] font-black leading-[1.08] tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 10px rgba(0,0,0,0.35)" }}
          >
            {lines.map((line, lineIndex) => {
              const lineOffset = lines
                .slice(0, lineIndex)
                .reduce((sum, item) => sum + item.length + 1, 0);
              return (
                <span key={lineIndex}>
                  {lineIndex > 0 && <br />}
                  {line.split("").map((char, charIndex) => (
                    <span
                      key={`${lineIndex}-${charIndex}`}
                      className="inline-block transition-opacity ease-out"
                      style={{
                        opacity: count > lineOffset + charIndex ? 1 : 0,
                        transitionDuration: `${LETTER_FADE_MS}ms`,
                        width: char === " " ? "0.35em" : undefined,
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>
              );
            })}
          </h1>

          <p
            className="mt-4 max-w-lg text-[13.5px] font-medium text-white/90 sm:text-sm"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
          >
            {subtitle}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-ev-700 px-6 py-3.5 text-[13.5px] font-bold uppercase tracking-wide text-white transition-colors duration-200 hover:bg-ev-800"
            >
              Découvrir nos produits
              <ArrowRight size={16} />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-[#1b2118]/10 bg-white/90 px-6 py-3.5 text-[13.5px] font-bold uppercase tracking-wide text-[#1b2118] transition-colors duration-200 hover:bg-white"
            >
              Conseil personnalisé
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FertilisantHeroShowcase({
  title,
  subtitle = "Des solutions de fertilisation durables pour une croissance exceptionnelle.",
  heroSlideKey,
  fallbackImage = FALLBACK_IMAGE,
  staticImage,
  ctaHref = "#produits-activite",
  fichesTechniquesHref = "/rendez-vous",
  categories = [],
  activiteSlug,
  categoryAnchor = "produits-activite",
  crossSellHref = "/activites/pollinisation-et-protection-des-plantes",
  showTypeCards = true,
  minimalHero = false,
}: FertilisantHeroShowcaseProps) {
  const [image, setImage] = useState<string>(staticImage ?? fallbackImage);
  const [focal, setFocal] = useState(DEFAULT_FOCAL);
  const breakpoint = useBreakpoint();

  useEffect(() => {
    // Image figée : on n'interroge plus l'admin, le hero reste fixe.
    if (staticImage) return;
    if (minimalHero) return;

    let cancelled = false;
    fetch(`${BASE}/hero-slides?page=${heroSlideKey}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(
        (
          data: {
            image: string;
            actif: boolean;
            ordre: number;
            focalYMobile?: number;
            focalYTablette?: number;
            focalYDesktop?: number;
          }[]
        ) => {
          if (cancelled) return;
          const first = data.filter((s) => s.actif).sort((a, b) => a.ordre - b.ordre)[0];
          if (first?.image) setImage(first.image);
          if (first) {
            setFocal({
              mobile: first.focalYMobile ?? DEFAULT_FOCAL.mobile,
              tablette: first.focalYTablette ?? DEFAULT_FOCAL.tablette,
              desktop: first.focalYDesktop ?? DEFAULT_FOCAL.desktop,
            });
          }
        }
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [heroSlideKey, minimalHero]);

  // Pages Fertilisation & Fertivert : hero simple, comme Semences & plants.
  if (minimalHero) {
    return <SimpleFertilisantHero title={title} subtitle={subtitle} image={image} ctaHref={ctaHref} />;
  }

  const typeCards = categories.filter((c) => !!c.image);

  return (
    <section className="relative">
      {/* ── Hero — photo plein cadre + carte flottante ──────────────── */}
      {/*
        Hauteur du hero fixée par breakpoint (mobile / tablette / desktop) ci-dessous.
        Le point de recadrage (crop) est lui piloté depuis l'admin (§Hero) — voir `focal` plus haut ;
        DEFAULT_FOCAL ne sert que de repli si l'admin n'a rien renseigné pour ce slide.
      */}
      <div
        className={
          minimalHero
            ? "relative min-h-[430px] overflow-hidden sm:min-h-[470px] lg:min-h-[520px]"
            : "relative min-h-[390px] overflow-hidden sm:min-h-[420px] lg:min-h-[450px]"
        }
      >
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: minimalHero ? "center center" : `center ${focal[breakpoint]}%`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              minimalHero
                ? "linear-gradient(180deg, rgba(3,15,7,0.18) 0%, rgba(3,15,7,0.03) 42%, rgba(3,15,7,0.42) 100%)"
                : "linear-gradient(90deg, rgba(6,18,9,0.68) 0%, rgba(12,49,18,0.44) 34%, rgba(8,20,10,0.08) 67%, rgba(8,20,10,0.22) 100%)",
          }}
        />

        <div
          className={
            minimalHero
              ? "relative z-30 isolate container-ev flex h-full min-h-[inherit] items-end justify-center"
              : "relative z-30 isolate container-ev grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center"
          }
          style={{
            paddingTop: minimalHero ? "calc(var(--nav-h, 80px) + 22px)" : "calc(var(--nav-h, 80px) + 32px)",
            paddingBottom: minimalHero ? "26px" : "42px",
            minHeight: "inherit",
          }}
        >
          <div className={minimalHero ? "flex w-full justify-center" : "max-w-[660px]"}>
            {!minimalHero && (
              <>
                <h1
                  className="font-black leading-[1.04] text-[clamp(2rem,3.6vw,3.15rem)] text-white"
                  style={{ fontFamily: "var(--font-display)", textShadow: "0 3px 22px rgba(0,0,0,0.48)" }}
                >
                  {title}
                </h1>

                <p
                  className="mt-3 max-w-[430px] text-base font-extrabold leading-snug text-white sm:text-lg"
                  style={{ textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}
                >
                  {subtitle}
                </p>
              </>
            )}

            <div className={minimalHero ? "flex flex-wrap items-center gap-3" : "mt-5 flex flex-wrap items-center gap-3"}>
              <a
                href={ctaHref}
                className={
                  minimalHero
                    ? "inline-flex items-center justify-center rounded-full bg-[#4ea43d] px-8 py-3 text-base font-black leading-none text-white shadow-[0_12px_28px_rgba(17,73,24,0.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#3d8a2e] sm:px-10 sm:py-4"
                    : "inline-flex items-center gap-2 rounded-lg bg-[#2e7d32] px-6 py-3 text-sm font-black text-white shadow-lg shadow-black/15 transition duration-200 hover:-translate-y-0.5 hover:bg-[#236327]"
                }
              >
                Découvrir nos produits
              </a>
              {!minimalHero && (
                <a
                  href={fichesTechniquesHref}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/75 px-6 py-3 text-sm font-black text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Guide d&apos;utilisation
                </a>
              )}
            </div>
          </div>

          {/* Carte flottante — reprend les points du mockup (voir avertissement en tête de fichier) */}
          {!minimalHero && <div className="hidden lg:flex lg:justify-end">
            <div className="w-full max-w-[245px] rounded-lg bg-white/90 p-5 shadow-2xl backdrop-blur-sm">
              {POINTS_FORTS.map(({ icon: Icon, label }, i) => (
                <div
                  key={label}
                  className={`flex items-center gap-4 py-3 ${i > 0 ? "border-t border-sand-200" : ""}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#2e7d32]">
                    <Icon size={30} strokeWidth={2.4} />
                  </span>
                  <p className="text-base font-black leading-snug text-[#082d12]">{label}</p>
                </div>
              ))}
            </div>
          </div>}
        </div>

      </div>

      {/* ── Bandeau croisé — Pollinisation & Protection ─────────────── */}
      {crossSellHref && (
        <div className="relative overflow-visible border-y border-[#efd98b] bg-[#fff8d8] py-4 sm:py-5 lg:py-6">
          <div
            aria-hidden
            className="absolute inset-0 opacity-55"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(226,176,33,0.42) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="container-ev relative z-10">
            <div className="grid items-center gap-5 md:grid-cols-[260px_1fr_340px] lg:grid-cols-[300px_1fr_420px]">
              <div className="relative z-20 min-h-[86px] sm:min-h-[96px] lg:min-h-[112px]">
                <img
                  src="/images/activites/pollinisation-removebg-preview.png"
                  alt=""
                  aria-hidden="true"
                  width={426}
                  height={400}
                  className="pointer-events-none absolute -top-[92px] left-2 z-30 h-[170px] w-auto object-contain drop-shadow-[0_16px_18px_rgba(20,30,10,0.24)] sm:-top-[108px] sm:h-[190px] md:left-8 lg:-top-[128px] lg:h-[220px]"
                />
              </div>
              <div>
                <p
                  className="text-2xl font-black leading-tight text-[#082d12] sm:text-[1.75rem]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Protégez et pollinisez vos cultures
                </p>
                <p className="mt-2 max-w-[640px] text-sm font-normal leading-snug text-[#1b2118]/80 sm:text-base">
                  Explorez nos solutions complètes pour la pollinisation et la protection biologique de vos plantes.
                </p>
              </div>
              <a
                href={crossSellHref}
                className="inline-flex min-h-[72px] items-center justify-center gap-5 rounded-lg bg-[#1f6b27] px-8 py-3 text-base font-black leading-tight text-white shadow-lg shadow-[#1f5c2b]/15 transition duration-200 hover:-translate-y-0.5 hover:bg-[#174621] sm:text-lg"
              >
                <ArrowRight size={34} strokeWidth={1.8} />
                <span>Voir la gamme Protection &amp; Pollinisation</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Types d'engrais — les catégories, juste sous le bandeau ──── */}
      {showTypeCards && typeCards.length > 0 && (
        <div className="bg-white border-b border-sand-200">
          <div className="container-ev py-10 lg:py-14">
            <p className="eyebrow mb-2">Gamme</p>
            <h2 className="site-heading text-[1.6rem] sm:text-[2rem] lg:text-[2.2rem]">
              <SectionTitleLine icon="Sprout" align="left">
                Nos types d&apos;engrais
              </SectionTitleLine>
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {typeCards.map((cat) => (
                <a
                  key={cat.id_categorie}
                  href={
                    activiteSlug && cat.slug
                      ? `${getActivityCategoryHrefById(activiteSlug, categories as any, cat.id_categorie)}#${categoryAnchor}`
                      : `#${categoryAnchor}`
                  }
                  className="group relative block aspect-[4/5] w-full overflow-hidden rounded-xl border border-sand-200"
                >
                  <Image
                    src={cat.image as string}
                    alt={cat.nom}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(6,18,9,0) 45%, rgba(6,18,9,0.65) 100%)",
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4">
                    <p
                      className="text-[15px] font-black leading-snug text-white"
                      style={{ textShadow: "0 1px 8px rgba(0,0,0,0.45)" }}
                    >
                      {cat.nom}
                    </p>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/90 text-ev-700 transition-transform duration-300 ease-out group-hover:rotate-45">
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}