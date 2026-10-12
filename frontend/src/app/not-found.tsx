"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl mb-6 select-none">🌿</p>
      <h1
        className="text-4xl font-bold text-ev-900 mb-3"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {t("notFound.title", "Page introuvable")}
      </h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        {t("notFound.text", "La page que vous cherchez n'existe pas ou a été déplacée.")}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/" className="btn-primary">
          {t("common.backHome", "Retour à l'accueil")}
        </Link>
        <Link href="/contact" className="btn-outline">
          {t("common.contactUs", "Nous contacter")}
        </Link>
      </div>
    </div>
  );
}
