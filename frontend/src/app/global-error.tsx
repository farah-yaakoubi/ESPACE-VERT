"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[Global Error]", error);

  return (
    <html lang="fr">
      <body>
        <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            Une erreur est survenue
          </h1>
          <p className="mb-6 max-w-sm text-sm text-gray-500">
            La page n&apos;a pas pu etre chargee correctement.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-ev-700 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Reessayer
          </button>
        </main>
      </body>
    </html>
  );
}
