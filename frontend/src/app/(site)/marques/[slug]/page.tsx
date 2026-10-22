import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { activitesService, categoriesService, marquesService, tutorialVideosService } from "@/services";
import { CategoryTree } from "@/components/catalogue/CategoryTree";
import { fetchMarqueTree } from "@/lib/api/catalogue";
import { PageHeroStatic } from "@/components/sections/PageHeroStatic";
import { FertilisantHeroShowcase } from "@/components/sections/FertilisantHeroShowcase";
import { PulvertHero } from "@/components/sections/PulvertHero";
import { PulvertFeatureSections } from "@/components/sections/PulvertFeatureSections";
import { ActiviteProduitsSectionWrapper } from "../../activites/[slug]/ActiviteProduitsSection";
import { FertilisationHeroShowcase } from "../../activites/[slug]/FertilisationHeroShowcase";
import { MarqueProduitsSectionWrapper } from "./MarqueProduitsSection";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { translatedField } from "@/i18n/translated-field";
import type { MarqueTree } from "@/types/catalogue";
interface PageProps {
  params: Promise<{ slug: string }>;
}

// La langue est lue dans un cookie (layout racine) : la page est rendue à chaque requête.
// Le cache des données reste actif via fetch(..., { next: { revalidate } }) dans services/.
export const dynamic = "force-dynamic";

function getMarqueHeroSettings(slug: string) {
  switch (slug) {
    case "matar":
      return {
        imagePosition: "center 34%",
        imagePositionTablet: "center 28%",
        imagePositionMobile: "center 22%",
      };
    case "fertivert":
      return {
        imagePosition: "center 39%",
        imagePositionTablet: "center 34%",
        imagePositionMobile: "center 27%",
      };
    case "pulvert":
      return {
        imagePosition: "center 36%",
        imagePositionTablet: "center 31%",
        imagePositionMobile: "center 25%",
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

function collectCategorieSubtree<T extends { id_categorie: number; parent_id: number | null }>(
  categories: T[],
  rootId: number,
) {
  const ids = new Set<number>([rootId]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const category of categories) {
      if (category.parent_id && ids.has(category.parent_id) && !ids.has(category.id_categorie)) {
        ids.add(category.id_categorie);
        changed = true;
      }
    }
  }

  return categories.filter((category) => ids.has(category.id_categorie));
}

function isBaddarGenericCategory(category: { nom?: string | null; slug?: string | null }) {
  const label = normalizeText(`${category.nom ?? ""} ${category.slug ?? ""}`);
  return label.includes("semences") && label.includes("plants");
}

function hideBaddarGenericCategory(tree: MarqueTree | null): MarqueTree | null {
  if (!tree || tree.slug !== "baddar-semences") return tree;

  const genericCategories = tree.categories.filter(isBaddarGenericCategory);
  if (genericCategories.length === 0) return tree;

  const visibleCategories = tree.categories.filter((category) => !isBaddarGenericCategory(category));
  if (visibleCategories.length === 0) {
    return { ...tree, categories: [] };
  }

  const genericProducts = genericCategories.flatMap((category) => category.produits ?? []);
  const [firstVisibleCategory, ...otherVisibleCategories] = visibleCategories;

  return {
    ...tree,
    categories: [
      {
        ...firstVisibleCategory,
        produits: [...(firstVisibleCategory.produits ?? []), ...genericProducts],
      },
      ...otherVisibleCategories,
    ],
  };
}

async function currentLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
  return isLocale(cookieLocale) ? cookieLocale : defaultLocale;
}

/* ── Static params ───────────────────────────────────────────────── */
export async function generateStaticParams() {
  try {
    const marques = await marquesService.list();
    return marques.map((m) => ({ slug: m.slug }));
  } catch { return []; }
}

/* ── Metadata ────────────────────────────────────────────────────── */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const marque = await marquesService.bySlug(slug);
    return {
      title:       marque.nom,
      description: marque.description ?? `Produits ${marque.nom}`,
    };
  } catch {
    return { title: "Marque introuvable" };
  }
}

