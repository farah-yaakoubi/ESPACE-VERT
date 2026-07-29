import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bug,
  CheckCircle2,
  Flower2,
  Leaf,
  Microscope,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import type { Categorie } from "@/types/api";

interface PollinisationProtectionShowcaseProps {
  title: string;
  subtitle?: string | null;
  /** Conservé pour compatibilité avec page.tsx ; non utilisé pour le moment,
   * le catalogue ci-dessous est hardcodé en attendant les vraies données. */
  categories?: Categorie[];
}

const HERO_IMAGE = "/images/activites/pollinisation.webp";
const BEE_IMAGE = "/images/activites/pollinisation-removebg-preview.png";

interface CatalogueBrand {
  nom: string;
  href: string;
  logo: string;
  tone: string;
}

interface CatalogueSection {
  title: string;
  description: string;
  Icon: LucideIcon;
  items: string[];
  href: string;
  brand?: CatalogueBrand;
}

const FERTIVERT: CatalogueBrand = {
  nom: "Fertivert",
  href: "/marques/fertivert",
  logo: "/logos/LOGO FERTVERT copy.png",
  tone: "#4f8f5e",
};

const PULVERT: CatalogueBrand = {
  nom: "Pulvert",
  href: "/marques/pulvert",
  logo: "/logos/PULVERT LOGO1.png",
  tone: "#7c9a76",
};

const journeySteps = [
  "Identifier le besoin sur la culture",
  "Choisir la méthode adaptée",
  "Suivre l'efficacité dans le temps",
];

const trustPoints = [
  "Approche biocontrôle, respectueuse des auxiliaires",
  "Conseil terrain personnalisé par culture",
  "Solutions compatibles avec vos itinéraires techniques",
];

/**
 * Catalogue hardcodé, en attendant que les vraies catégories/produits soient
 * en base. Structure inspirée de Koppert (koppert.fr) : six familles, avec
 * un lien logique vers Fertivert (nutrition) et Pulvert (application) quand
 * ça a du sens plutôt qu'un renvoi générique vers le catalogue.
 */
const catalogueSections: CatalogueSection[] = [
  {
    title: "Pollinisation",
    description: "Favoriser la fructification et la régularité des cultures.",
    Icon: Flower2,
    items: ["Bourdons pollinisateurs", "Ruches et accessoires"],
    href: "#produits-activite",
  },
  {
    title: "Protection biologique",
    description: "Auxiliaires et solutions naturelles contre les ravageurs.",
    Icon: ShieldCheck,
    items: ["Acariens prédateurs", "Insectes prédateurs", "Parasitoïdes", "Nématodes entomopathogènes"],
    href: "#produits-activite",
  },
  {
    title: "Lutte contre les maladies",
    description: "Prévenir et limiter la pression sanitaire sur vos cultures.",
    Icon: Microscope,
    items: ["Micro-organismes bénéfiques", "Fongicides biologiques"],
    href: "#produits-activite",
  },
  {
    title: "Santé des plantes",
    description: "Renforcer la vigueur et la résistance naturelle des végétaux.",
    Icon: Sprout,
    items: ["Biostimulants", "Nutrition de la plante"],
    href: FERTIVERT.href,
    brand: FERTIVERT,
  },
  {
    title: "Piégeage de détection",
    description: "Identifier tôt la présence de ravageurs pour agir au bon moment.",
    Icon: Radar,
    items: ["Pièges à phéromones", "Plaques engluées"],
    href: "#produits-activite",
  },
  {
    title: "Application",
    description: "Le bon matériel pour une mise en place précise sur le terrain.",
    Icon: SprayCan,
    items: ["Diffuseurs et distributeurs", "Matériel de pulvérisation"],
    href: PULVERT.href,
    brand: PULVERT,
  },
];

const bridgeCards = [
  {
    title: "Renforcer la plante avec Fertivert",
    description: "Associer nutrition et vigueur végétale pour mieux préparer vos cultures.",
    href: FERTIVERT.href,
    image: FERTIVERT.logo,
    tone: FERTIVERT.tone,
  },
  {
    title: "Compléter avec Pulvert",
    description: "Retrouver les équipements et solutions de pulvérisation pour des applications précises.",
    href: PULVERT.href,
    image: PULVERT.logo,
    tone: PULVERT.tone,
  },
];

