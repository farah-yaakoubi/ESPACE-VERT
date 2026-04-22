import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, FileText, MessageCircle, Download } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { produitsService } from "@/services";
import { ProduitActions } from "./ProduitActions";

export const revalidate = 60;

/* ── Static params ─────────────────────────────────────────────── */
export async function generateStaticParams() {
  try {
    const res = await produitsService.list({ limit: 200 });
    return res.data.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

/* ── Metadata ──────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await produitsService.bySlug(slug);
    return {
      title:       p.nom,
      description: p.description ?? `Produit ${p.nom} — ${p.marque.nom}`,
    };
  } catch {
    return { title: "Produit introuvable" };
  }
}

const DIVISION_BADGE: Record<string, { label: string; variant: "green" | "sand" | "matar" }> = {
  pro:    { label: "Gamme Pro",    variant: "green" },
  garden: { label: "Gamme Garden", variant: "sand"  },
};

/* ── Page ──────────────────────────────────────────────────────── */
export default async function ProduitDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let produit;
  try {
    produit = await produitsService.bySlug(slug);
  } catch {
    notFound();
  }

  /* Pick principal image, fall back to first */
  const mainImg =
    produit.images.find((i) => i.is_principale) ?? produit.images[0] ?? null;

  const otherImgs = produit.images.filter((i) => i !== mainImg);

  const divBadge = DIVISION_BADGE[produit.division];

  return (
    <div className="bg-sand-50 min-h-screen">

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-sand-200">
        <div className="container-ev py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
            <Link href="/" className="hover:text-ev-700 transition-colors">Accueil</Link>
            <ChevronRight size={12} />
            <Link href={`/marques/${produit.marque.slug}`} className="hover:text-ev-700 transition-colors">
              {produit.marque.nom}
            </Link>
            <ChevronRight size={12} />
            {produit.categorie.parent && (
              <>
                <span>{produit.categorie.parent.nom}</span>
                <ChevronRight size={12} />
              </>
            )}
            <span className="text-gray-700 font-medium">{produit.nom}</span>
          </nav>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="container-ev py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

          {/* ── Left : Images ────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square rounded-3xl bg-white border border-sand-200 overflow-hidden shadow-card">
              {mainImg ? (
                <Image
                  src={mainImg.url}
                  alt={mainImg.alt ?? produit.nom}
                  fill
                  priority
                  className="object-contain p-8"
                  sizes="(max-width:1024px)100vw,50vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-15 select-none">
                  🌿
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {otherImgs.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {otherImgs.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-20 rounded-xl bg-white border border-sand-200 overflow-hidden shrink-0"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt ?? `${produit.nom} — vue ${i + 2}`}
                      fill
                      className="object-contain p-2"
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Right : Info + Actions ────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="sand">{produit.categorie.nom}</Badge>
              <Link href={`/marques/${produit.marque.slug}`}>
                <Badge variant="green">{produit.marque.nom}</Badge>
              </Link>
              {divBadge && (
                <Badge variant={divBadge.variant}>{divBadge.label}</Badge>
              )}
            </div>

            {/* Name */}
            <h1
              className="text-3xl md:text-4xl font-bold text-ev-950 leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {produit.nom}
            </h1>

            {/* Description */}
            {produit.description && (
              <p className="text-gray-600 leading-relaxed text-[15px]">
                {produit.description}
              </p>
            )}

            {/* Tags */}
            {Array.isArray(produit.tags) && produit.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(produit.tags as string[]).map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}

            {/* Fiche technique download */}
            {produit.fiche_technique && (
              <a
                href={produit.fiche_technique}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-ev-700 hover:text-ev-900 transition-colors"
              >
                <Download size={16} />
                Télécharger la fiche technique
              </a>
            )}

            <div className="divider" />

            {/* ── CTA buttons ─────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
              <ProduitActions
                id_produit={produit.id_produit}
                nomProduit={produit.nom}
                marqueSlug={produit.marque.slug}
                activiteSlug={produit.categorie.slug}
              />
            </div>
          </div>
        </div>

        {/* ── Fiche technique (rich text if stored as text) ─────── */}
        {produit.fiche_technique &&
          !produit.fiche_technique.startsWith("http") && (
            <div className="mt-14">
              <h2
                className="text-2xl font-bold text-ev-900 mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Fiche technique
              </h2>
              <div className="card p-8">
                <div
                  className="prose prose-green max-w-none text-sm leading-relaxed whitespace-pre-wrap text-gray-700"
                  dangerouslySetInnerHTML={{ __html: produit.fiche_technique }}
                />
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
