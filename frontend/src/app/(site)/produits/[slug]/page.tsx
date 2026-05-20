import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, Tag, Layers, Activity, Package, Home,
  Truck, Microscope, Handshake, Sun,
} from "lucide-react";
import { produitsService } from "@/services";
import { ProduitGallery } from "./ProduitGallery";
import { ProduitFicheSection } from "./ProduitFicheSection";
import { ProduitTechTable } from "./ProduitTechTable";
import { ProduitsSimilaires } from "@/components/ProduitsSimilaires";
import { ProduitSemencesAssistant } from "./ProduitSemencesAssistant";

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

const TRUST = [
  { Icon: Truck,      title: "Livraison rapide", sub: "partout au Maroc" },
  { Icon: Microscope, title: "Certifié Bio",     sub: "Norme internationale" },
  { Icon: Handshake,  title: "Support expert",   sub: "Conseil agronomique" },
];

export default async function ProduitDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let produit: Awaited<ReturnType<typeof produitsService.bySlug>>;
  try { produit = await produitsService.bySlug(slug); } catch { notFound(); }

  const div      = DIV[produit.division as keyof typeof DIV] ?? DIV.standard;
  const fichePdf = produit.fiche_technique?.startsWith("http") ? produit.fiche_technique : null;

  const conditionnements = [...new Set(
    produit.images
      .map((img: any) => img.conditionnement)
      .filter(Boolean) as string[]
  )];

  const isSemenceProduct =
    produit.activite?.slug === "semences-et-plants" ||
    produit.categorie?.slug?.includes("semence") ||
    produit.categorie?.nom?.toLowerCase().includes("semence");

  // Liens de retour : activité > marque > catégorie parent (en fonction de ce qui est disponible)
  const backHref = produit.activite
    ? `/activites/${produit.activite.slug}`
    : produit.marque
    ? `/marques/${produit.marque.slug}`
    : "/";

  const backLabel = produit.activite
    ? produit.activite.nom
    : produit.marque
    ? produit.marque.nom
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
                  {produit.marque.nom}
                </Link>
                <ChevronRight size={11} />
              </>
            )}

            {/* Activité — seulement si elle existe et pas déjà via marque */}
            {produit.activite && !produit.marque && (
              <>
                <Link href={`/activites/${produit.activite.slug}`} className="hover:text-ev-700 transition-colors">
                  {produit.activite.nom}
                </Link>
                <ChevronRight size={11} />
              </>
            )}

            {/* Catégorie parente */}
            {produit.categorie?.parent && (
              <>
                <span className="text-gray-500">{produit.categorie.parent.nom}</span>
                <ChevronRight size={11} />
              </>
            )}

            {/* Catégorie directe */}
            {produit.categorie && (
              <>
                <span className="text-gray-500">{produit.categorie.nom}</span>
                <ChevronRight size={11} />
              </>
            )}

            <span className="text-gray-700 font-medium">{produit.nom}</span>
          </nav>
        </div>
      </div>

      <div className="container-ev py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16">

          {/* ── Galerie ─────────────────────────────────────────── */}
          <div className="space-y-4">
            {conditionnements.length > 1
              ? <ProduitFicheSection conditionnements={conditionnements} images={produit.images} nomProduit={produit.nom} />
              : <ProduitGallery images={produit.images} nomProduit={produit.nom} />
            }
          </div>

          {/* ── Infos ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {produit.categorie && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sand-100 text-gray-600 border border-sand-200">
                  <Layers size={11} /> {produit.categorie.nom}
                </span>
              )}
              {/* Badge marque — uniquement si marque existe */}
              {produit.marque && (
                <Link href={`/marques/${produit.marque.slug}`}>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-ev-50 text-ev-700 border border-ev-200 hover:bg-ev-100 transition-colors cursor-pointer">
                    <Tag size={11} /> {produit.marque.nom}
                  </span>
                </Link>
              )}
              {produit.activite && (
                <Link href={`/activites/${produit.activite.slug}`}>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer">
                    <Activity size={11} /> {produit.activite.nom}
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
                className="text-3xl md:text-4xl font-black text-ev-950 leading-tight"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em" }}
              >
                {produit.nom}
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
                <span className="text-sm font-semibold text-green-800">{produit.categorie.nom}</span>
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
            {produit.description && (
              <div className="rounded-2xl bg-white border border-sand-200 p-5"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                  {produit.description}
                </p>
              </div>
            )}

            {/* Tableau technique */}
            <ProduitTechTable
              sku={(produit as any).sku}
              poids={(produit as any).poids}
              nature={(produit as any).nature}
              composition_chimique={(produit as any).composition_chimique}
              usage={(produit as any).usage}
              biologique={(produit as any).biologique}
              conditionnement={(produit as any).conditionnement}
              slug={produit.slug}
              categorie={produit.categorie?.nom}
              tags={Array.isArray(produit.tags) ? produit.tags as string[] : []}
            />

            {/* Fiche technique HTML */}
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

            {/* Trust badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TRUST.map(({ Icon, title, sub }) => (
                <div
                  key={title}
                  className="flex flex-col items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-3 text-center"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                    style={{ background: "#1a5c2e" }}
                  >
                    <Icon size={16} />
                  </div>
                  <p className="text-[11px] font-bold text-green-900">{title}</p>
                  <p className="text-[10px] text-gray-400 -mt-1">{sub}</p>
                </div>
              ))}
            </div>

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
      </div>

      {/* ── Produits similaires ──────────────────────────────── */}
      <div className="container-ev pb-14">
        <ProduitsSimilaires
          idCategorie={produit.id_categorie}
          idProduitActuel={produit.id_produit}
          idMarque={produit.id_marque}
        />
      </div>

      {isSemenceProduct && <ProduitSemencesAssistant productName={produit.nom} />}
    </div>
  );
}