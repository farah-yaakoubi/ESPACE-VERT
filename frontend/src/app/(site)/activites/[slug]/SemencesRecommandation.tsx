"use client";

/**
 * SemencesRecommandation
 * ─────────────────────────────────────────────────────────────────────────
 * Widget IA affiché uniquement sur la page activité "semences".
 * L'utilisateur indique ce qu'il veut cultiver + conditions de semis ;
 * l'IA croise les données agronomiques (OpenFarm) avec le catalogue DB
 * et retourne les produits les plus adaptés.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles, Loader2, ChevronRight, Sprout, RotateCcw, AlertCircle,
  SunMedium, CloudSun, CloudRain, Wind, Warehouse, CalendarDays, LandPlot,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/* ── Types ───────────────────────────────────────────────────────────────── */
interface Recommendation {
  id_produit: number;
  nom:        string;
  slug:       string;
  raison:     string;
  categorie:  string;
  images:     { url: string; alt: string | null }[];
}

interface ApiResponse {
  recommendations: Recommendation[];
  message?: string | null;
}

interface SemencesRecommandationProps {
  variant?: "section" | "panel";
  title?: string;
  subtitle?: string;
}

/* ── Listes de choix ─────────────────────────────────────────────────────── */
const MOIS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

const SOLS = [
  "Sableux", "Argileux", "Limoneux", "Siliceux",
  "Calcaire", "Humifère / fertile", "Irrigué", "Sec / aride",
];

const CLIMATS = [
  { label: "Chaud et sec", icon: SunMedium, desc: "Fort ensoleillement, faible humidité" },
  { label: "Tempéré", icon: CloudSun, desc: "Conditions équilibrées et stables" },
  { label: "Humide", icon: CloudRain, desc: "Humidité élevée ou pluies fréquentes" },
  { label: "Venteux", icon: Wind, desc: "Parcelles exposées aux vents" },
  { label: "Sous serre", icon: Warehouse, desc: "Environnement protégé et maîtrisé" },
];

const SUGGESTIONS = [
  "Tomate", "Poivron", "Concombre", "Courgette", "Laitue",
  "Carotte", "Piment", "Pastèque", "Melon", "Oignon", "Haricot",
];

