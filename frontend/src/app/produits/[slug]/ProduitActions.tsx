"use client";
import { useState } from "react";
import { FileText, MessageCircle, CalendarDays, X } from "lucide-react";
import { DevisForm }   from "@/components/forms/DevisForm";
import { ContactForm } from "@/components/forms/ContactForm";
import { cn }          from "@/lib/utils";

type Modal = "devis" | "contact" | null;

interface Props {
  id_produit:  number;
  nomProduit:  string;
  marqueSlug:  string;
  activiteSlug: string;
}

/* ── Inline modal ───────────────────────────────────────────────── */
function ModalOverlay({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand-200 shrink-0">
          <h2 className="font-bold text-ev-900 text-lg" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-sand-100 transition-colors"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export function ProduitActions({
  id_produit,
  nomProduit,
  marqueSlug,
  activiteSlug,
}: Props) {
  const [modal, setModal] = useState<Modal>(null);

  /*
   * RDV is only available when the product belongs to:
   *   - Marque:  Matar  (marqueSlug === "matar")
   *   - Activite: Irrigation  (activiteSlug contains "irrigation")
   *
   * The slug of the categorie returned by the backend is used as a
   * heuristic — it may contain "irrigation" in its slug.
   */
  const showRdv =
    marqueSlug === "matar" &&
    activiteSlug.toLowerCase().includes("irrigation");

  return (
    <>
      {/* ── CTA Buttons ─────────────────────────────────────────── */}
      <button
        onClick={() => setModal("devis")}
        className="btn-primary btn-lg flex-1 justify-center"
      >
        <FileText size={18} />
        Demander un devis
      </button>

      <button
        onClick={() => setModal("contact")}
        className="btn-outline btn-lg flex-1 justify-center"
      >
        <MessageCircle size={18} />
        Contacter un expert
      </button>

      {showRdv && (
        <a
          href="/rendez-vous"
          className={cn(
            "btn btn-lg flex-1 justify-center",
            "bg-sky-600 text-white hover:bg-sky-700"
          )}
        >
          <CalendarDays size={18} />
          Prendre RDV
        </a>
      )}

      {/* ── Devis modal ──────────────────────────────────────────── */}
      {modal === "devis" && (
        <ModalOverlay
          title="Demande de devis"
          onClose={() => setModal(null)}
        >
          {/* Pass id_produit — links DevisDemande.id_produit → Produit.id_produit */}
          <DevisForm
            id_produit={id_produit}
            nomProduit={nomProduit}
          />
        </ModalOverlay>
      )}

      {/* ── Contact modal ────────────────────────────────────────── */}
      {modal === "contact" && (
        <ModalOverlay
          title="Contacter un expert"
          onClose={() => setModal(null)}
        >
          {/* Pre-fill sujet with product name */}
          <ContactForm defaultSujet={`Question sur : ${nomProduit}`} />
        </ModalOverlay>
      )}
    </>
  );
}
