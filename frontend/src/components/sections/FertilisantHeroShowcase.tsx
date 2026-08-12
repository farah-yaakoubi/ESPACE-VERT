"use client";

/**
 * FertilisantHeroShowcase — hero partagé par :
 *  - la page activité Fertilisation (/activites/fertilisation)
 *  - la page marque Fertivert (/marques/fertivert)
 * Reproduit fidèlement le mockup de référence : photo plein cadre + carte
 * flottante + bandeau croisé "Pollinisation & Protection" + grille de
 * catégories. Même structure, mêmes CTA — seuls le titre/sous-titre et la
 * source de données (hero-slide, catégories, ancre) diffèrent selon la
 * page appelante.
 *
 * ⚠️ Les points de la carte flottante ("100% Naturel", "Rendement +30%",
 * "Certifié Bio") sont repris tels quels du mockup — ce sont des
 * allégations factuelles (rendement chiffré, certification bio) à
 * confirmer/adapter si elles ne sont pas vraies pour vos produits.
 */
import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, ChevronRight, Droplet, Leaf, ShieldCheck } from "lucide-react";
import { SectionTitleLine } from "@/components/ui/SectionTitleIcon";

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
  image?: string | null;
}

interface FertilisantHeroShowcaseProps {
  /** Titre — seule chose qui change vraiment entre les deux pages. */
  title: string;
  subtitle?: string;
  /** Clé du hero-slide côté admin, ex. "activite:fertilisation" ou "marque:fertivert". */
  heroSlideKey: string;
  fallbackImage?: string;
  ctaHref?: string;
  fichesTechniquesHref?: string;
  categories?: FertilisantCategory[];
  /** Ancre utilisée pour les liens `?cat=<id>#<ancre>` de la grille de catégories. */
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

export function FertilisantHeroShowcase({
  title,
  subtitle = "Des solutions de fertilisation durables pour une croissance exceptionnelle.",
  heroSlideKey,
  fallbackImage = FALLBACK_IMAGE,
  ctaHref = "#produits-activite",
  fichesTechniquesHref = "/rendez-vous",
  categories = [],
  categoryAnchor = "produits-activite",
  crossSellHref = "/activites/pollinisation-et-protection-des-plantes",
  showTypeCards = true,
  minimalHero = false,
}: FertilisantHeroShowcaseProps) {
  const [image, setImage] = useState<string>(fallbackImage);
  const [focal, setFocal] = useState(DEFAULT_FOCAL);
  const breakpoint = useBreakpoint();

  useEffect(() => {
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
                  href={`?cat=${cat.id_categorie}#${categoryAnchor}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-sand-200 bg-sand-50/60 transition-colors hover:border-ev-300"
                >
                  <div className="relative h-32 w-full bg-white">
                    <Image
                      src={cat.image as string}
                      alt={cat.nom}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-sand-200 px-4 py-3">
                    <p className="text-[13px] font-bold leading-snug text-[#1b2118]">
                      {cat.nom}
                    </p>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ev-700 text-white transition-transform duration-300 ease-out group-hover:rotate-45">
                      <ChevronRight size={12} />
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