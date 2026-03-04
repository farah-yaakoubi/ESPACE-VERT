"use client";

import { PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { Division } from "./FertivertData";

interface FertivertFooterCTAProps {
  division: Division;
  locale: string;
}

export default function FertivertFooterCTA({ division, locale }: FertivertFooterCTAProps) {
  return (
    <div
      className="relative overflow-hidden mt-4 text-white"
      style={{ background: division.heroGrad }}
    >
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="relative max-w-xl mx-auto px-8 py-14 text-center">
        <h2 className="text-3xl font-black mb-2">Besoin de conseils ?</h2>
        <p className="text-white/65 mb-8">Nos experts vous accompagnent dans tous vos choix</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="tel:+21671333858"
            className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors"
            style={{ color: division.dark }}
          >
            <PhoneIcon className="w-4 h-4" /> (+216) 71 333 858
          </a>
          <Link
            href={`/${locale}/contact`}
            className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 border-2 border-white/40 text-white font-bold rounded-xl text-sm hover:bg-white/20 transition-colors"
          >
            <EnvelopeIcon className="w-4 h-4" /> Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  );
}