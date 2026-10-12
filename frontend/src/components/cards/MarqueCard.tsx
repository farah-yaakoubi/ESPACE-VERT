 "use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Marque } from "@/types/api";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { translatedField } from "@/i18n/translated-field";

export function MarqueCard({
  marque,
  className,
  compactLogo = false,
}: {
  marque: Marque;
  className?: string;
  /** Logo plus petit dans son encadré (utile pour les grilles de marques partenaires) */
  compactLogo?: boolean;
}) {
  const { locale, t } = useI18n();
  const nom = translatedField(marque as any, "nom", locale) || marque.nom;
  const description = translatedField(marque as any, "description", locale) || marque.description;

  return (
    <Link href={`/marques/${marque.slug}`} className={cn("block group", className)}>
      <article className="card card-hover h-full flex flex-col overflow-hidden">
        {/* Logo */}
        <div className={cn("relative overflow-hidden", compactLogo ? "h-36" : "h-48")}
          style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}>
          {marque.logo ? (
            <Image
              src={marque.logo} alt={nom} fill
              className={cn("object-contain group-hover:scale-105 transition-transform duration-500", compactLogo ? "p-12" : "p-8")}
              sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
            />
          ) : (
            <span
              className={cn("absolute inset-0 flex items-center justify-center font-bold select-none", compactLogo ? "text-[3.5rem]" : "text-[5rem]")}
              style={{ color: "#bbf7d0", fontFamily: "var(--font-display)" }}
            >
              {nom[0]}
            </span>
          )}
        </div>
        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <h3
            className="text-xl font-bold mb-2 group-hover:text-ev-700 transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {nom}
          </h3>
          {description && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">{description}</p>
          )}
          <div className="mt-4 flex items-center gap-1 text-sm font-bold text-ev-600">
            <span style={{ fontFamily: "var(--font-display)" }}>{t("catalog.viewProducts", "Voir les produits")}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </article>
    </Link>
  );
}
