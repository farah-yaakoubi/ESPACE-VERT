"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { rdvService } from "@/services";
import { getVisitorToken } from "@/components/VisiteurTracker";
import { cn } from "@/lib/utils";

const AGENCES = ["Tunis", "Soliman", "Borj Amri", "Sfax"];
const CRENEAUX_FALLBACK = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00",
];

const schema = z.object({
  nom:            z.string().min(2, "Nom requis"),
  email:          z.string().email("E-mail invalide"),
  telephone:      z.string().max(30).optional(),
  date_souhaitee: z.string().min(1, "Date requise"),
  heure:          z.string().optional(),
  objet:          z.string().max(255).optional(),
  agence:         z.string().optional(),
  message:        z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;
const todayStr = new Date().toISOString().split("T")[0];

export function RdvForm() {
  const [creneaux, setCreneaux] = useState<string[]>(CRENEAUX_FALLBACK);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    rdvService.creneaux()
      .then((data) => { if (Array.isArray(data) && data.length > 0) setCreneaux(data); })
      .catch(() => {});
  }, []);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    const res = await rdvService.book({
      nom:             values.nom.trim(),
      email:           values.email.trim().toLowerCase(),
      telephone:       values.telephone?.trim()  || undefined,
      date_souhaitee:  values.date_souhaitee,
      heure:           values.heure              || undefined,
      objet:           values.objet?.trim()      || undefined,
      agence:          values.agence             || undefined,
      message:         values.message?.trim()    || undefined,
      token_visiteur:  getVisitorToken(),         // ← lie le RDV au visiteur connu
    });
    if (res.success) { setSent(true); reset(); }
    else setError(res.error ?? "Une erreur s'est produite.");
  };

  if (sent) return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center">
        <CheckCircle2 size={28} className="text-sky-600" />
      </div>
      <h3 className="font-semibold text-ev-900 text-lg">Demande envoyée !</h3>
      <p className="text-gray-500 text-sm">Notre équipe vous confirmera le rendez-vous rapidement.</p>
      <button onClick={() => setSent(false)} className="btn-ghost btn-sm mt-2">Nouveau rendez-vous</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-3 px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl text-sm text-sky-800">
        <CalendarDays size={16} className="shrink-0 text-sky-500" />
        <span>Ce service est réservé aux solutions d&apos;irrigation <strong>Matar</strong>.</span>
      </div>
      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="field-label" htmlFor="rdv-nom">Nom complet *</label>
          <input id="rdv-nom" {...register("nom")} placeholder="Votre nom"
            className={cn("field", errors.nom && "field-error")} />
          {errors.nom && <p className="field-hint">{errors.nom.message}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="rdv-tel">Téléphone</label>
          <input id="rdv-tel" type="tel" {...register("telephone")} placeholder="+216 XX XXX XXX" className="field" />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="rdv-email">E-mail *</label>
        <input id="rdv-email" type="email" {...register("email")} placeholder="vous@exemple.com"
          className={cn("field", errors.email && "field-error")} />
        {errors.email && <p className="field-hint">{errors.email.message}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="field-label" htmlFor="rdv-date">Date souhaitée *</label>
          <input id="rdv-date" type="date" min={todayStr} {...register("date_souhaitee")}
            className={cn("field", errors.date_souhaitee && "field-error")} />
          {errors.date_souhaitee && <p className="field-hint">{errors.date_souhaitee.message}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="rdv-heure">Créneau horaire</label>
          <select id="rdv-heure" {...register("heure")} className="field">
            <option value="">— Sélectionner —</option>
            {creneaux.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="field-label" htmlFor="rdv-agence">Agence</label>
          <select id="rdv-agence" {...register("agence")} className="field">
            <option value="">— Choisir une agence —</option>
            {AGENCES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="rdv-objet">Objet du rendez-vous</label>
          <input id="rdv-objet" {...register("objet")} placeholder="Ex : installation, maintenance…" className="field" />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="rdv-msg">Informations complémentaires</label>
        <textarea id="rdv-msg" rows={3} {...register("message")}
          placeholder="Précisez votre situation ou vos besoins…" className="field resize-none" />
      </div>
      <button type="submit" disabled={isSubmitting}
        className={cn("btn btn-lg w-full bg-sky-700 text-white hover:bg-sky-800", isSubmitting && "btn-loading")}>
        {!isSubmitting && <CalendarDays size={16} />}
        {isSubmitting ? "Envoi en cours…" : "Confirmer la demande de rendez-vous"}
      </button>
    </form>
  );
}
