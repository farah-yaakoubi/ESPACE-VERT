import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import type { Actualite } from "@/types/api";
import { cn } from "@/lib/utils";

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function stripHtml(h: string) { return h.replace(/<[^>]+>/g, ""); }

export function ActualiteCard({ actualite, className }: { actualite: Actualite; className?: string }) {
  return (
    <Link href={`/actualites/${actualite.slug}`} className={cn("block group", className)}>
      <article className="card card-hover h-full flex flex-col overflow-hidden">
        <div className="relative h-48 bg-sand-100 overflow-hidden shrink-0">
          {actualite.image ? (
            <Image
              src={actualite.image} alt={actualite.titre} fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-4xl opacity-20 select-none"
              style={{ background: "linear-gradient(135deg, #0a5c2e, #15803d)" }}
            >
              📰
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 p-5">
          <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-2.5">
            <Calendar size={12} />{fmtDate(actualite.published_at ?? actualite.created_at)}
          </p>
          <h3
            className="font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:text-ev-700 transition-colors flex-1"
            style={{ fontFamily: "var(--font-display)", color: "#111" }}
          >
            {actualite.titre}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {stripHtml(actualite.contenu).substring(0, 120)}…
          </p>
          <p className="mt-3 text-xs font-bold text-ev-600" style={{ fontFamily: "var(--font-display)" }}>
            Lire la suite →
          </p>
        </div>
      </article>
    </Link>
  );
}
