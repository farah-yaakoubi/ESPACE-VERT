"use client";

import { Navigation } from "lucide-react";

export function ContactMap({
  lat,
  lng,
  label,
  mapsUrl,
}: {
  lat: number;
  lng: number;
  label: string;
  mapsUrl: string;
}) {
  return (
    <section className="section pt-0">
      <div className="container-ev">
        <div className="overflow-hidden rounded-[1.5rem] border border-sand-200 shadow-[0_16px_48px_rgba(10,60,8,0.08)]">
          <div className="relative h-[320px] w-full sm:h-[380px]">
            <iframe
              title={label}
              src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-4 sm:px-8">
            <p className="text-sm font-bold text-ev-950">{label}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.08em] text-ev-700 transition-colors hover:text-ev-900"
            >
              <Navigation size={13} />
              Itinéraire
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}