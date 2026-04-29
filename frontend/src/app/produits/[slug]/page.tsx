import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Tag, Layers, Activity, Package } from "lucide-react";
import { produitsService } from "@/services";
import { ProduitGallery } from "./ProduitGallery";
import { ProduitActions } from "./ProduitActions";

export const revalidate = 60;

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
    return {
      title: `${p.nom} — ${p.marque.nom}`,
      description: p.description ?? `Découvrez ${p.nom} de la gamme ${p.marque.nom}.`,
      openGraph: { images: p.images[0] ? [p.images[0].url] : [] },
    };
  } catch { return { title: "Produit introuvable" }; }
}

const DIV = {
  pro:      { label: "Gamme Pro",    bg: "bg-blue-50",   text: "text-blue-700",  border: "border-blue-200",  dot: "bg-blue-500"  },
  garden:   { label: "Gamme Garden", bg: "bg-green-50",  text: "text-green-700", border: "border-green-200", dot: "bg-green-500" },
  standard: { label: "Standard",     bg: "bg-gray-50",   text: "text-gray-600",  border: "border-gray-200",  dot: "bg-gray-400"  },
};

export default async function ProduitDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let produit: Awaited<ReturnType<typeof produitsService.bySlug>>;
  try { produit = await produitsService.bySlug(slug); } catch { notFound(); }

  const div      = DIV[produit.division as keyof typeof DIV] ?? DIV.standard;
  const fichePdf = produit.fiche_technique?.startsWith("http") ? produit.fiche_technique : null;

  return (
    <div className="min-h-screen" style={{ background: "#f8faf8" }}>

      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-sand-200">
        <div className="container-ev py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
            <Link href="/" className="hover:text-ev-700 transition-colors">Accueil</Link>
            <ChevronRight size={11} />
            <Link href={`/marques/${produit.marque.slug}`} className="hover:text-ev-700 transition-colors">
              {produit.marque.nom}
            </Link>
            <ChevronRight size={11} />
            {produit.categorie?.parent && (
              <><span className="hover:text-ev-700">{produit.categorie.parent.nom}</span><ChevronRight size={11} /></>
            )}
            <span className="text-gray-700 font-medium">{produit.nom}</span>
          </nav>
        </div>
      </div>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="container-ev py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

          {/* ── Galerie ─────────────────────────────────────────── */}
          <ProduitGallery images={produit.images} nomProduit={produit.nom} />

          {/* ── Infos ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Tags badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {produit.categorie && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sand-100 text-gray-600 border border-sand-200">
                  <Layers size={11} /> {produit.categorie.nom}
                </span>
              )}
              <Link href={`/marques/${produit.marque.slug}`}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-ev-50 text-ev-700 border border-ev-200 hover:bg-ev-100 transition-colors cursor-pointer">
                  <Tag size={11} /> {produit.marque.nom}
                </span>
              </Link>
              {produit.activite && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  <Activity size={11} /> {produit.activite.nom}
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${div.bg} ${div.text} ${div.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${div.dot}`} />
                {div.label}
              </span>
            </div>

            {/* Titre */}
            <h1
              className="text-3xl md:text-4xl font-black text-ev-950 leading-tight"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em" }}
            >
              {produit.nom}
            </h1>

            {/* Description */}
            {produit.description && (
              <div className="rounded-2xl bg-white border border-sand-200 p-5"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                  {produit.description}
                </p>
              </div>
            )}

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

            {/* Actions (Devis / RDV / Contact / Fiche PDF) */}
            <ProduitActions
              id_produit={produit.id_produit}
              nomProduit={produit.nom}
              marqueSlug={produit.marque.slug}
              activiteSlug={produit.activite?.slug ?? null}
              fichePdfUrl={fichePdf}
            />
          </div>
        </div>
      </div>
    </div>
  );
}