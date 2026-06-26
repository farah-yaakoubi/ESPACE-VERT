"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, CheckCircle2 } from "lucide-react";
import { devisService } from "@/services";
import { getVisitorToken } from "@/components/VisiteurTracker";
import { cn } from "@/lib/utils";

const schema = z.object({
  nom:       z.string().min(2, "Nom requis"),
  email:     z.string().email("E-mail invalide"),
  telephone: z.string().max(30).optional(),
  message:   z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

const NEED_OPTIONS = [
  "Irrigation",
  "Semences et plants",
  "Fertilisation",
  "Pulvérisation",
  "Machinisme",
  "Jardinage",
  "Installation",
  "Achat en quantité",
  "Autre besoin",
];

interface DevisFormProps {
  id_produit?: number;
  nomProduit?: string;
}

export function DevisForm({ id_produit, nomProduit }: DevisFormProps) {
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNeed, setSelectedNeed] = useState(NEED_OPTIONS[0]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    const messageParts = [
      selectedNeed ? `Type de besoin : ${selectedNeed}` : null,
      values.message?.trim() ? `Précisions : ${values.message.trim()}` : null,
    ].filter(Boolean);
    const res = await devisService.create({
      nom:             values.nom.trim(),
      email:           values.email.trim().toLowerCase(),
      telephone:       values.telephone?.trim() || undefined,
      message:         messageParts.length > 0 ? messageParts.join("\n\n").slice(0, 2000) : undefined,
      id_produit,
      token_visiteur:  getVisitorToken(),   // ← lie la demande au visiteur connu
    });
    if (res.success) { setSent(true); setSelectedNeed(""); reset(); }
    else setError(res.error ?? "Une erreur s'est produite.");
  };

  if (sent) return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="w-14 h-14 rounded-full bg-ev-100 flex items-center justify-center">
        <CheckCircle2 size={28} className="text-ev-600" />
      </div>
      <h3 className="font-semibold text-ev-900 text-lg">Demande envoyée !</h3>
      <p className="text-gray-500 text-sm">Nous vous contacterons rapidement avec votre devis.</p>
      <button onClick={() => setSent(false)} className="btn-ghost btn-sm mt-2">Nouvelle demande</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {nomProduit && (
        <div className="flex items-center gap-3 px-4 py-3 bg-ev-50 border border-ev-100 rounded-xl text-sm">
          <FileText size={16} className="text-ev-600 shrink-0" />
          <span className="text-ev-800">Demande pour : <strong>{nomProduit}</strong></span>
        </div>
      )}
      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="field-label" htmlFor="dv-nom">Nom complet *</label>
          <input id="dv-nom" {...register("nom")} placeholder="Votre nom"
            className={cn("field", errors.nom && "field-error")} />
          {errors.nom && <p className="field-hint">{errors.nom.message}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="dv-email">E-mail *</label>
          <input id="dv-email" type="email" {...register("email")} placeholder="vous@exemple.com"
            className={cn("field", errors.email && "field-error")} />
          {errors.email && <p className="field-hint">{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="dv-tel">Téléphone</label>
        <input id="dv-tel" type="tel" {...register("telephone")} placeholder="+216 XX XXX XXX" className="field" />
      </div>
      <div>
        <label className="field-label" htmlFor="dv-need-options">Type de besoin</label>
        <select
          id="dv-need-options"
          value={selectedNeed}
          onChange={(event) => setSelectedNeed(event.currentTarget.value)}
          className="field"
        >
          {NEED_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <label className="field-label mt-3" htmlFor="dv-message">Précisions</label>
        <textarea id="dv-message" rows={4} {...register("message")}
          placeholder="Quantité, modèle, usage spécifique…" className="field resize-none" />
      </div>
      <button type="submit" disabled={isSubmitting} className={cn("btn-primary btn-lg w-full", isSubmitting && "btn-loading")}>
        {!isSubmitting && <FileText size={16} />}
        {isSubmitting ? "Envoi en cours…" : "Envoyer ma demande de devis"}
      </button>
    </form>
  );
}
