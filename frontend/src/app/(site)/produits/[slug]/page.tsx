import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  ChevronRight, Tag, Layers, Activity, Package, Home,
  Truck, Microscope, Handshake, Sun, Calendar, Shield, Ruler,
  TrendingUp, Sprout, Download, FileText,
} from "lucide-react";
import Image from "next/image";
import { produitsService } from "@/services";
import { ProduitGallery } from "./ProduitGallery";
import { ProduitFicheSection } from "./ProduitFicheSection";
import { ProduitTechTable } from "./ProduitTechTable";
import { ProduitsSimilaires } from "@/components/ProduitsSimilaires";
import { ProduitTabs, PrintFicheTechniqueButton } from "./ProduitTabs";
import { SeedCalculatorWidget } from "@/components/widgets";
import { detectPlant } from "@/lib/plant-detection";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { translatedField } from "@/i18n/translated-field";


export const revalidate = 0;

export async function generateStaticParams() {
  try {
    const res = await produitsService.list({ limit: 200 });
    return res.data.map((p) => ({ slug: p.slug }));
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await produitsService.bySlug(slug);
    const brandName = p.marque?.nom ?? "Espace Vert";
    return {
      title: `${p.nom} — ${brandName}`,
      description: p.description ?? `Découvrez ${p.nom}${p.marque ? ` de la gamme ${p.marque.nom}` : ""}.`,
      openGraph: { images: p.images[0] ? [p.images[0].url] : [] },
    };
  } catch { return { title: "Produit introuvable" }; }
}

const DIV = {
  pro:      { label: "Gamme Pro",    bg: "bg-blue-50",   text: "text-blue-700",  border: "border-blue-200",  dot: "bg-blue-500"  },
  garden:   { label: "Gamme Garden", bg: "bg-green-50",  text: "text-green-700", border: "border-green-200", dot: "bg-green-500" },
  standard: { label: "Standard",     bg: "bg-gray-50",   text: "text-gray-600",  border: "border-gray-200",  dot: "bg-gray-400"  },
};

/* ── Composant calendrier style catalogue ──────────────────────── */
const MOIS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