/* ══════════════════════════════════════════════════════════════════════════ */
export function SemencesRecommandation({
  variant = "section",
  title = "Trouvez vos semences idéales",
  subtitle = "Dites-nous ce que vous souhaitez cultiver — notre assistant agronomique sélectionne les semences adaptées depuis notre catalogue.",
}: SemencesRecommandationProps) {
  const [culture, setCulture]       = useState("");
  const [mois, setMois]             = useState("");
  const [sol, setSol]               = useState("");
  const [climat, setClimat]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [results, setResults]       = useState<Recommendation[] | null>(null);
  const [message, setMessage]       = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [showForm, setShowForm]     = useState(true);

  /* ── Submit ──────────────────────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!culture.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/ai/recommend-semences`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          culture: culture.trim(),
          mois:    mois || undefined,
          sol:     sol || undefined,
          climat:  climat || undefined,
        }),
      });

      if (!res.ok) throw new Error("Service indisponible, veuillez réessayer.");

      const data: ApiResponse = await res.json();
      setResults(data.recommendations ?? []);
      setMessage(data.message ?? null);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Reset ───────────────────────────────────────────────────────────── */
  function handleReset() {
    setCulture(""); setMois(""); setSol(""); setClimat("");
    setResults(null); setMessage(null); setError(null);
    setShowForm(true);
  }

  const isPanel = variant === "panel";
  const Wrapper = isPanel ? "div" : "section";

  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <Wrapper
      aria-label="Recommandations semences IA"
      style={{
        background: isPanel
          ? "transparent"
          : "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 40%, #f0fdf4 100%)",
        borderBottom: isPanel ? "none" : "1px solid #bbf7d0",
      }}
    >
      <div className={isPanel ? "py-1" : "container-ev py-10"}>

        {/* ── En-tête ───────────────────────────────────────────────── */}
        <div className={`flex items-start gap-4 ${isPanel ? "mb-5" : "mb-7"}`}>
          <div
            className="shrink-0 flex items-center justify-center w-11 h-11 rounded-2xl shadow-sm"
            style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
          >
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className={`${isPanel ? "text-base" : "text-lg"} font-bold text-gray-900`}>{title}</h2>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}
              >
                IA
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {!isPanel && (
          <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-3">
          {[
            { icon: CalendarDays, title: "Saison", text: "Tenez compte du mois de semis pour viser la meilleure fenêtre." },
            { icon: LandPlot, title: "Sol", text: "Affinez la recommandation selon la nature de votre parcelle." },
            { icon: CloudSun, title: "Climat", text: "Ajoutez les conditions climatiques pour une sélection plus précise." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-green-100 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">{text}</p>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* ── Formulaire ────────────────────────────────────────────── */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Culture */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Que voulez-vous cultiver ? *
              </label>
              <input
                type="text"
                value={culture}
                onChange={e => setCulture(e.target.value)}
                placeholder="Ex : Tomate, Poivron, Laitue, Pastèque…"
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm
                  text-gray-800 placeholder:text-gray-400 shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent
                  transition-all"
              />
              {/* Suggestions rapides */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s} type="button"
                    onClick={() => setCulture(s)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={culture === s
                      ? { background: "#15803d", color: "#fff" }
                      : { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Mois + Sol */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Mois de semis <span className="font-normal text-gray-400">(optionnel)</span>
                </label>
                <select
                  value={mois}
                  onChange={e => setMois(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm
                    text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400
                    focus:border-transparent transition-all"
                >
                  <option value="">— Sélectionner —</option>
                  {MOIS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Type de sol <span className="font-normal text-gray-400">(optionnel)</span>
                </label>
                <select
                  value={sol}
                  onChange={e => setSol(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm
                    text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400
                    focus:border-transparent transition-all"
                >
                  <option value="">— Sélectionner —</option>
                  {SOLS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Climat / exposition <span className="font-normal text-gray-400">(optionnel)</span>
              </label>
              <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${isPanel ? "xl:grid-cols-1" : "xl:grid-cols-5"}`}>
                {CLIMATS.map(({ label, icon: Icon, desc }) => {
                  const active = climat === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setClimat(current => current === label ? "" : label)}
                      className="rounded-2xl border px-4 py-4 text-left transition-all duration-200"
                      style={active
                        ? {
                            background: "linear-gradient(135deg, #16a34a, #15803d)",
                            borderColor: "#15803d",
                            color: "#fff",
                            boxShadow: "0 14px 30px rgba(21,128,61,0.18)",
                          }
                        : {
                            background: "#fff",
                            borderColor: "#d1fae5",
                            color: "#1f2937",
                          }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={active
                            ? { background: "rgba(255,255,255,0.14)", color: "#fff" }
                            : { background: "#f0fdf4", color: "#15803d" }}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-snug">{label}</p>
                          <p className="mt-1 text-xs leading-5" style={{ color: active ? "rgba(255,255,255,0.82)" : "#6b7280" }}>
                            {desc}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {(culture || mois || sol || climat) && (
              <div className="rounded-2xl border border-green-100 bg-white/80 px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green-700 mb-3">
                  Résumé de votre demande
                </p>
                <div className="flex flex-wrap gap-2">
                  {culture && <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800 border border-green-100">Culture : {culture}</span>}
                  {mois && <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800 border border-green-100">Mois : {mois}</span>}
                  {sol && <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800 border border-green-100">Sol : {sol}</span>}
                  {climat && <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800 border border-green-100">Climat : {climat}</span>}
                </div>
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading || !culture.trim()}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm
                text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-400
                disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin"/> Analyse en cours…</>
                : <><Sparkles size={16}/> Obtenir mes recommandations</>
              }
            </button>
          </form>
        )}

        {/* ── Erreur ─────────────────────────────────────────────────── */}
        {error && (
          <div className="mt-5 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={handleReset} className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
              <RotateCcw size={12}/> Réessayer
            </button>
          </div>
        )}

        {/* ── Résultats ──────────────────────────────────────────────── */}
        {results !== null && !showForm && (
          <div className="mt-2">

            {/* En-tête résultats */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sprout size={16} className="text-green-600" />
                <p className="text-sm font-semibold text-gray-800">
                  {results.length > 0
                    ? <>Recommandations pour <span className="text-green-700">{culture}</span>{mois ? ` — ${mois}` : ""}{climat ? ` — ${climat}` : ""}</>
                    : "Aucun produit trouvé dans le catalogue"
                  }
                </p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-700 transition-colors"
              >
                <RotateCcw size={12}/> Nouvelle recherche
              </button>
            </div>

            {/* Message IA si aucun résultat */}
            {message && results.length === 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-600 shadow-sm">
                {message}
              </div>
            )}

            {/* Grille de produits recommandés */}
            {results.length > 0 && (
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isPanel ? "" : "lg:grid-cols-3 xl:grid-cols-4"}`}>
                {results.map((rec, idx) => {
                  const img = rec.images?.[0];
                  return (
                    <Link
                      key={rec.id_produit}
                      href={`/produits/${rec.slug}`}
                      className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm
                        hover:shadow-md hover:border-green-300 transition-all duration-200 overflow-hidden"
                    >
                      {/* Badge rang */}
                      <div className="relative">
                        <div
                          className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50"
                          style={{ aspectRatio: "4/3" }}
                        >
                          {img ? (
                            <Image
                              src={img.url}
                              alt={img.alt ?? rec.nom}
                              fill
                              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Sprout size={40} className="text-green-300" />
                            </div>
                          )}
                        </div>
                        {/* Badge numéro */}
                        <div
                          className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center
                            rounded-full text-[11px] font-bold text-white shadow-sm"
                          style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
                        >
                          {idx + 1}
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="flex flex-col flex-1 p-4">
                        {rec.categorie && (
                          <p className="text-[10px] font-semibold text-green-700 uppercase tracking-wide mb-1">
                            {rec.categorie}
                          </p>
                        )}
                        <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug group-hover:text-green-700 transition-colors">
                          {rec.nom}
                        </h3>

                        {/* Raison IA */}
                        <div
                          className="flex-1 rounded-xl px-3 py-2.5 mb-3"
                          style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
                        >
                          <div className="flex gap-1.5 items-start">
                            <Sparkles size={11} className="text-green-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-green-800 leading-relaxed">{rec.raison}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Voir le produit</span>
                          <ChevronRight size={14} className="text-gray-300 group-hover:text-green-600 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </Wrapper>
  );
}
