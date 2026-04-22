"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        Une erreur s&apos;est produite
      </h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        Nous n&apos;avons pas pu charger cette page. Veuillez réessayer.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={reset} className="btn-primary">
          Réessayer
        </button>
        <Link href="/" className="btn-outline">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