function CatalogueCalendrier({ semis, recolte }: { semis?: string | null; recolte?: string | null }) {
  const s = (semis  || "000000000000").padEnd(12,"0");
  const r = (recolte|| "000000000000").padEnd(12,"0");
  if (s === "000000000000" && r === "000000000000") return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-[10px]" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th className="text-left pr-2 py-1 font-semibold text-gray-500 whitespace-nowrap w-24" style={{ fontSize: 10 }}>Calendrier</th>
            {MOIS.map(m => (
              <th key={m} className="text-center font-bold text-gray-500 px-0.5 py-1" style={{ fontSize: 9, minWidth: 26 }}>{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {s !== "000000000000" && (
            <tr>
              <td className="text-left pr-2 py-1 font-bold whitespace-nowrap" style={{ color: "#16a34a", fontSize: 10 }}>
                Semis / Repiquage
              </td>
              {s.split("").map((v, i) => (
                <td key={i} className="text-center px-0.5 py-0.5">
                  <div className="mx-auto rounded-sm" style={{
                    width: 22, height: 16,
                    background: v === "1" ? "#16a34a" : "#f3f4f6",
                    border: `1px solid ${v === "1" ? "#15803d" : "#e5e7eb"}`,
                  }}/>
                </td>
              ))}
            </tr>
          )}
          {r !== "000000000000" && (
            <tr>
              <td className="text-left pr-2 py-1 font-bold whitespace-nowrap" style={{ color: "#dc2626", fontSize: 10 }}>
                Récolte
              </td>
              {r.split("").map((v, i) => (
                <td key={i} className="text-center px-0.5 py-0.5">
                  <div className="mx-auto rounded-sm" style={{
                    width: 22, height: 16,
                    background: v === "1" ? "#dc2626" : "#f3f4f6",
                    border: `1px solid ${v === "1" ? "#b91c1c" : "#e5e7eb"}`,
                  }}/>
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ── Carte catalogue semences ───────────────────────────────────── */
interface SemencesCardProps {
  saison?: string | null;
  obtenteur?: string | null;
  type_semence?: string | null;
  productivite?: string | null;
  longueur_fruit?: string | null;
  resistance?: string | null;
  descriptif_var?: string | null;
  obtenteur_logo?: string | null;
  calendrier_semis?: string | null;
  calendrier_recolte?: string | null;
  marqueNom?: string | null;
  marqueLogo?: string | null;
  marqueSlug?: string | null;
}

function SemencesCard({
  saison, obtenteur, type_semence, productivite, longueur_fruit,
  resistance, descriptif_var, obtenteur_logo, calendrier_semis, calendrier_recolte,
  marqueNom, marqueLogo,
}: SemencesCardProps) {
  const hasCalendrier =
    (calendrier_semis && calendrier_semis !== "000000000000") ||
    (calendrier_recolte && calendrier_recolte !== "000000000000");
  const hasMeta = saison || obtenteur || type_semence || productivite || longueur_fruit || resistance || descriptif_var;
  if (!hasMeta && !hasCalendrier) return null;

  return (
    <div className="rounded-2xl overflow-hidden border"
      style={{ borderColor: "#86efac", boxShadow: "0 2px 16px rgba(22,163,74,0.10)" }}>

      {/* Header vert catalogue */}
      <div className="px-4 py-2.5 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg,#15803d,#16a34a)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}>
            <Sprout size={17} color="#fff" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.65)" }}>
              Semences
            </p>
            <p className="text-sm font-bold text-white leading-tight">Fiche variétale</p>
          </div>
        </div>
        {/* Logo obtenteur — priorité : obtenteur_logo > marqueLogo > texte obtenteur */}
        {(obtenteur_logo || marqueLogo || obtenteur) && (
          <div className="flex items-center gap-2">
            {(obtenteur_logo || marqueLogo) ? (
              <div className="rounded-xl overflow-hidden bg-white/95 flex items-center justify-center px-3 py-2"
                style={{ maxWidth: 160 }}>
                <img
                  src={obtenteur_logo || marqueLogo || ""}
                  alt={obtenteur || marqueNom || ""}
                  style={{
                    maxWidth:  140,
                    maxHeight: 52,
                    width:     "auto",
                    height:    "auto",
                    display:   "block",
                  }}
                />
              </div>
            ) : obtenteur ? (
              <span className="px-3 py-1.5 rounded-lg text-xs font-black text-green-900 tracking-wide"
                style={{ background: "rgba(255,255,255,0.92)", letterSpacing: "0.04em" }}>
                {obtenteur}
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Meta grid */}
      {hasMeta && (
        <div className="p-3 space-y-2 bg-white">
          {(saison || obtenteur || type_semence) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {saison && (
                <div className="flex items-center gap-2 rounded-xl p-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <Calendar size={13} className="text-green-600 shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Saison</p>
                    <p className="text-xs font-bold text-green-800 mt-0.5">{saison}</p>
                  </div>
                </div>
              )}
              {obtenteur && (
                <div className="flex items-center gap-2 rounded-xl p-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <Tag size={13} className="text-green-600 shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Obtenteur</p>
                    <p className="text-xs font-bold text-green-800 mt-0.5">{obtenteur}</p>
                  </div>
                </div>
              )}
              {type_semence && (
                <div className="flex items-center gap-2 rounded-xl p-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <Layers size={13} className="text-green-600 shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Type</p>
                    <p className="text-xs font-bold text-green-800 mt-0.5">{type_semence}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {(productivite || longueur_fruit) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {productivite && (
                <div className="flex items-center gap-2.5 rounded-xl p-3"
                  style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1px solid #86efac" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "#16a34a" }}>
                    <TrendingUp size={14} color="#fff" />
                  </div>
                  <p className="text-xs font-bold text-green-900">{productivite}</p>
                </div>
              )}
              {longueur_fruit && (
                <div className="flex items-center gap-2.5 rounded-xl p-3"
                  style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1px solid #86efac" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "#16a34a" }}>
                    <Ruler size={14} color="#fff" />
                  </div>
                  <p className="text-xs font-bold text-green-900">{longueur_fruit}</p>
                </div>
              )}
            </div>
          )}

          {descriptif_var && (
            <div className="rounded-xl p-3" style={{ background: "#f8fdf9", border: "1px solid #bbf7d0" }}>
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Descriptif</p>
              <p className="text-xs text-gray-700 leading-relaxed">{descriptif_var}</p>
            </div>
          )}

          {resistance && (
            <div className="flex items-start gap-2.5 rounded-xl p-3"
              style={{ background: "#fefce8", border: "1px solid #fde68a" }}>
              <Shield size={13} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600 mb-0.5">Résistances HR</p>
                <p className="text-xs font-medium text-amber-900">{resistance}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calendrier */}
      {hasCalendrier && (
        <div className="px-3 pb-3" style={{ background: "#fff" }}>
          <div className="pt-3 border-t" style={{ borderColor: "#dcfce7" }}>
            <CatalogueCalendrier semis={calendrier_semis} recolte={calendrier_recolte} />
          </div>
        </div>
      )}
    </div>
  );
}

export default async function ProduitDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  let produit: Awaited<ReturnType<typeof produitsService.bySlug>>;
  try { produit = await produitsService.bySlug(slug); } catch { notFound(); }

  const produitNom = translatedField(produit as any, "nom", locale) || produit.nom;
  const produitDescription = translatedField(produit as any, "description", locale) || produit.description;
  const marqueNom = produit.marque ? translatedField(produit.marque as any, "nom", locale) || produit.marque.nom : null;
  const categorieNom = produit.categorie ? translatedField(produit.categorie as any, "nom", locale) || produit.categorie.nom : null;
  const activiteNom = produit.categorie?.activite ? translatedField(produit.categorie.activite as any, "nom", locale) || produit.categorie.activite.nom : null;
  const parentCategorieNom = produit.categorie?.parent ? translatedField(produit.categorie.parent as any, "nom", locale) || produit.categorie.parent.nom : null;

  const div      = DIV[produit.division as keyof typeof DIV] ?? DIV.standard;
  const fichePdf = produit.fiche_technique?.startsWith("http") ? produit.fiche_technique : null;

  const conditionnements = [...new Set(
    produit.images
      .map((img: any) => img.conditionnement)
      .filter(Boolean) as string[]
  )];

  const isSemenceProduct =
    produit.categorie?.activite?.slug === "semences-et-plants" ||
    produit.categorie?.slug?.includes("semence") ||
    produit.categorie?.nom?.toLowerCase().includes("semence");

  const isMachinismeProduct = produit.categorie?.activite?.slug === "jardinage-et-machinisme";

  // Liens de retour : activité > marque > catégorie parent (en fonction de ce qui est disponible)
  const backHref = produit.categorie?.activite
    ? `/activites/${produit.categorie.activite!.slug}`
    : produit.marque
    ? `/marques/${produit.marque.slug}`
    : "/";

  const backLabel = produit.categorie?.activite
    ? activiteNom
    : produit.marque
    ? marqueNom
    : "Accueil";

  const condAvailable = conditionnements.length > 0 ? conditionnements.join(" · ") : null;

  return (
    <div className="min-h-screen" style={{ background: "#f8faf8" }}>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-sand-200">
        <div className="container-ev py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
            <Link href="/" className="hover:text-ev-700 transition-colors flex items-center gap-1">
              <Home size={10} /> Accueil
            </Link>
            <ChevronRight size={11} />

            {/* Marque — seulement si elle existe */}
            {produit.marque && (
              <>
                <Link href={`/marques/${produit.marque.slug}`} className="hover:text-ev-700 transition-colors">
                  {marqueNom}
                </Link>
                <ChevronRight size={11} />
              </>
            )}

            {/* Activité — seulement si elle existe et pas déjà via marque */}
            {produit.categorie?.activite && !produit.marque && (
              <>
                <Link href={`/activites/${produit.categorie.activite!.slug}`} className="hover:text-ev-700 transition-colors">
                  {activiteNom}
                </Link>
                <ChevronRight size={11} />
              </>
            )}

            {/* Catégorie parente */}
            {produit.categorie?.parent && (
              <>
                <span className="text-gray-500">{parentCategorieNom}</span>
                <ChevronRight size={11} />
              </>
            )}

            {/* Catégorie directe */}
            {produit.categorie && (
              <>
                <span className="text-gray-500">{categorieNom}</span>
                <ChevronRight size={11} />
              </>
            )}

            <span className="text-gray-700 font-medium">{produitNom}</span>
          </nav>
        </div>
      </div>

      <div className="container-ev py-5 sm:py-7">
        {isMachinismeProduct ? (
          <>
            {/* ── Ligne du haut : galerie + colonne infos essentielles ── */}
            <div className="flex flex-col lg:flex-row lg:w-fit lg:mx-auto lg:items-start gap-8 xl:gap-12">
              <div className="w-full lg:w-[460px] lg:shrink-0">
                <ProduitGallery images={produit.images} nomProduit={produitNom} />
              </div>

              <div className="flex w-full flex-col items-center gap-4 text-center lg:w-[320px] lg:shrink-0 lg:sticky lg:top-24 lg:self-start">
                <div>
                  <h1
                    className="text-2xl md:text-[1.75rem] font-black text-[#0c0c0e] leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {produitNom || produit.slug}
                  </h1>
                </div>

                {/* Logo marque — seul, sans cadre ni catégorie */}
                {produit.marque && (
                  <Link
                    href={`/marques/${produit.marque.slug}`}
                    className="hover:opacity-80 transition-opacity"
                  >
                    {produit.marque.logo ? (
                      <span className="relative block h-9 w-32">
                        <Image src={produit.marque.logo} alt={marqueNom ?? ""} fill className="object-contain" />
                      </span>
                    ) : (
                      <span className="text-sm font-black uppercase" style={{ color: "#e30613" }}>{marqueNom}</span>
                    )}
                  </Link>
                )}

                {/* Description image — affichée en haut, près des photos
                    produit et centrée sous le titre. Taille naturelle
                    (pas de recadrage) pour rester lisible. */}
                {(produit as any).image_description && (
                  <div
                    className="w-full overflow-hidden rounded-2xl border border-sand-200 bg-white"
                    style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={(produit as any).image_description}
                      alt={produitNom || ""}
                      className="block h-auto w-full"
                    />
                  </div>
                )}

                <Link
                  href={backHref}
                  className="inline-flex items-center gap-2 text-sm text-ev-700 hover:text-ev-900 font-medium transition-colors mt-1"
                >
                  <ChevronRight size={14} className="rotate-180" />
                  Retour vers {backLabel}
                </Link>
              </div>
            </div>

            {/* ── Onglets : Description / Caractéristiques ── */}
            <div className="mt-8">
              <ProduitTabs
                tabs={[
                  ...(produitDescription || fichePdf || produit.fiche_technique
                    ? [{
                        id: "description",
                        label: "Description",
                        content: (
                          <div className="grid grid-cols-1 sm:grid-cols-[1fr_280px] gap-6 items-start">
                            <div>
                              {produitDescription ? (
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                  {produitDescription}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-400 italic">
                                  Aucune description disponible pour ce produit.
                                </p>
                              )}
                            </div>

                            {(fichePdf || produit.fiche_technique) && (
                              <div className="flex flex-col gap-3">
                                {/* Documents — fiche technique imprimable / téléchargeable */}
                                <div className="flex flex-col gap-2">
                                  {fichePdf ? (
                                    <a
                                      href={fichePdf}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                      className="flex items-center gap-3 rounded-xl border border-sand-200 bg-white px-4 py-3 transition hover:border-ev-300 hover:bg-ev-50 group"
                                    >
                                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sand-100 text-gray-500 group-hover:bg-ev-100 group-hover:text-ev-700 transition-colors">
                                        <FileText size={16} />
                                      </span>
                                      <span className="text-sm font-semibold text-gray-700 group-hover:text-ev-800">
                                        Fiche technique (PDF)
                                      </span>
                                    </a>
                                  ) : (
                                    produit.fiche_technique && (
                                      <PrintFicheTechniqueButton
                                        html={produit.fiche_technique}
                                        title={produitNom}
                                      />
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ),
                      }]
                    : []),
                  ...(produit.fiche_technique && !fichePdf
                    ? [{
                        id: "caracteristiques",
                        label: "Caractéristiques",
                        content: (
                          <div
                            className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none prose-green"
                            dangerouslySetInnerHTML={{ __html: produit.fiche_technique }}
                          />
                        ),
                      }]
                    : []),
                ]}
              />
            </div>

          </>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-10 items-start">

          {/* ── Galerie ─────────────────────────────────────────── */}
          <div className="space-y-4">
            {conditionnements.length > 1
              ? <ProduitFicheSection conditionnements={conditionnements} images={produit.images} nomProduit={produitNom} />
              : <ProduitGallery images={produit.images} nomProduit={produitNom} />
            }
          </div>

          {/* ── Infos ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {produit.categorie && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sand-100 text-gray-600 border border-sand-200">
                  <Layers size={11} /> {categorieNom}
                </span>
              )}
              {/* Badge marque — uniquement si marque existe */}
              {produit.marque && (
                <Link href={`/marques/${produit.marque.slug}`}>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-ev-50 text-ev-700 border border-ev-200 hover:bg-ev-100 transition-colors cursor-pointer">
                    <Tag size={11} /> {marqueNom}
                  </span>
                </Link>
              )}
              {produit.categorie?.activite && (
                <Link href={`/activites/${produit.categorie.activite!.slug}`}>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer">
                    <Activity size={11} /> {activiteNom}
                  </span>
                </Link>
              )}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${div.bg} ${div.text} ${div.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${div.dot}`} />
                {div.label}
              </span>
              {(produit as any).biologique && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                  🌿 Bio certifié
                </span>
              )}
            </div>

            {/* Titre */}
            <div>
              <h1
                className="text-3xl md:text-4xl font-black text-ev-950"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em", lineHeight: "1.15", paddingTop: "0.1em" }}
              >
                {produitNom}
              </h1>
              {condAvailable && (
                <p className="mt-1.5 text-sm text-gray-400 font-medium">
                  Disponible en{" "}
                  <span className="font-semibold text-gray-600">{condAvailable}</span>
                </p>
              )}
            </div>

            {/* Catégorie pill enrichie */}
            {produit.categorie && (
              <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-2">
                <Layers size={15} className="text-green-600 shrink-0" />
                <span className="text-sm font-semibold text-green-800">{categorieNom}</span>
                {(produit as any).nature && (
                  <>
                    <span className="mx-0.5 text-green-300">·</span>
                    <span className="text-sm text-green-600">{(produit as any).nature}</span>
                  </>
                )}
                {(produit as any).biologique && (
                  <>
                    <span className="mx-0.5 text-green-300">·</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                      <Sun size={11} /> 100% Bio
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Description */}
            {(produitDescription || (produit as any).image_description) && (
              <div className="rounded-2xl bg-white border border-sand-200 p-5"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <div className={(produit as any).image_description ? "grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-5 items-start" : ""}>
                  {produitDescription && (
                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                      {produitDescription}
                    </p>
                  )}
                  {(produit as any).image_description && (
                    <div className="w-full overflow-hidden rounded-xl border border-sand-200 bg-sand-50 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={(produit as any).image_description}
                        alt={produitNom || ""}
                        className="block h-auto w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}



            {/* Tableau technique */}
            <ProduitTechTable
              poids={(produit as any).poids}
              nature={(produit as any).nature}
              composition_chimique={(produit as any).composition_chimique}
              usage={(produit as any).usage}
              biologique={(produit as any).biologique}
              conditionnement={(produit as any).conditionnement}
              slug={produit.slug}
              categorie={categorieNom ?? undefined}
              tags={Array.isArray(produit.tags) ? produit.tags as string[] : []}
            />

            {/* ── Carte Semences style catalogue ── */}
            <SemencesCard
              saison={(produit as any).saison}
              obtenteur={(produit as any).obtenteur}
              type_semence={(produit as any).type_semence}
              productivite={(produit as any).productivite}
              longueur_fruit={(produit as any).longueur_fruit}
              resistance={(produit as any).resistance}
              descriptif_var={(produit as any).descriptif_var}
              obtenteur_logo={(produit as any).obtenteur_logo}
              calendrier_semis={(produit as any).calendrier_semis}
              calendrier_recolte={(produit as any).calendrier_recolte}
              marqueNom={marqueNom}
              marqueLogo={produit.marque?.logo}
              marqueSlug={produit.marque?.slug}
            />

            {/* Fiche technique PDF — bouton de téléchargement */}
            {fichePdf && (
              <a
                href={fichePdf}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 transition hover:border-emerald-400 hover:bg-emerald-100 group"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm group-hover:bg-emerald-800 transition-colors">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">Fiche technique</p>
                    <p className="text-xs text-emerald-600">Télécharger le PDF</p>
                  </div>
                </div>
                <Download size={16} className="shrink-0 text-emerald-700 group-hover:text-emerald-900 transition-colors" />
              </a>
            )}

            {/* Fiche technique HTML (contenu enrichi, pas un PDF) */}
            {produit.fiche_technique && !fichePdf && (
              <details className="group rounded-2xl bg-white border border-sand-200 overflow-hidden"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-ev-800 hover:bg-ev-50 transition-colors list-none">
                  <span className="flex items-center gap-2">
                    <Package size={15} className="text-ev-600" />
                    Fiche technique
                  </span>
                  <ChevronRight size={14} className="text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div
                  className="px-5 pb-5 pt-2 text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none prose-green"
                  dangerouslySetInnerHTML={{ __html: produit.fiche_technique }}
                />
              </details>
            )}

            {/* Bouton retour */}
            <div className="mt-2">
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 text-sm text-ev-700 hover:text-ev-900 font-medium transition-colors"
              >
                <ChevronRight size={14} className="rotate-180" />
                Retour vers {backLabel}
              </Link>
            </div>

          </div>
        </div>
        )}
      </div>

   {isSemenceProduct && (
  <SeedCalculatorWidget
    defaultPlant={detectPlant(produitNom)}
  />
)}

      {/* ── Produits similaires ──────────────────────────────── */}
      <div className="container-ev pb-10">
        <ProduitsSimilaires
          idCategorie={produit.id_categorie}
          idProduitActuel={produit.id_produit}
          idCategorieParent={(produit.categorie as any)?.parent?.id_categorie ?? null}
          idActivite={produit.id_activite ?? null}
        />
      </div>
    </div>
  );
}