"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle2 } from "lucide-react";
import { contactService } from "@/services";
import { getVisitorToken } from "@/components/VisiteurTracker";
import { cn } from "@/lib/utils";

const schema = z.object({
  nom:     z.string().min(2, "Nom requis (2 car. min)"),
  email:   z.string().email("Adresse e-mail invalide"),
  sujet:   z.string().max(255).optional(),
  message: z.string().min(10, "Message requis (10 car. min)"),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm({ defaultSujet }: { defaultSujet?: string }) {
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { sujet: defaultSujet } });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    const res = await contactService.send({
      nom:             values.nom.trim(),
      email:           values.email.trim().toLowerCase(),
      sujet:           values.sujet?.trim() || undefined,
      message:         values.message.trim(),
      token_visiteur:  getVisitorToken(),   // ← lie le message au visiteur connu
    });
    if (res.success) { setSent(true); reset(); }
    else setError(res.error ?? "Une erreur s'est produite.");
  };

  if (sent) return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="w-14 h-14 rounded-full bg-ev-100 flex items-center justify-center">
        <CheckCircle2 size={28} className="text-ev-600" />
      </div>
      <h3 className="font-semibold text-ev-900 text-lg">Message envoyé !</h3>
      <p className="text-gray-500 text-sm">Nous vous répondrons dans les meilleurs délais.</p>
      <button onClick={() => setSent(false)} className="btn-ghost btn-sm mt-2">Envoyer un autre message</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="field-label" htmlFor="cf-nom">Nom complet *</label>
          <input id="cf-nom" {...register("nom")} placeholder="Votre nom"
            className={cn("field", errors.nom && "field-error")} />
          {errors.nom && <p className="field-hint">{errors.nom.message}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="cf-email">E-mail *</label>
          <input id="cf-email" type="email" {...register("email")} placeholder="vous@exemple.com"
            className={cn("field", errors.email && "field-error")} />
          {errors.email && <p className="field-hint">{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="cf-sujet">Sujet</label>
        <input id="cf-sujet" {...register("sujet")} placeholder="Objet de votre message" className="field" />
      </div>
      <div>
        <label className="field-label" htmlFor="cf-message">Message *</label>
        <textarea id="cf-message" rows={5} {...register("message")} placeholder="Décrivez votre demande…"
          className={cn("field resize-none", errors.message && "field-error")} />
        {errors.message && <p className="field-hint">{errors.message.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting}
        className={cn("btn-primary btn-lg w-full sm:w-auto", isSubmitting && "btn-loading")}>
        {!isSubmitting && <Send size={16} />}
        {isSubmitting ? "Envoi en cours…" : "Envoyer le message"}
      </button>
    </form>
  );
}
