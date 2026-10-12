import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { cookies } from "next/headers";
import { activitesService, categoriesService, marquesService } from "@/services";
import { ActiviteProduitsSectionWrapper } from "./ActiviteProduitsSection";
import { PageHeroStatic } from "@/components/sections/PageHeroStatic";
import { JardinageHeroShowcase } from "./JardinageHeroShowcase";
import { SemencesHeroShowcase } from "./SemencesHeroShowcase";
import { FertilisationHeroShowcase } from "./FertilisationHeroShowcase";
import { FertilisantHeroShowcase } from "@/components/sections/FertilisantHeroShowcase";
import { CategoryTree } from "@/components/catalogue/CategoryTree";
import { fetchMarqueTree } from "@/lib/api/catalogue";
import { PulverisationShowcase } from "./PulverisationShowcase";
import { PollinisationProtectionShowcase } from "./PollinisationProtectionShowcase";
import { SemencesRecommandation } from "./SemencesRecommandation";
import { getEtudeInstallationHref, isEtudeInstallationCategory } from "@/lib/etude-installation";
import { getActivityCategoryHrefById, findCategoryBySlugPath } from "@/lib/category-url";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { translatedField } from "@/i18n/translated-field";
import { cn } from "@/lib/utils";

interface PageProps {
  // `catPath` n'existe que sur la route imbriquée
  // /activites/[slug]/categorie/[[...catPath]] (qui ré-exporte cette même
  // page) — absent sur /activites/[slug].
  params: Promise<{ slug: string; catPath?: string[] }>;
  searchParams?: Promise<{ cat?: string | string[] }>;
}

export const revalidate = 300;

function getActiviteHeroSettings(slug: string) {
  switch (slug) {
    case "irrigation":
      return {
        imagePosition: "center 34%",
        imagePositionTablet: "center 28%",
        imagePositionMobile: "center 22%",
      };
    case "semences-et-plants":
      return {
        imagePosition: "center 36%",
        imagePositionTablet: "center 30%",
        imagePositionMobile: "center 24%",
      };
    case "fertilisation":
      return {
        imagePosition: "center 38%",
        imagePositionTablet: "center 34%",
        imagePositionMobile: "center 27%",
      };
    default:
      return {
        imagePosition: "center 35%",
        imagePositionTablet: "center 30%",
        imagePositionMobile: "center 24%",
      };
  }
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const HIDDEN_BRAND_KEYS = new Set([
  "mondialeirrigation",
  "mendialirrigation",
  "mondialirrigation",
  "panam",
  "panamsemences",
  "rivulis",
  "rivilus",
  "revulis",
  "revilis",
]);

function hiddenBrandKey(value: string | null | undefined) {
  return normalizeText(value).replace(/[^a-z0-9]/g, "");
}

function isHiddenBrandLike(value: string | null | undefined) {
  return HIDDEN_BRAND_KEYS.has(hiddenBrandKey(value));
}

async function currentLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
  return isLocale(cookieLocale) ? cookieLocale : defaultLocale;
}

/* ── Static params ───────────────────────────────────────────────── */
export async function generateStaticParams() {
  try {
    const acts = await activitesService.list();
    return acts.map((a) => ({ slug: a.slug }));
  } catch { return []; }
}

/* ── Metadata ────────────────────────────────────────────────────── */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (
    [
      "pollinisation-et-protection-des-plantes",
      "pollinisation-protection-des-plantes",
      "polinisation-protection-des-plantes",
      "polinisation-et-protection-des-plantes",
    ].includes(slug)
  ) {
    return {
      title: "Pollinisation & Protection des Plantes",
      description:
        "Pollinisation, protection biologique et suivi terrain pour accompagner vos cultures avec précision.",
    };
  }

  try {
    const acts = await activitesService.list();
    const act  = acts.find((a) => a.slug === slug);
    return act
      ? { title: act.nom, description: act.description ?? `Produits ${act.nom}` }
      : { title: "Activité introuvable" };
  } catch {
    return { title: "Activité introuvable" };
  }
}

