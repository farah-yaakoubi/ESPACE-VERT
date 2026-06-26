import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import type { Activite } from "@/types/api";
import { cn } from "@/lib/utils";
import { getActivityHrefBySlug } from "@/lib/activity-links";

export function ActiviteCard({
  activite,
  className,
}: {
  activite: Activite;
  className?: string;
}) {
  const href = getActivityHrefBySlug(activite.slug);

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
              alt={activite.nom}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
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
            {activite.nom}
          </h3>
          {activite.description && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
              {activite.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-1 text-sm font-bold text-ev-600">
            <span style={{ fontFamily: "var(--font-display)" }}>Découvrir</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </article>
    </Link>
  );
}
