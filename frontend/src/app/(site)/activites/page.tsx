import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { activitesService, categoriesService } from "@/services";
import { ActiviteProduitsSectionWrapper } from "./ActiviteProduitsSection";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

/* ── Static params ───────────────────────────────────────────────── */
export async function generateStaticParams() {
  const acts = await activitesService.list();
  return acts.map((a) => ({ slug: a.slug }));
}

/* ── Metadata ────────────────────────────────────────────────────── */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
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
export default async function ActiviteDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const acts = await activitesService.list();
  const act  = acts.find((a) => a.slug === slug);
  if (!act) notFound();

  const activite = act!;

  /* Fetch categories for this activite (includes hierarchy / parent_id) */
  const categories = await categoriesService.list({ id_activite: activite.id_activite });

  /* Root-level categories for quick-nav pills */
  const rootCategories = categories.filter((c) => !c.parent_id);

  /* Special rule: Irrigation + Matar → show RDV CTA */
  const isIrrigation = activite.slug === "irrigation";

  /* Image priorité : banniere dédiée > image miniature > rien */
  const bgImage = (activite as any).banniere || activite.image;
  const hasBanniere = !!(activite as any).banniere;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      {hasBanniere ? (
        /* Bannière pleine largeur avec effet Ken Burns */
        <section
          style={{
            position: "relative",
            width: "100%",
            overflow: "hidden",
            height: "55vh",
            minHeight: 300,
            maxHeight: 560,
          }}
        >
          <style>{`
            @keyframes ahbZoom { from { transform:scale(1) } to { transform:scale(1.08) } }
            .ahb-img { position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;animation:ahbZoom 12s ease-in-out forwards; }
            @keyframes ahbUp { from { opacity:0;transform:translateY(22px) } to { opacity:1;transform:translateY(0) } }
            .ahb-txt { animation:ahbUp 0.8s cubic-bezier(.22,1,.36,1) 0.1s both; }
          `}</style>

          <img src={(activite as any).banniere} alt={activite.nom} className="ahb-img" />

          {/* Gradient overlay */}
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
              background: "linear-gradient(to bottom, rgba(0,0,0,.55) 0%, rgba(0,0,0,.12) 35%, rgba(0,0,0,.08) 52%, rgba(0,0,0,.65) 78%, rgba(0,0,0,.82) 100%)",
            }}
          />

          <div
            className="ahb-txt"
            style={{
              position: "absolute",
              bottom: "clamp(40px,8vh,80px)",
              left: 0, right: 0, zIndex: 4,
              padding: "0 clamp(20px,6vw,100px)",
              maxWidth: 860,
            }}
          >
            <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:800, letterSpacing:"0.22em", textTransform:"uppercase", color:"#86efac", textShadow:"0 1px 6px rgba(0,0,0,.45)" }}>
              Activité
            </p>
            <h1 style={{ margin:0, fontSize:"clamp(1.8rem,4vw,3.2rem)", fontWeight:900, color:"#fff", lineHeight:1.1, letterSpacing:"-0.025em", textShadow:"0 2px 30px rgba(0,0,0,.4)" }}>
              {activite.nom}
            </h1>
            {activite.description && (
              <p style={{ margin:"14px 0 0", fontSize:"clamp(0.87rem,1.35vw,1.05rem)", color:"rgba(255,255,255,.80)", lineHeight:1.65, maxWidth:520, textShadow:"0 1px 8px rgba(0,0,0,.3)" }}>
                {activite.description}
              </p>
            )}
            {isIrrigation && (
              <div style={{ marginTop: 28 }}>
                <div className="inline-flex items-center gap-4 bg-sky-900/60 border border-sky-700/50 rounded-2xl px-6 py-4">
                  <CalendarDays size={24} className="text-sky-400 shrink-0" />
                  <div>
                    <p className="text-white font-semibold text-sm">Solutions d&apos;irrigation Matar</p>
                    <p className="text-sky-300 text-xs">Prenez rendez-vous avec un expert pour un audit personnalisé.</p>
                  </div>
                  <Link href="/rendez-vous" className="btn btn-sm bg-sky-500 text-white hover:bg-sky-400 shrink-0">Prendre RDV</Link>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        /* Fallback : dégradé sombre + image miniature en fond flou */
        <section
          className="relative bg-ev-950 overflow-hidden"
          style={{ paddingTop: "calc(80px + 3rem)", paddingBottom: "3rem" }}
        >
          {bgImage && (
            <>
              <img
                src={bgImage}
                alt={activite.nom}
                style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:0.20 }}
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to right, rgba(8,28,14,0.95) 0%, rgba(8,28,14,0.50) 100%)" }}
              />
            </>
          )}
          <div className="container-ev relative z-10">
            <p className="eyebrow text-ev-400 mb-3">Activité</p>
            <h1 className="font-bold text-white font-display mb-4" style={{ fontSize: "clamp(1.8rem,4vw,3.2rem)" }}>
              {activite.nom}
            </h1>
            {activite.description && (
              <p className="text-white/65 text-lg max-w-2xl leading-relaxed">{activite.description}</p>
            )}
            {isIrrigation && (
              <div className="mt-8 inline-flex items-center gap-4 bg-sky-900/60 border border-sky-700/50 rounded-2xl px-6 py-4">
                <CalendarDays size={24} className="text-sky-400 shrink-0" />
                <div>
                  <p className="text-white font-semibold text-sm">Solutions d&apos;irrigation Matar</p>
                  <p className="text-sky-300 text-xs">Prenez rendez-vous avec un expert pour un audit personnalisé de votre installation.</p>
                </div>
                <Link href="/rendez-vous" className="btn btn-sm bg-sky-500 text-white hover:bg-sky-400 shrink-0">Prendre RDV</Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Categories quick nav ───────────────────────────────── */}
      {rootCategories.length > 0 && (
        <section className="bg-white border-b border-sand-200">
          <div className="container-ev py-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-xs text-gray-400 font-medium shrink-0">Catégories :</span>
              {rootCategories.map((cat) => (
                <a
                  key={cat.id_categorie}
                  href={`#cat-${cat.id_categorie}`}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-ev-50 text-ev-700 border border-ev-100 whitespace-nowrap"
                >
                  {cat.nom}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Products section (client component) ─────────────────── */}
      <ActiviteProduitsSectionWrapper
        id_activite={activite.id_activite}
        categories={categories}
      />
    </>
  );
}