/* ── Page ────────────────────────────────────────────────────────── */
export default async function ActiviteDetailPage({ params, searchParams }: PageProps) {
  const { slug, catPath = [] } = await params;

  // ── Page 100% statique — Pollinisation & Protection des Plantes ────
  // Le catalogue (catégories/produits) n'est pas encore prêt en base.
  // On court-circuite ici, avant tout appel backend, pour que cette page
  // s'affiche toujours, quel que soit l'état de la base de données.
  // On tolère les deux orthographes vues en pratique sur ce projet
  // (avec/sans "et", un ou deux "l") pour éviter tout nouveau mismatch.
  // À retirer quand les vraies données seront en place.
  const POLLINISATION_SLUGS = new Set([
    "pollinisation-et-protection-des-plantes",
    "pollinisation-protection-des-plantes",
    "polinisation-protection-des-plantes",
    "polinisation-et-protection-des-plantes",
  ]);
  if (POLLINISATION_SLUGS.has(slug)) {
    return (
      <PollinisationProtectionShowcase
        title="Pollinisation & Protection des Plantes"
        subtitle="Pollinisation, protection biologique et suivi terrain pour accompagner vos cultures avec précision, de la fleur à la récolte."
      />
    );
  }

  const locale = await currentLocale();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const categoryParam = resolvedSearchParams.cat;
  const hasCategoryFilter = Array.isArray(categoryParam)
    ? categoryParam.length > 0
    : Boolean(categoryParam);

  const acts = await activitesService.list();
  const act  = acts.find((a) => a.slug === slug);
  if (!act) notFound();

  const activite = act!;

  /* Fetch categories for this activite (includes hierarchy / parent_id) */
  const categories = await categoriesService.list({ id_activite: activite.id_activite });
  const isMachinismeSlug = slug === "jardinage-et-machinisme";
  const marques = (slug === "irrigation" || isMachinismeSlug)
    ? (await marquesService.list()).filter(
        (marque) => !isHiddenBrandLike(marque.slug) && !isHiddenBrandLike(marque.nom),
      )
    : [];
  const marqueById = new Map(marques.map((marque) => [marque.id_marque, marque]));
  const marqueByKey = new Map(
    marques.flatMap((marque) => [
      [normalizeText(marque.slug), marque] as const,
      [normalizeText(marque.nom), marque] as const,
    ])
  );
  const findLinkedMarque = (cat: (typeof categories)[number]) => {
    if (cat.id_marque) {
      const marque = marqueById.get(cat.id_marque);
      if (marque) return marque;
    }

    const key = normalizeText(`${cat.nom} ${cat.slug}`);
    if (key.includes("matar")) return marqueByKey.get("matar") ?? null;
    if (key.includes("idroland")) return marqueByKey.get("idroland") ?? null;

    return null;
  };
  const equipementsCategory = slug === "irrigation"
    ? categories.find((cat) => {
        const key = normalizeText(`${cat.nom} ${cat.slug}`);
        return !cat.parent_id && (key.includes("equipement") || key.includes("materiel"));
      }) ?? null
    : null;
  const irrigationBrandCards = equipementsCategory
    ? categories
        .filter((cat) => cat.parent_id === equipementsCategory.id_categorie)
        .map((cat) => {
          const marque = findLinkedMarque(cat);
          return {
            id_categorie: cat.id_categorie,
            nom: marque?.nom ?? cat.nom,
            image: marque?.logo ?? cat.image ?? null,
            href: marque
              ? `/marques/${marque.slug}`
              : `${getActivityCategoryHrefById(slug, categories, cat.id_categorie)}#produits-activite`,
          };
        })
    : [];
  const selectedCategoryId = Array.isArray(categoryParam)
    ? parseInt(categoryParam[0] ?? "", 10)
    : parseInt(categoryParam ?? "", 10);

  if (
    hasCategoryFilter &&
    slug === "irrigation" &&
    Number.isFinite(selectedCategoryId)
  ) {
    const selectedCategory = categories.find((cat) => cat.id_categorie === selectedCategoryId);
    if (selectedCategory && isEtudeInstallationCategory(selectedCategory)) {
      redirect(getEtudeInstallationHref(slug));
    }
  }

  /* Root-level categories for quick-nav pills */
  const rootCategories = categories.filter((c) => !c.parent_id);

  /* Règles spéciales */
  const isIrrigation = activite.slug === "irrigation";
  const isSemences = activite.slug === "semences-et-plants";
  const isMachinisme = activite.slug === "jardinage-et-machinisme";
  const isFertilisation = activite.slug === "fertilisation";
  const isPulverisation = activite.slug === "pulverisation";
  const isPollinisationProtection = activite.slug === "pollinisation-et-protection-des-plantes";
  const heroSettings = getActiviteHeroSettings(activite.slug);
  const activiteNom = translatedField(activite as any, "nom", locale) || activite.nom;
  const activiteDescription = translatedField(activite as any, "description", locale) || activite.description;

  // ── Fertilisation ────────────────────────────────────────────────
  // Cette page doit avoir exactement le même affichage que la page
  // marque Fertivert (/marques/fertivert) : même hero, même catalogue
  // (onglets Pro/Garden), tout en restant sous l'URL /activites/fertilisation/...
  // On réutilise donc l'arbre catégories/produits de la marque Fertivert.
  // Si l'appel échoue (marque absente en base, etc.), on retombe sur
  // l'ancien affichage (FertilisationHeroShowcase + ActiviteProduitsSection)
  // pour ne jamais casser la page.
  const fertivertTree = isFertilisation ? await fetchMarqueTree("fertivert") : null;
  const fertivertInitialCategoryId =
    fertivertTree && catPath.length > 0
      ? findCategoryBySlugPath(fertivertTree.categories, catPath)?.id_categorie ?? null
      : null;

  return (
    <div className={cn(isMachinisme && "theme-machinisme")}>
      {/* ── Hero ── */}
      {isMachinisme ? (
        <JardinageHeroShowcase activiteSlug={activite.slug} categories={rootCategories} />
      ) : isSemences ? (
        <SemencesHeroShowcase activiteSlug={activite.slug} />
      ) : isFertilisation && fertivertTree ? (
        <FertilisantHeroShowcase
          title="Optimisez vos récoltes avec nos engrais naturels"
          subtitle="Des solutions de fertilisation durables pour une croissance exceptionnelle."
          heroSlideKey="marque:fertivert"
          fallbackImage="/images/hero/BANNEQR.webp"
          categories={fertivertTree.categories}
          categoryAnchor="produits-activite"
          ctaHref="#produits-activite"
          fichesTechniquesHref="/rendez-vous"
          showTypeCards={false}
          crossSellHref={null}
          minimalHero
        />
      ) : isFertilisation ? (
        <FertilisationHeroShowcase activiteSlug={activite.slug} categories={rootCategories} />
      ) : isPulverisation ? (
        <PulverisationShowcase categories={categories} activiteSlug={activite.slug} />
      ) : isPollinisationProtection ? (
        <PollinisationProtectionShowcase
          title={activiteNom}
          subtitle={activiteDescription}
          categories={rootCategories}
        />
      ) : (
        <PageHeroStatic
          page={`activite:${activite.slug}`}
          eyebrow="Activité"
          title={activiteNom}
          subtitle={activiteDescription ?? undefined}
          fallbackImage={(activite as any).banniere || activite.image || "/images/hero/fertivert.webp"}
          contentMaxWidth="44rem"
          {...heroSettings}
        />
      )}

      {/* Le "Parcourir par catégorie" pour Semences est géré par
          SemencesCategoryTiles, plus bas, dans ActiviteProduitsSection —
          on ne le duplique pas ici. */}

      {/* CTA Irrigation / Matar */}
      {isIrrigation && (
        <div className="bg-sky-50 border-b border-sky-100 py-3">
          <div className="container-ev flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CalendarDays size={18} className="text-sky-600 shrink-0" />
              <p className="text-sm text-sky-800 font-medium">
                Solutions d&apos;irrigation Matar — Prenez rendez-vous avec un expert pour un audit personnalisé.
              </p>
            </div>
            <Link href="/rendez-vous" className="shrink-0 btn btn-sm bg-sky-500 text-white hover:bg-sky-400">
              Prendre RDV
            </Link>
          </div>
        </div>
      )}

      {/* ── Categories quick nav ─────────────────────────────────── */}
      {!isMachinisme && !isSemences && !isFertilisation && !isPulverisation && !isPollinisationProtection && (rootCategories.length > 0 || isIrrigation) && (
        <section className="bg-white border-b border-sand-200">
          <div className="container-ev py-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-xs text-gray-400 font-medium shrink-0">Catégories :</span>
              {rootCategories.map((cat) => (
                <a
                  key={cat.id_categorie}
                  href={
                    slug === "irrigation" && isEtudeInstallationCategory(cat)
                      ? getEtudeInstallationHref(slug)
                      : `${getActivityCategoryHrefById(slug, categories, cat.id_categorie)}#produits-activite`
                  }
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-ev-50 text-ev-700 border border-ev-100 whitespace-nowrap"
                >
                  {translatedField(cat as any, "nom", locale) || cat.nom}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Widget recommandation IA (Semences) — masqué pour le moment ── */}
      {false && isSemences && (
        <section className="bg-white border-b border-sand-200">
          <div className="container-ev py-3.5 flex justify-center">
            <SemencesRecommandation />
          </div>
        </section>
      )}

      {/* ── Products section (client component) ─────────────────── */}
      {isFertilisation && fertivertTree ? (
        <section id="produits-activite" className="bg-sand-50 border-b border-sand-200">
          <div className="container-ev py-8">
            <CategoryTree
              tree={fertivertTree}
              produitBasePath="/produits"
              showProduits
              cardVariant="seed"
              rootTabsOnly
              initialCategoryId={fertivertInitialCategoryId}
            />
          </div>
        </section>
      ) : !isPulverisation && (
        <ActiviteProduitsSectionWrapper
          id_activite={activite.id_activite}
          activiteSlug={activite.slug}
          categories={categories}
          brandCards={irrigationBrandCards}
          marques={marques}
        />
      )}
    </div>
  );
}