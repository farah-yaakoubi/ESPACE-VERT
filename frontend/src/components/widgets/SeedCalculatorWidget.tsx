"use client";

import { detectPlant } from "@/lib/plant-detection";
import {
  Calculator,
  CalendarDays,
  Download,
  Info,
  LandPlot,
  Leaf,
  Sprout,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const EV = {
  forest: "#0a5c2e",
  leaf: "#7dc040",
  bg: "#f2faf0",
  border: "#c0ebb1",
};

interface SeedData {
  name: string;
  icon: string;
  g_m2: number;
  rangs: number;
  plants: number;
  germ: number;
  prof: [number, number];
  kgRatio: number;
  spacing: string;
}

const DB: Record<string, SeedData> = {
  gazon: {
    name: "Gazon",
    icon: "🌱",
    g_m2: 35,
    rangs: 20,
    plants: 5,
    germ: 85,
    prof: [0.5, 1],
    kgRatio: 500000,
    spacing: "semis à la volée",
  },
  fleurs: {
    name: "Semences florales",
    icon: "🌸",
    g_m2: 2,
    rangs: 30,
    plants: 20,
    germ: 75,
    prof: [0.5, 1.5],
    kgRatio: 600000,
    spacing: "20–30 cm",
  },
  tournesol: {
    name: "Tournesol",
    icon: "🌻",
    g_m2: 4,
    rangs: 70,
    plants: 25,
    germ: 88,
    prof: [2, 4],
    kgRatio: 15000,
    spacing: "70×25 cm",
  },
  basilic: {
    name: "Basilic",
    icon: "🌿",
    g_m2: 3,
    rangs: 30,
    plants: 25,
    germ: 78,
    prof: [0.5, 1],
    kgRatio: 600000,
    spacing: "30×25 cm",
  },
  persil: {
    name: "Persil",
    icon: "🌿",
    g_m2: 8,
    rangs: 25,
    plants: 10,
    germ: 70,
    prof: [1, 1.5],
    kgRatio: 650000,
    spacing: "25×10 cm",
  },
  coriandre: {
    name: "Coriandre",
    icon: "🌿",
    g_m2: 12,
    rangs: 25,
    plants: 8,
    germ: 80,
    prof: [1, 2],
    kgRatio: 90000,
    spacing: "25×8 cm",
  },
  tomate: {
    name: "Tomate",
    icon: "🍅",
    g_m2: 3,
    rangs: 60,
    plants: 50,
    germ: 85,
    prof: [0.5, 1],
    kgRatio: 250000,
    spacing: "60×50 cm",
  },
  poivron: {
    name: "Poivron",
    icon: "🫑",
    g_m2: 4,
    rangs: 60,
    plants: 40,
    germ: 80,
    prof: [0.5, 1],
    kgRatio: 160000,
    spacing: "60×40 cm",
  },
  piment: {
    name: "Piment",
    icon: "🌶️",
    g_m2: 5,
    rangs: 50,
    plants: 40,
    germ: 78,
    prof: [0.5, 1],
    kgRatio: 180000,
    spacing: "50×40 cm",
  },
  concombre: {
    name: "Concombre",
    icon: "🥒",
    g_m2: 1.5,
    rangs: 120,
    plants: 50,
    germ: 90,
    prof: [1, 2],
    kgRatio: 120000,
    spacing: "120×50 cm",
  },
  courgette: {
    name: "Courgette",
    icon: "🥬",
    g_m2: 1,
    rangs: 100,
    plants: 80,
    germ: 92,
    prof: [2, 3],
    kgRatio: 30000,
    spacing: "100×80 cm",
  },
  pasteque: {
    name: "Pastèque",
    icon: "🍉",
    g_m2: 0.5,
    rangs: 200,
    plants: 100,
    germ: 88,
    prof: [2, 3],
    kgRatio: 35000,
    spacing: "200×100 cm",
  },
  melon: {
    name: "Melon",
    icon: "🍈",
    g_m2: 0.8,
    rangs: 150,
    plants: 80,
    germ: 85,
    prof: [1.5, 2.5],
    kgRatio: 40000,
    spacing: "150×80 cm",
  },
  laitue: {
    name: "Laitue",
    icon: "🥬",
    g_m2: 15,
    rangs: 30,
    plants: 25,
    germ: 82,
    prof: [0.5, 1],
    kgRatio: 900000,
    spacing: "30×25 cm",
  },
  carotte: {
    name: "Carotte",
    icon: "🥕",
    g_m2: 50,
    rangs: 25,
    plants: 8,
    germ: 75,
    prof: [1, 2],
    kgRatio: 700000,
    spacing: "25×8 cm",
  },
  oignon: {
    name: "Oignon",
    icon: "🧅",
    g_m2: 25,
    rangs: 30,
    plants: 15,
    germ: 78,
    prof: [1, 1.5],
    kgRatio: 250000,
    spacing: "30×15 cm",
  },
  haricot: {
    name: "Haricot",
    icon: "🫘",
    g_m2: 8,
    rangs: 50,
    plants: 15,
    germ: 88,
    prof: [2, 4],
    kgRatio: 2500,
    spacing: "50×15 cm",
  },
  pois: {
    name: "Pois",
    icon: "🟢",
    g_m2: 20,
    rangs: 40,
    plants: 8,
    germ: 90,
    prof: [3, 5],
    kgRatio: 5000,
    spacing: "40×8 cm",
  },
  courge: {
    name: "Courge",
    icon: "🎃",
    g_m2: 0.8,
    rangs: 150,
    plants: 100,
    germ: 90,
    prof: [2, 3],
    kgRatio: 20000,
    spacing: "150×100 cm",
  },
  betterave: {
    name: "Betterave",
    icon: "🥬",
    g_m2: 6,
    rangs: 30,
    plants: 15,
    germ: 82,
    prof: [1, 2],
    kgRatio: 120000,
    spacing: "30×10 cm",
  },
  blette: {
    name: "Blette",
    icon: "🥬",
    g_m2: 10,
    rangs: 30,
    plants: 20,
    germ: 80,
    prof: [1, 2],
    kgRatio: 250000,
    spacing: "30×10 cm",
  },
  celeri: {
    name: "Celeri",
    icon: "🌿",
    g_m2: 1.5,
    rangs: 40,
    plants: 25,
    germ: 75,
    prof: [0.5, 1],
    kgRatio: 2200000,
    spacing: "40×25 cm",
  },
  radis: {
    name: "Radis",
    icon: "🥬",
    g_m2: 25,
    rangs: 15,
    plants: 5,
    germ: 85,
    prof: [1, 2],
    kgRatio: 90000,
    spacing: "15×5 cm",
  },
  navet: {
    name: "Navet",
    icon: "🥬",
    g_m2: 8,
    rangs: 25,
    plants: 10,
    germ: 82,
    prof: [1, 2],
    kgRatio: 350000,
    spacing: "25×10 cm",
  },
  ail: {
    name: "Ail",
    icon: "🧄",
    g_m2: 80,
    rangs: 25,
    plants: 12,
    germ: 85,
    prof: [3, 5],
    kgRatio: 350,
    spacing: "25×12 cm",
  },
  epinard: {
    name: "Epinard",
    icon: "🥬",
    g_m2: 18,
    rangs: 25,
    plants: 8,
    germ: 80,
    prof: [1, 2],
    kgRatio: 90000,
    spacing: "25×8 cm",
  },
  brocoli: {
    name: "Brocoli",
    icon: "🥦",
    g_m2: 2,
    rangs: 60,
    plants: 45,
    germ: 80,
    prof: [0.5, 1],
    kgRatio: 300000,
    spacing: "60×45 cm",
  },
  chou: {
    name: "Chou",
    icon: "🥬",
    g_m2: 2,
    rangs: 60,
    plants: 45,
    germ: 80,
    prof: [0.5, 1],
    kgRatio: 300000,
    spacing: "60×45 cm",
  },
  poireau: {
    name: "Poireau",
    icon: "🌱",
    g_m2: 6,
    rangs: 30,
    plants: 12,
    germ: 75,
    prof: [1, 2],
    kgRatio: 400000,
    spacing: "30×12 cm",
  },
};

const SOL_MOD: Record<string, number> = {
  Sableux: 0.9,
  Argileux: 1.1,
  Limoneux: 1.0,
  Siliceux: 0.95,
  Calcaire: 1.05,
  Humifère: 1.0,
  Irrigué: 1.0,
  "Sec / aride": 1.15,
};
const MODE_MOD: Record<string, number> = {
  "Culture maraîchère": 1.0,
  "Culture standard": 1.0,
  "Culture hybride": 0.9,
  "Culture potagère": 0.75,
  "Plein champ": 1.0,
  "Sous serre": 0.85,
  Pépinière: 0.7,
  "Godet / plateau": 0.65,
};
const MOIS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export { detectPlant };

export interface SeedCalculatorWidgetProps {
  triggerIcon?: string;
  defaultPlant?: string;
  defaultSurface?: number;
  defaultUnit?: "m2" | "ha";
  defaultMode?: string;
  defaultDensity?: number;
  defaultSowingMonth?: number;
  productName?: string;
  sowingCalendar?: string | null;
  harvestCalendar?: string | null;
  /** Mode inline : s'intègre dans la page, pas de bouton flottant ni de modale */
  inline?: boolean;
}

function monthsFromCalendar(value?: string | null) {
  if (!value || value === "000000000000") return "";
  return value
    .padEnd(12, "0")
    .slice(0, 12)
    .split("")
    .map((flag, index) => (flag === "1" ? MOIS[index] : null))
    .filter(Boolean)
    .join(", ");
}

/* ── Contenu du calculateur (partagé inline + modale) ───────────── */
function CalculatorBody({
  defaultPlant,
  defaultSurface,
  defaultUnit,
  defaultMode,
  defaultSowingMonth,
  defaultDensity,
  productName,
  sowingCalendar,
  harvestCalendar,
  onClose,
}: SeedCalculatorWidgetProps & { onClose?: () => void }) {
  const [plante, setPlante] = useState(defaultPlant ?? "tomate");
  const [density, setDensity] = useState<number | "">(
    defaultDensity ?? (defaultPlant ? (DB[defaultPlant]?.g_m2 ?? "") : DB.tomate.g_m2),
  );
  const [surface, setSurface] = useState(defaultSurface ?? 1000);
  const [unite, setUnite] = useState<"m2" | "ha">(defaultUnit ?? "m2");
  const [mois, setMois] = useState(
    defaultSowingMonth === undefined ? "" : (MOIS[defaultSowingMonth] ?? ""),
  );
  const [sol, setSol] = useState("");
  const [mode, setMode] = useState(defaultMode ?? "Culture standard");
  const [marge, setMarge] = useState(15);
  const [result, setResult] = useState<null | {
    graines: number;
    kg: number;
    plants: number;
    rangs: number;
    ecart: string;
    prof: string;
  }>(null);

  useEffect(() => {
    if (defaultPlant) setPlante(defaultPlant);
  }, [defaultPlant]);
  useEffect(() => {
    if (defaultDensity !== undefined) setDensity(defaultDensity);
  }, [defaultDensity]);
  useEffect(() => {
    if (defaultSurface) setSurface(defaultSurface);
  }, [defaultSurface]);
  useEffect(() => {
    if (defaultUnit) setUnite(defaultUnit);
  }, [defaultUnit]);
  useEffect(() => {
    if (defaultMode) setMode(defaultMode);
  }, [defaultMode]);
  useEffect(() => {
    if (defaultSowingMonth !== undefined)
      setMois(MOIS[defaultSowingMonth] ?? "");
  }, [defaultSowingMonth]);

  const p = DB[plante];
  const isProductBound = Boolean(productName);
  const unsupportedPlant = Boolean(isProductBound && !p);
  const m2 = unite === "ha" ? surface * 10000 : surface;

  function calc() {
    if (!p) return;
    const fs = SOL_MOD[sol] ?? 1;
    const fm = MODE_MOD[mode] ?? 1;
    const baseDensity =
      typeof density === "number" && density > 0 ? density : p.g_m2;
    const densityFinal = baseDensity * fs * fm;
    const factor = (1 + marge / 100) / (p.germ / 100);
    const graines = Math.ceil(m2 * densityFinal * factor);
    const kg = graines / p.kgRatio;
    const side = Math.sqrt(m2) * 100;
    const rangs = Math.ceil(side / p.rangs);
    const plants = rangs * Math.ceil(side / p.plants);
    setResult({
      graines,
      kg,
      plants,
      rangs,
      ecart: `${p.rangs}×${p.plants} cm`,
      prof: `${p.prof[0]}–${p.prof[1]} cm`,
    });
  }

  function downloadResult() {
    if (!result || !p) return;
    const lines = [
      "Résultat calculateur de semences",
      `Produit: ${productName ?? p.name}`,
      `Culture: ${p.name}`,
      `Surface: ${m2.toLocaleString("fr-FR")} m²`,
      `Mode de culture: ${mode}`,
      mois ? `Mois de semis choisi: ${mois}` : null,
      sol ? `Sol: ${sol}` : null,
      `Graines estimées: ${result.graines.toLocaleString("fr-FR")}`,
      `Poids estimé: ${result.kg < 0.1 ? `${(result.kg * 1000).toFixed(0)} g` : `${result.kg.toFixed(2)} kg`}`,
      `Plants: ${result.plants.toLocaleString("fr-FR")}`,
      `Rangs: ${result.rangs.toLocaleString("fr-FR")}`,
      `Écartement: ${result.ecart}`,
      `Profondeur: ${result.prof}`,
      monthsFromCalendar(sowingCalendar)
        ? `Calendrier semis catalogue: ${monthsFromCalendar(sowingCalendar)}`
        : null,
      monthsFromCalendar(harvestCalendar)
        ? `Calendrier récolte catalogue: ${monthsFromCalendar(harvestCalendar)}`
        : null,
      `Marge sécurité: ${marge}%`,
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calcul-semences-${(productName ?? p.name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 rounded-t-3xl"
        style={{ background: `linear-gradient(135deg, ${EV.forest}, #1a7040)` }}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
            <Calculator size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">
              Calculateur de semences
            </h2>
            <p className="text-white/70 text-xs mt-0.5">
              {p
                ? `${p.icon} ${p.name} · Densité ${p.g_m2} g/m² · Germination ${p.germ}%`
                : "Espèce non reconnue dans le calculateur"}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: EV.forest }}
            >
              <Leaf size={10} /> Plante
            </label>
            {isProductBound ? (
              <div
                className="w-full rounded-xl border px-3 py-2.5 text-sm"
                style={{ borderColor: EV.border }}
              >
                <span className="font-bold">
                  {p ? `${p.icon} ${p.name}` : (productName ?? "Espèce non reconnue")}
                </span>
                <div className="text-xs text-gray-500">
                  {p
                    ? "(déterminée par la recommandation)"
                    : "Aucune règle de calcul disponible pour cette espèce"}
                </div>
              </div>
            ) : (
              <select
                value={plante}
                onChange={(e) => {
                  setPlante(e.target.value);
                  setResult(null);
                }}
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2"
                style={{ borderColor: EV.border }}
              >
                {Object.entries(DB).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.icon} {v.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label
              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: EV.forest }}
            >
              <LandPlot size={10} /> Surface
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={surface}
                onChange={(e) => {
                  setSurface(Number(e.target.value) || 0);
                  setResult(null);
                }}
                className="flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: EV.border }}
              />
              <select
                value={unite}
                onChange={(e) => {
                  setUnite(e.target.value as "m2" | "ha");
                  setResult(null);
                }}
                className="rounded-xl border px-2 py-2.5 text-sm outline-none"
                style={{ borderColor: EV.border }}
              >
                <option value="m2">m²</option>
                <option value="ha">ha</option>
              </select>
            </div>
          </div>

          <div>
            <label
              className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: EV.forest }}
            >
              Densité (graines / m²)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={density === "" ? "" : density}
              onChange={(e) => {
                setDensity(e.target.value === "" ? "" : Number(e.target.value));
                setResult(null);
              }}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: EV.border }}
            />
            <p className="text-xs text-gray-400 mt-1">
              Si renseigné, cette densité remplace la valeur catalogue pour le
              calcul.
            </p>
          </div>

          <div>
            <label
              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: EV.forest }}
            >
              <Sprout size={10} /> Mode de culture
            </label>
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                setResult(null);
              }}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: EV.border }}
            >
              {[
                "Culture maraîchère",
                "Culture standard",
                "Culture hybride",
                "Culture potagère",
              ].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
              <CalendarDays size={10} /> Mois de semis
            </label>
            <select
              value={mois}
              onChange={(e) => setMois(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: EV.border }}
            >
              <option value="">— Optionnel —</option>
              {MOIS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
              Sol
            </label>
            <select
              value={sol}
              onChange={(e) => {
                setSol(e.target.value);
                setResult(null);
              }}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: EV.border }}
            >
              <option value="">— Optionnel —</option>
              {Object.keys(SOL_MOD).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-400">
              Marge sécurité :{" "}
              <span style={{ color: EV.forest }}>{marge}%</span>
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={marge}
              onChange={(e) => {
                setMarge(Number(e.target.value));
                setResult(null);
              }}
              className="w-full mt-2"
              style={{ accentColor: EV.leaf }}
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>5%</span>
              <span>30%</span>
            </div>
          </div>
        </div>

        <div
          className="flex items-start gap-2 rounded-xl px-4 py-3"
          style={{ background: EV.bg, border: `1px solid ${EV.border}` }}
        >
          <Info
            size={13}
            className="mt-0.5 shrink-0"
            style={{ color: EV.forest }}
          />
          {p ? (
            <p className="text-[11px] text-gray-600 leading-relaxed">
              <span className="font-bold">
                {p.icon} {p.name}
              </span>{" "}
              — densité {p.g_m2} g/m², germination {p.germ}%, écartement{" "}
              {p.spacing}, prof. {p.prof[0]}–{p.prof[1]} cm.
              {sol && ` Sol "${sol}" : ×${SOL_MOD[sol]}.`}
              {` Mode "${mode}" : ×${MODE_MOD[mode] ?? 1}.`}
            </p>
          ) : (
            <p className="text-[11px] text-red-700 leading-relaxed">
              Le calculateur ne calcule pas ce produit tant que son espèce n'est pas
              ajoutée aux paramètres agronomiques.
            </p>
          )}
        </div>

        {(monthsFromCalendar(sowingCalendar) ||
          monthsFromCalendar(harvestCalendar)) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {monthsFromCalendar(sowingCalendar) && (
              <div
                className="rounded-xl px-4 py-3 text-[11px] text-green-800"
                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
              >
                <span className="font-black">Semis catalogue</span>
                <br />
                {monthsFromCalendar(sowingCalendar)}
              </div>
            )}
            {monthsFromCalendar(harvestCalendar) && (
              <div
                className="rounded-xl px-4 py-3 text-[11px] text-red-800"
                style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
              >
                <span className="font-black">Récolte catalogue</span>
                <br />
                {monthsFromCalendar(harvestCalendar)}
              </div>
            )}
          </div>
        )}

        <button
          onClick={calc}
          disabled={!surface || unsupportedPlant}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white shadow-md disabled:opacity-50 transition-transform active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${EV.leaf}, ${EV.forest})`,
          }}
        >
          <Calculator size={16} /> Calculer mes besoins en semences
        </button>

        {result && p && (
          <div className="space-y-4 pt-2">
            <div
              className="rounded-2xl p-5 text-center"
              style={{
                background: `linear-gradient(135deg, ${EV.bg}, #ddf0d0)`,
                border: `1.5px solid ${EV.border}`,
              }}
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Pour {m2.toLocaleString("fr-FR")} m² · {p.icon} {p.name}
                {mode !== "Plein champ" && <> · {mode}</>}
              </p>
              <p
                className="text-5xl font-black leading-none"
                style={{ color: EV.forest }}
              >
                {result.graines.toLocaleString("fr-FR")}
              </p>
              <p className="text-base font-semibold text-gray-600 mt-1">
                graines
              </p>
              <span
                className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold"
                style={{ background: `${EV.forest}15`, color: EV.forest }}
              >
                ≈&nbsp;
                {result.kg < 0.1
                  ? `${(result.kg * 1000).toFixed(0)} g`
                  : result.kg < 1
                    ? `${result.kg.toFixed(2)} kg`
                    : `${result.kg.toFixed(1)} kg`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                {
                  l: "Plants",
                  v: result.plants.toLocaleString("fr-FR"),
                  c: "#1d4ed8",
                  bg: "#eff6ff",
                  bd: "#bfdbfe",
                },
                {
                  l: "Rangs",
                  v: result.rangs.toLocaleString("fr-FR"),
                  c: "#7c3aed",
                  bg: "#f5f3ff",
                  bd: "#ddd6fe",
                },
                {
                  l: "Écartement",
                  v: result.ecart,
                  c: "#0369a1",
                  bg: "#f0f9ff",
                  bd: "#bae6fd",
                },
                {
                  l: "Profondeur",
                  v: result.prof,
                  c: "#92400e",
                  bg: "#fffbeb",
                  bd: "#fde68a",
                },
              ].map(({ l, v, c, bg, bd }) => (
                <div
                  key={l}
                  className="rounded-xl p-3 text-center"
                  style={{ background: bg, border: `1px solid ${bd}` }}
                >
                  <p
                    className="text-[9px] font-bold uppercase tracking-wider mb-1"
                    style={{ color: c }}
                  >
                    {l}
                  </p>
                  <p className="text-sm font-black" style={{ color: c }}>
                    {v}
                  </p>
                </div>
              ))}
            </div>

            {mois && (
              <p
                className="text-[11px] rounded-xl px-4 py-2.5 text-gray-700"
                style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
              >
                📅 <span className="font-bold">Semis en {mois}</span> — vérifiez
                la compatibilité climatique de votre région.
              </p>
            )}

            <p className="text-[10px] text-center text-gray-400">
              Marge sécurité {marge}% incluse · Valeurs indicatives · Consultez
              les recommandations du fabricant
            </p>
            <button
              onClick={downloadResult}
              className="w-full flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-black transition-colors hover:bg-green-50"
              style={{ borderColor: EV.border, color: EV.forest }}
            >
              <Download size={14} /> Télécharger ce résultat
            </button>
          </div>
        )}
      </div>

      <div
        className="border-t px-6 py-4 bg-gray-50 rounded-b-3xl"
        style={{ borderColor: EV.border }}
      >
        <p className="text-xs text-center text-gray-400">
          Les calculs sont estimatifs. Pour des résultats précis, consultez les
          recommandations du fabricant.
        </p>
      </div>
    </>
  );
}

export default function SeedCalculatorWidget(props: SeedCalculatorWidgetProps) {
  const { defaultPlant, inline = false } = props;
  const [isOpen, setIsOpen] = useState(false);

  /* ── Mode inline : rendu direct dans la page ─────────────────── */
  if (inline) {
    return (
      <div
        className="rounded-3xl overflow-hidden bg-white w-full"
        style={{
          border: `1.5px solid ${EV.border}`,
          boxShadow: "0 4px 24px rgba(10,92,46,0.08)",
        }}
      >
        <CalculatorBody {...props} defaultPlant={defaultPlant} />
      </div>
    );
  }

  /* ── Mode flottant (hors page produit) ───────────────────────── */
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${EV.leaf}, ${EV.forest})`,
        }}
        aria-label="Calculateur de semences"
        title="Calculateur de semences"
      >
        <Sprout size={28} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
          <div
            className="pointer-events-auto bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
            style={{ border: `1.5px solid ${EV.border}` }}
          >
            <CalculatorBody
              {...props}
              defaultPlant={defaultPlant}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
