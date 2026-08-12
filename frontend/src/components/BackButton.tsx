"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/**
 * Bouton "Retour" générique : revient à la page précédente dans l'historique
 * du navigateur si elle existe (même origine), sinon retombe sur `fallbackHref`.
 *
 * Utilisation :
 *   <BackButton fallbackHref="/produits" label="Retour aux produits" />
 */
export function BackButton({
  fallbackHref = "/",
  label = "Retour",
  className = "",
}: {
  fallbackHref?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  const handleClick = () => {
    // window.history.length > 1 indique qu'il y a bien une page précédente
    // dans l'onglet courant (évite de "sortir" du site si on arrive par lien direct).
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold text-ev-700 transition-colors hover:text-ev-900 ${className}`}
    >
      <ChevronLeft size={16} strokeWidth={2.4} />
      {label}
    </button>
  );
}