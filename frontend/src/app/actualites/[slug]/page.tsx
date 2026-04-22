import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Calendar, User, ArrowLeft } from "lucide-react";
import { actualitesService } from "@/services";
import { formatDate } from "@/lib/utils";

export const revalidate = 120;

/* ── Static params ─────────────────────────────────────────────── */
export async function generateStaticParams() {
  try {
    const { data } = await actualitesService.list(1, 50);
    return data.map((a) => ({ slug: a.slug }));
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
    const a = await actualitesService.bySlug(slug);
    return {
      title:       a.titre,
      description: a.contenu.replace(/<[^>]+>/g, "").slice(0, 160),
      openGraph:   { images: a.image ? [a.image] : [] },
    };
  } catch {
    return { title: "Article introuvable" };
  }
}

/* ── Page ──────────────────────────────────────────────────────── */
export default async function ActualiteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let article;
  try {
    article = await actualitesService.bySlug(slug);
  } catch {
    notFound();
  }

  /* Use published_at if available, otherwise created_at */
  const dateDisplay = article.published_at ?? article.created_at;

  return (
    <div className="bg-sand-50 min-h-screen">

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-sand-200">
        <div className="container-ev py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
            <Link href="/" className="hover:text-ev-700 transition-colors">Accueil</Link>
            <ChevronRight size={12} />
            <Link href="/actualites" className="hover:text-ev-700 transition-colors">Actualités</Link>
            <ChevronRight size={12} />
            <span className="text-gray-700 font-medium line-clamp-1">{article.titre}</span>
          </nav>
        </div>
      </div>

      {/* ── Article ────────────────────────────────────────────── */}
      <article className="container-ev py-12 max-w-3xl">

        {/* Back link */}
        <Link
          href="/actualites"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-ev-700 transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Retour aux actualités
        </Link>

        {/* Cover image */}
        {article.image && (
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden mb-8 shadow-card">
            <Image
              src={article.image}
              alt={article.titre}
              fill
              priority
              className="object-cover"
              sizes="(max-width:1024px)100vw,800px"
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-5 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {formatDate(dateDisplay)}
          </span>
          {article.admin && (
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {article.admin.nom}
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="text-3xl md:text-4xl font-bold text-ev-950 mb-8 leading-tight text-balance"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {article.titre}
        </h1>

        {/* Content — stored as HTML in contenu field */}
        <div
          className="
            prose prose-lg prose-green max-w-none
            prose-headings:font-display prose-headings:text-ev-900
            prose-a:text-ev-700 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-2xl
            prose-pre:bg-ev-950 prose-pre:text-ev-100
            text-gray-700 leading-relaxed
          "
          dangerouslySetInnerHTML={{ __html: article.contenu }}
        />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-sand-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/actualites" className="btn-ghost">
            <ArrowLeft size={15} />
            Toutes les actualités
          </Link>
          <Link href="/contact" className="btn-outline">
            Une question ? Contactez-nous
          </Link>
        </div>
      </article>
    </div>
  );
}