/* ── Page ────────────────────────────────────────────────────────── */
export default async function MarqueDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await currentLocale();

  let marque;
  try {
    marque = await marquesService.bySlug(slug);
  } catch {
    notFound();
  }

  const isMatar = marque.slug === "matar";
  const isFertivert = marque.slug === "fertivert";
  const isPulvert = marque.slug === "pulvert";
  const heroSettings = getMarqueHeroSettings(marque.slug);
  const irrigation = isMatar
    ? (await activitesService.list()).find((activite) => activite.slug === "irrigation")
    : null;
  const irrigationCategories = irrigation
    ? await categoriesService.list({ id_activite: irrigation.id_activite })
    : [];
  const matarCategory = irrigationCategories.find((cat) => {
    const slugKey = normalizeText(cat.slug);
    const nameKey = normalizeText(cat.nom);
    return slugKey === "matar" || nameKey === "matar";
  }) ?? null;
  const useIrrigationMatarCatalogue = Boolean(isMatar && irrigation && matarCategory);
  const matarCategories = useIrrigationMatarCatalogue
    ? collectCategorieSubtree(irrigationCategories, matarCategory!.id_categorie)
    : [];

  // ── Marque rattachée à Jardinage & Machinisme : même catalogue (mêmes
  // cartes, même comportement de sidebar-au-clic) que sur la page de
  // l'activité, simplement filtré sur cette marque. ──────────────────────
  const machinismeActivite = (await activitesService.list()).find(
    (activite) => activite.slug === "jardinage-et-machinisme"
  );
  const machinismeCategories = machinismeActivite
    ? await categoriesService.list({ id_activite: machinismeActivite.id_activite })
    : [];
  const machinismeMarqueCategory = machinismeCategories.find(
    (cat) => normalizeText(cat.slug) === normalizeText(`jm-${marque.slug}`)
  ) ?? null;
  const useMachinismeCatalogue = Boolean(machinismeActivite && machinismeMarqueCategory);

  // ── Fertivert reprend toujours la présentation de Semences & plants. ──
  const fertilisationActivite = isFertivert
    ? (await activitesService.list()).find((activite) => activite.slug === "fertilisation")
    : undefined;
  const fertilisationCategories = fertilisationActivite
    ? await categoriesService.list({ id_activite: fertilisationActivite.id_activite })
    : [];
  const useFertilisationCatalogue = Boolean(fertilisationActivite);

  const tree = (useIrrigationMatarCatalogue || useMachinismeCatalogue || useFertilisationCatalogue) ? null : hideBaddarGenericCategory(await fetchMarqueTree(slug));
  const pulvertTutorialVideos = isPulvert ? await tutorialVideosService.list("pulvert").catch(() => []) : [];
  const quickCategories = useIrrigationMatarCatalogue
    ? matarCategories.filter((cat) => cat.parent_id === matarCategory!.id_categorie)
    : tree?.categories ?? [];
  const shownQuickCategories = quickCategories.length > 0
    ? quickCategories
    : useIrrigationMatarCatalogue
      ? [matarCategory!]
      : [];
  const marqueNom = translatedField(marque as any, "nom", locale) || marque.nom;
  const marqueDescription = translatedField(marque as any, "description", locale) || marque.description;

  return (
    <>
      {/* ── Hero — récupère le slide "marque:{slug}" depuis l'admin Hero ── */}
      {isFertivert && useFertilisationCatalogue ? (
        <FertilisationHeroShowcase activiteSlug="fertilisation" />
      ) : isFertivert ? (
        <FertilisantHeroShowcase
          title="Optimisez vos récoltes avec nos engrais naturels"
          subtitle="Des solutions de fertilisation durables pour une croissance exceptionnelle."
          heroSlideKey="marque:fertivert"
          fallbackImage="/images/hero/BANNEQR.webp"
          categories={tree?.categories ?? []}
          categoryAnchor="produits-marque"
          ctaHref="#produits-marque"
          fichesTechniquesHref="/contact"
          showTypeCards={false}
          crossSellHref={null}
          minimalHero
        />
      ) : isPulvert ? (
        <PulvertHero categories={tree?.categories ?? []} ctaHref="#categories-pulvert" />
      ) : (
        <PageHeroStatic
          page={`marque:${slug}`}
          eyebrow="Marque"
          title={marqueNom}
          subtitle={marqueDescription ?? undefined}
          fallbackImage="/images/hero/fertivert.webp"
          contentMaxWidth="44rem"
          {...heroSettings}
        />
      )}

      {/* CTA Matar RDV — affiché sous le hero si besoin */}
      {isMatar && (
        <div className="bg-sky-50 border-b border-sky-100 py-3">
          <div className="container-ev flex items-center justify-between gap-4">
            <p className="text-sm text-sky-800 font-medium">
              Solutions d&apos;irrigation Matar — Prenez rendez-vous avec un expert
            </p>
            <Link
              href="/rendez-vous"
              className="shrink-0 btn btn-sm bg-sky-500 text-white hover:bg-sky-600"
            >
              Prendre RDV
            </Link>
          </div>
        </div>
      )}

      {isPulvert && (
        <PulvertFeatureSections
          categories={tree?.categories ?? []}
          videos={pulvertTutorialVideos}
          showVideos={false}
          categoriesAnchorId="categories-pulvert"
        />
      )}

      {/* ── Categories quick nav ───────────────────────────────── */}
      {!isPulvert && !isFertivert && !useFertilisationCatalogue && shownQuickCategories.length > 0 && (
        <section className="bg-white border-b border-sand-200">
          <div className="container-ev py-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-xs text-gray-400 font-medium shrink-0">Catégories :</span>
              {shownQuickCategories.map((cat) => (
                <a
                  key={cat.id_categorie}
                  href={
                    useIrrigationMatarCatalogue
                      ? `?cat=${cat.id_categorie}#produits-activite`
                      : `#cat-${cat.id_categorie}`
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

      {/* ── Catalogue Matar — même source que l'activité Irrigation / catégorie Matar ── */}
      {useIrrigationMatarCatalogue && irrigation && matarCategory && (
        <ActiviteProduitsSectionWrapper
          id_activite={irrigation.id_activite}
          activiteSlug={irrigation.slug}
          categories={matarCategories}
          categoryScopeId={matarCategory.id_categorie}
        />
      )}

      {/* ── Catalogue Jardinage & Machinisme — même composant que la page
       * d'activité, filtré sur cette marque (mêmes cartes, même comportement
       * de sidebar affichée uniquement une fois la marque/sous-catégorie
       * sélectionnée). ── */}
      {useMachinismeCatalogue && machinismeActivite && machinismeMarqueCategory && (
        <ActiviteProduitsSectionWrapper
          id_activite={machinismeActivite.id_activite}
          activiteSlug={machinismeActivite.slug}
          categories={machinismeCategories}
          categoryScopeId={machinismeMarqueCategory.id_categorie}
          marques={[marque]}
        />
      )}

      {/* ── Catalogue Fertilisation — même composant que la page Semences & plants ── */}
      {useFertilisationCatalogue && fertilisationActivite && (
        <ActiviteProduitsSectionWrapper
          id_activite={fertilisationActivite.id_activite}
          activiteSlug={fertilisationActivite.slug}
          categories={fertilisationCategories}
        />
      )}

      {isPulvert && tree && (
        <MarqueProduitsSectionWrapper
          id_marque={marque.id_marque}
          categories={tree.categories ?? []}
          hideUntilCategorySelected
          cardVariant="seed"
        />
      )}

      {isPulvert && (
        <PulvertFeatureSections
          videos={pulvertTutorialVideos}
          showCategories={false}
        />
      )}

      {/* ── Arbre catégories / produits ────────────────────────── */}
      {tree && !isPulvert && !useFertilisationCatalogue && (
        <section id="produits-marque" className="bg-sand-50 border-b border-sand-200">
          <div className="container-ev py-8">
            <CategoryTree
              tree={tree}
              produitBasePath="/produits"
              showProduits={true}
              cardVariant={isFertivert ? "seed" : "default"}
              rootTabsOnly={isFertivert}
            />
          </div>
        </section>
      )}
    </>
  );
}
