 "use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import type { Activite } from "@/types/api";
import { cn } from "@/lib/utils";
import { getActivityHrefBySlug } from "@/lib/activity-links";
import { useI18n } from "@/i18n/I18nProvider";
import { translatedField } from "@/i18n/translated-field";

export function ActiviteCard({
  activite,
  className,
}: {
  activite: Activite;
  className?: string;
}) {
  const { locale, t } = useI18n();
  const href = getActivityHrefBySlug(activite.slug);
  const nom = translatedField(activite as any, "nom", locale) || activite.nom;
  const description = translatedField(activite as any, "description", locale) || activite.description;

  return (
    <Link href={href} className={cn("block group", className)}>
      <article className="card card-hover h-full flex flex-col overflow-hidden">
        {/* Image / placeholder */}
        <div
          className="relative h-48 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}
        >
          {activite.image ? (
            <Image
              src={activite.image}
              alt={nom}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-ev-200">
              <Leaf size={48} />
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
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
              {description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-1 text-sm font-bold text-ev-600">
            <span style={{ fontFamily: "var(--font-display)" }}>{t("home.discover", "Découvrir")}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </article>
    </Link>
  );
}
