"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl mb-6 select-none">⚠️</p>
      <h2
        className="text-3xl font-bold text-ev-900 mb-3"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {t("error.title", "Une erreur s'est produite")}
      </h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        {t("error.text", "Nous n'avons pas pu charger cette page. Veuillez réessayer.")}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={reset} className="btn-primary">
          {t("error.retry", "Réessayer")}
        </button>
        <Link href="/" className="btn-outline">
          {t("common.backHome", "Retour à l'accueil")}
        </Link>
      </div>
    </div>
  );
}
