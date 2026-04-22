import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { activitesService, categoriesService, produitsService } from "@/services";
import { ActiviteProduitsSection } from "./ActiviteProduitsSection";

export const revalidate = 300;

export async function generateStaticParams() {
  const acts = await activitesService.list();
  return acts.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const acts = await activitesService.list();
  const act  = acts.find((a) => a.slug === slug);
  return act
    ? { title: act.nom, description: act.description ?? `Produits ${act.nom}` }
    : { title: "Activité introuvable" };
}

export default async function ActiviteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const acts = await activitesService.list();
  const act  = acts.find((a) => a.slug === slug);
  if (!act) notFound();

  /* Categories belonging to this activite */
  const categories = await categoriesService.list({ id_activite: act.id_activite });

  /* Special rule: Irrigation + Matar → show RDV CTA */
  const isIrrigation = act.slug === "irrigation";

  return (
    <>
      {/* ── Activite hero ───────────────────────────────────────── */}
      <section className="relative bg-ev-950 py-16 md:py-24 overflow-hidden">
        {act.image && (
          <>
            <Image src={act.image} alt={act.nom} fill className="object-cover opacity-20" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-r from-ev-950/95 to-ev-950/50" />
          </>
        )}
        <div className="container-ev relative z-10">
          <p className="eyebrow text-ev-400 mb-3">Activité</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">
            {act.nom}
          </h1>
          {act.description && (
            <p className="text-white/65 text-lg max-w-2xl leading-relaxed">
              {act.description}
            </p>
          )}

          {/* ── RDV banner — Irrigation only ────────────────────── */}
          {isIrrigation && (
            <div className="mt-8 inline-flex items-center gap-4 bg-sky-900/60 border border-sky-700/50 rounded-2xl px-6 py-4">
              <CalendarDays size={24} className="text-sky-400 shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">Solutions d'irrigation Matar</p>
                <p className="text-sky-300 text-xs">
                  Prenez rendez-vous avec un expert pour un audit personnalisé de votre installation.
                </p>
              </div>
              <Link
                href="/rendez-vous"
                className="btn btn-sm bg-sky-500 text-white hover:bg-sky-400 shrink-0"
              >
                Prendre RDV
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Category tabs (if any) ─────────────────────────────── */}
      {categories.length > 0 && (
        <section className="bg-white border-b border-sand-200">
          <div className="container-ev py-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-xs text-gray-400 font-medium shrink-0">Catégories :</span>
            {categories.map((cat) => (
              <span
                key={cat.id_categorie}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-ev-50 text-ev-700 border border-ev-100"
              >
                {cat.nom}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Products section (client component) ─────────────────── */}
      <ActiviteProduitsSection
        id_activite={act.id_activite}
        categories={categories}
      />
    </>
  );
}
