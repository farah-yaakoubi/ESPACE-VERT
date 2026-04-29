"use client";
import { useState } from "react";
import {
  FileText, MessageCircle, CalendarDays, X,
} from "lucide-react";
import { DevisForm }   from "@/components/forms/DevisForm";
import { ContactForm } from "@/components/forms/ContactForm";
import { cn }          from "@/lib/utils";

type Modal = "devis" | "contact" | null;

interface Props {
  id_produit:    number;
  nomProduit:    string;
  marqueSlug:    string;
  activiteSlug?: string | null;
  fichePdfUrl?:  string | null;
}

function ModalOverlay({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand-200 shrink-0">
          <h2
            className="font-bold text-ev-900 text-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-sand-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export function ProduitActions({ id_produit, nomProduit, marqueSlug, activiteSlug, fichePdfUrl }: Props) {
  const [modal, setModal] = useState<Modal>(null);

  const showRdv = marqueSlug === "matar" && (activiteSlug?.toLowerCase() ?? "").includes("irrigation");

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Bouton Devis */}
        <button
          onClick={() => setModal("devis")}
          className="btn-primary btn-lg flex-1 justify-center"
        >
          <FileText size={18} />Demander un devis
        </button>

        {/* Bouton Contact */}
        <button
          onClick={() => setModal("contact")}
          className="btn-outline btn-lg flex-1 justify-center"
        >
          <MessageCircle size={18} />Contacter un expert
        </button>

        {/* Lien direct téléchargement PDF — sans modal ni formulaire */}
        {fichePdfUrl && (
          <a
            href={fichePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className={cn(
              "btn btn-lg flex-1 justify-center",
              "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-semibold"
            )}
          >
            📄 Télécharger la fiche technique (PDF)
          </a>
        )}

        {/* Bouton RDV — uniquement Matar Irrigation */}
        {showRdv && (
          <a
            href="/rendez-vous"
            className={cn("btn btn-lg flex-1 justify-center", "bg-sky-600 text-white hover:bg-sky-700")}
          >
            <CalendarDays size={18} />Prendre RDV
          </a>
        )}
      </div>

      {modal === "devis" && (
        <ModalOverlay title="Demande de devis" onClose={() => setModal(null)}>
          <DevisForm id_produit={id_produit} nomProduit={nomProduit} />
        </ModalOverlay>
      )}
      {modal === "contact" && (
        <ModalOverlay title="Contacter un expert" onClose={() => setModal(null)}>
          <ContactForm defaultSujet={`Question sur : ${nomProduit}`} />
        </ModalOverlay>
      )}
    </>
  );
}