export function PollinisationProtectionShowcase({
  title,
  subtitle,
}: PollinisationProtectionShowcaseProps) {
  return (
    <main className="bg-[#fbf5e9] text-[#2f4a37]">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[600px] overflow-hidden pt-[calc(var(--nav-h,72px)+26px)] lg:min-h-[700px]">
        <Image src={HERO_IMAGE} alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3f6b4a]/78 via-[#6a9c78]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fbf5e9] via-transparent to-[#2f4a37]/15" />

        <div className="container-ev relative z-10 grid min-h-[inherit] items-end gap-8 pb-14 lg:grid-cols-[1fr_420px] lg:pb-20">
          <div className="max-w-[680px] pb-2">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/40 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#2f4a37] ring-1 ring-white/50 backdrop-blur">
              <Leaf size={15} />
              Solutions naturelles pour producteurs
            </p>
            <h1
              className="text-balance text-[clamp(2.35rem,5vw,4.6rem)] font-black leading-[0.98] text-white"
              style={{ fontFamily: "var(--font-display)", textShadow: "0 4px 22px rgba(47,74,55,0.35)" }}
            >
              {title}
            </h1>
            <p className="mt-5 max-w-[560px] text-base font-bold leading-8 text-white/92 sm:text-lg">
              {subtitle ||
                "Pollinisation, protection biologique et suivi terrain pour accompagner vos cultures avec précision, de la fleur à la récolte."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="#produits-activite"
                className="inline-flex items-center gap-2 rounded bg-[#c3e6cc] px-6 py-3 text-sm font-black text-[#2f4a37] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#b0dcbb]"
              >
                Trouver une solution
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded border border-white/80 px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                Contacter un expert
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-2 text-[13px] font-bold text-white/92">
                  <CheckCircle2 size={15} className="shrink-0 text-[#cdeab8]" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative hidden min-h-[380px] lg:block">
            <div className="absolute bottom-0 right-0 w-[400px] border border-white/50 bg-white/95 p-6 shadow-2xl backdrop-blur">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#6a9c78]">
                Recherche de solutions
              </p>
              <h2 className="mt-3 text-2xl font-black leading-tight text-[#2f4a37]">
                De la fleur à la récolte, chaque intervention compte.
              </h2>

              <div className="mt-5 flex items-center gap-2 rounded border border-[#e3e6d3] bg-white px-4 py-3">
                <Search size={17} className="shrink-0 text-[#6a9c78]" />
                <span className="truncate text-[13px] font-semibold text-gray-400">
                  Rechercher par culture, ravageur ou solution…
                </span>
              </div>

              <div className="mt-6 grid gap-3">
                {journeySteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 border-t border-[#e3e6d3] pt-3 first:border-t-0 first:pt-0"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c3e6cc] text-xs font-black text-[#2f4a37]">
                      {index + 1}
                    </span>
                    <span className="text-sm font-black text-[#3a5643]">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <Image
              src={BEE_IMAGE}
              alt=""
              width={426}
              height={400}
              className="absolute -right-6 top-2 h-[210px] w-auto object-contain drop-shadow-[0_20px_20px_rgba(47,74,55,0.18)]"
            />
          </div>
        </div>
      </section>

      {/* ── Catalogue hardcodé (6 familles, façon Koppert) ─────────────────── */}
      <section className="relative bg-[#cfe8d5] py-12 lg:py-16">
        <div className="container-ev">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#4f7d5c]">
                <Sparkles size={14} />
                Nos expertises
              </p>
              <h2 className="site-heading text-[1.9rem] text-[#2f4a37] lg:text-[2.5rem]">
                Un programme complet autour de la plante
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalogueSections.map(({ title: cardTitle, description, Icon, items, href, brand }) => (
              <Link
                key={cardTitle}
                href={href}
                className="group flex min-h-[210px] flex-col justify-between bg-white/55 p-5 ring-1 ring-white/70 transition hover:-translate-y-1 hover:bg-white/90"
              >
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded bg-white text-[#5a8f68]">
                    <Icon size={24} strokeWidth={1.9} />
                  </span>
                  <span className="mt-4 block text-lg font-black text-[#2f4a37]">{cardTitle}</span>
                  <span className="mt-2 block text-sm font-semibold leading-6 text-[#3f5a48]/85">
                    {description}
                  </span>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="rounded-full bg-[#2f4a37]/8 px-2.5 py-1 text-[11px] font-bold text-[#2f4a37]/75"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {brand ? (
                  <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-black text-[#4f7d5c]">
                    Solutions {brand.nom}
                    <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                  </span>
                ) : (
                  <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-black text-[#2f4a37]/65">
                    Voir les produits
                    <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bandeau ravageurs / maladies ─────────────────────────────────── */}
      <section className="relative border-y border-[#f0e0a8] bg-[#fef3d0] py-8">
        <div
          aria-hidden
          className="absolute inset-0 opacity-45"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(230,196,110,0.4) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="container-ev relative grid gap-5 md:grid-cols-3">
          <Link
            href="#produits-activite"
            className="group flex min-h-[120px] items-start gap-4 bg-white/65 p-5 shadow-sm ring-1 ring-[#f0e0a8] transition hover:-translate-y-1 hover:bg-white"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-[#b7dfc0] text-[#2f4a37]">
              <Bug size={26} strokeWidth={1.9} />
            </span>
            <span>
              <span className="block text-lg font-black text-[#2f4a37]">Ravageurs des cultures</span>
              <span className="mt-2 block text-sm font-semibold leading-6 text-[#5a7060]">
                Identifier le ravageur et la bonne réponse biologique.
              </span>
            </span>
          </Link>
          <Link
            href="#produits-activite"
            className="group flex min-h-[120px] items-start gap-4 bg-white/65 p-5 shadow-sm ring-1 ring-[#f0e0a8] transition hover:-translate-y-1 hover:bg-white"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-[#b7dfc0] text-[#2f4a37]">
              <Microscope size={26} strokeWidth={1.9} />
            </span>
            <span>
              <span className="block text-lg font-black text-[#2f4a37]">Maladies des plantes</span>
              <span className="mt-2 block text-sm font-semibold leading-6 text-[#5a7060]">
                Repérer les symptômes et limiter la pression sanitaire.
              </span>
            </span>
          </Link>
          <Link
            href="/contact"
            className="group flex min-h-[120px] items-start gap-4 bg-white/65 p-5 shadow-sm ring-1 ring-[#f0e0a8] transition hover:-translate-y-1 hover:bg-white"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-[#b7dfc0] text-[#2f4a37]">
              <Search size={26} strokeWidth={1.9} />
            </span>
            <span>
              <span className="block text-lg font-black text-[#2f4a37]">Un doute sur le terrain ?</span>
              <span className="mt-2 block text-sm font-semibold leading-6 text-[#5a7060]">
                Un expert vous aide à qualifier le problème rapidement.
              </span>
            </span>
          </Link>
        </div>
      </section>

      {/* ── Parcours conseillé (marques complémentaires) ───────────────────── */}
      <section className="bg-white py-10 lg:py-12">
        <div className="container-ev grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow mb-3">Aller plus loin</p>
            <h2 className="site-heading text-[2rem] lg:text-[2.65rem]">
              La pollinisation ne fonctionne pas seule
            </h2>
            <p className="mt-4 max-w-[560px] text-[15px] font-semibold leading-8 text-gray-600">
              Elle donne de meilleurs résultats reliée à la nutrition de la plante (Fertivert) et au
              matériel d'application (Pulvert). Deux marques complémentaires pour compléter votre
              itinéraire technique.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {bridgeCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group relative min-h-[210px] overflow-hidden bg-[#fdf6e8] p-6 ring-1 ring-sand-200 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-20 w-44">
                  <Image src={card.image} alt={card.title} fill className="object-contain object-left" sizes="180px" />
                </div>
                <h3 className="mt-5 text-xl font-black leading-tight text-[#2f4a37]">{card.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-gray-600">{card.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black" style={{ color: card.tone }}>
                  Découvrir
                  <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────────────── */}
      <section className="bg-[#b8dcc0] py-9 text-[#2f4a37]">
        <div className="container-ev flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#4f7d5c]">
              <Sparkles size={15} />
              Besoin d'aide ?
            </p>
            <h2 className="mt-2 text-2xl font-black leading-tight">
              Trouver la bonne solution pour votre culture
            </h2>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-3 rounded bg-white px-7 py-3 text-sm font-black text-[#2f4a37] transition hover:-translate-y-0.5 hover:bg-[#fef3d0]"
          >
            Demander un conseil
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}