"use client";

import { SeedCalculatorWidget } from "@/components/widgets";
import { useI18n } from "@/i18n/I18nProvider";
import { detectPlant } from "@/lib/plant-detection";
import { detectPlantSemantic } from "@/lib/plant-detection-semantic";
import { getProductHref } from "@/lib/product-url";
import type { ProduitCard as ProduitCardType } from "@/types/api";
import type {
  ProduitSemence,
  RecommandationResult,
  VisiteurProfil,
} from "@/types/semences-recommandation";
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Circle,
  Cloud,
  CloudRain,
  Download,
  Droplets,
  FlaskConical,
  Globe,
  Layers,
  Leaf,
  Loader2,
  MapPin,
  Recycle,
  RefreshCw,
  Ruler,
  ScanLine,
  Shovel,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Target,
  Thermometer,
  Tractor,
  TreePine,
  TrendingUp,
  Trophy,
  Warehouse,
  Wheat,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ═══════════════════════════════════════════════════════════════════
   PALETTE
════════════════════════════════════════════════════════════════════ */
const EV = {
  forest: "#0a5c2e",
  mid: "#1a7040",
  leaf: "#7dc040",
  pale: "#f4fbee",
  pale2: "#e8f5dc",
  border: "#c8e0b4",
  text: "#1a2e1d",
};

/* ═══════════════════════════════════════════════════════════════════
   I18N — FR / AR / EN
════════════════════════════════════════════════════════════════════ */
type Lang = "fr" | "ar" | "en";

const T = {
  fr: {
    title: "Assistant Semences IA",
    subtitle: (n: number) => `${n} produits dans le catalogue`,
    step1: "Localisation",
    step2: "Sol & Climat",
    step3: "Expérience & objectifs",
    step4: "Résultats",
    yourCountry: "Votre pays",
    yourRegion: "Votre région",
    countryPlaceholder: "Ex. Tunisie",
    regionPlaceholder: "Ex. Sfax, Cap Bon, Kairouan...",
    sowingMonth: "Mois de semis prévu",
    soilType: "Type de sol",
    climate: "Climat / Exposition",
    experience: "Votre expérience",
    objectives: "Vos objectifs",
    oneOrMore: "Un ou plusieurs objectifs",
    back: "Retour",
    next: "Suivant",
    analyze: "Voir mes semences",
    analyzing: "Analyse…",
    stepOf: (s: number) => `Étape ${s} / 3`,
    profileAnalyzed: "Profil analysé",
    analyzing2: "Analyse en cours…",
    aiEval: "L'IA évalue chaque semence selon votre profil",
    retry: "Réessayer",
    noResult: "Aucune semence compatible trouvée",
    broaden: "Essayez d'élargir vos critères",
    recommended: (n: number) =>
      `${n} semences recommandées par l'IA, classées par compatibilité`,
    modifyCriteria: "Modifier mes critères",
    bestMatch: "Meilleure correspondance",
    seeProduct: "Voir ce produit",
    calculateThis: "Calculer avec ce résultat",
    downloadResult: "Télécharger le résultat",
    recommendedSowing: "Semis conseillé",
    estimatedHarvest: "Récolte estimée",
    hideAnalysis: "Masquer l'analyse",
    seeAnalysis: "Voir l'analyse complète",
    strongPoints: "Points forts",
    warning: "Avertissement",
    cardTitle: "Quelle semence pour moi ?",
    cardDesc: (n: number) => `${n} semences analysées`,
    cardBody:
      "Répondez à 3 étapes rapides sur votre localisation, votre sol et vos objectifs.",
    cardAnalyzes: [
      "Pays, région & climat",
      "Sol, mois & conditions",
      "Expérience & objectifs",
    ],
    cardResults: "Résultats IA",
    cardResultItems: [
      "Score de compatibilité /100 par semence",
      "Explication agronomique personnalisée",
      "Points forts & avertissements",
    ],
    findSeeds: "Trouver mes semences",
    badgeLabel: "Trouver ma semence",
    excellent: "Excellent",
    bonMatch: "Bon match",
    partiel: "Partiel",
    dir: "ltr" as const,
  },
  ar: {
    title: "مساعد البذور بالذكاء الاصطناعي",
    subtitle: (n: number) => `${n} منتج في الكتالوج`,
    step1: "الموقع",
    step2: "التربة والمناخ",
    step3: "الخبرة والأهداف",
    step4: "النتائج",
    yourCountry: "بلدك",
    yourRegion: "منطقتك",
    countryPlaceholder: "مثال: تونس",
    regionPlaceholder: "مثال: صفاقس، نابل، القيروان...",
    sowingMonth: "شهر الزراعة المتوقع",
    soilType: "نوع التربة",
    climate: "المناخ / التعرض",
    experience: "خبرتك",
    objectives: "أهدافك",
    oneOrMore: "هدف واحد أو أكثر",
    back: "رجوع",
    next: "التالي",
    analyze: "عرض بذوري",
    analyzing: "تحليل…",
    stepOf: (s: number) => `الخطوة ${s} / 3`,
    profileAnalyzed: "الملف المحلل",
    analyzing2: "جارٍ التحليل…",
    aiEval: "يقيّم الذكاء الاصطناعي كل بذرة وفق ملفك الشخصي",
    retry: "إعادة المحاولة",
    noResult: "لم يتم العثور على بذور متوافقة",
    broaden: "حاول توسيع معاييرك",
    recommended: (n: number) => `${n} بذور موصى بها بالذكاء الاصطناعي`,
    modifyCriteria: "تعديل المعايير",
    bestMatch: "أفضل تطابق",
    seeProduct: "عرض المنتج",
    calculateThis: "احسب بهذه النتيجة",
    downloadResult: "تحميل النتيجة",
    recommendedSowing: "موعد الزراعة المقترح",
    estimatedHarvest: "موعد الحصاد المتوقع",
    hideAnalysis: "إخفاء التحليل",
    seeAnalysis: "عرض التحليل الكامل",
    strongPoints: "نقاط القوة",
    warning: "تحذير",
    cardTitle: "أي بذرة تناسبني؟",
    cardDesc: (n: number) => `${n} بذرة تم تحليلها`,
    cardBody: "أجب على 3 خطوات سريعة حول موقعك وتربتك وأهدافك.",
    cardAnalyzes: [
      "البلد والمنطقة والمناخ",
      "التربة والشهر والظروف",
      "الخبرة والأهداف",
    ],
    cardResults: "نتائج الذكاء الاصطناعي",
    cardResultItems: [
      "درجة التوافق /100 لكل بذرة",
      "شرح زراعي مخصص",
      "نقاط القوة والتحذيرات",
    ],
    findSeeds: "ابحث عن بذوري",
    badgeLabel: "ابحث عن بذرتي",
    excellent: "ممتاز",
    bonMatch: "توافق جيد",
    partiel: "جزئي",
    dir: "rtl" as const,
  },
  en: {
    title: "AI Seed Assistant",
    subtitle: (n: number) => `${n} products in catalog`,
    step1: "Location",
    step2: "Soil & Climate",
    step3: "Experience & goals",
    step4: "Results",
    yourCountry: "Your country",
    yourRegion: "Your region",
    countryPlaceholder: "E.g. Tunisia",
    regionPlaceholder: "E.g. Sfax, Cap Bon, Kairouan...",
    sowingMonth: "Planned sowing month",
    soilType: "Soil type",
    climate: "Climate / Exposure",
    experience: "Your experience",
    objectives: "Your objectives",
    oneOrMore: "One or more objectives",
    back: "Back",
    next: "Next",
    analyze: "Find my seeds",
    analyzing: "Analyzing…",
    stepOf: (s: number) => `Step ${s} / 3`,
    profileAnalyzed: "Analyzed profile",
    analyzing2: "Analysis in progress…",
    aiEval: "AI is evaluating each seed based on your profile",
    retry: "Retry",
    noResult: "No compatible seeds found",
    broaden: "Try broadening your criteria",
    recommended: (n: number) =>
      `${n} seeds recommended by AI, ranked by compatibility`,
    modifyCriteria: "Modify criteria",
    bestMatch: "Best match",
    seeProduct: "View product",
    calculateThis: "Calculate with this result",
    downloadResult: "Download result",
    recommendedSowing: "Recommended sowing",
    estimatedHarvest: "Estimated harvest",
    hideAnalysis: "Hide analysis",
    seeAnalysis: "See full analysis",
    strongPoints: "Strengths",
    warning: "Warning",
    cardTitle: "Which seed is right for me?",
    cardDesc: (n: number) => `${n} seeds analyzed`,
    cardBody: "Answer 3 quick steps about your location, soil and objectives.",
    cardAnalyzes: [
      "Country, region & climate",
      "Soil, month & conditions",
      "Experience & objectives",
    ],
    cardResults: "AI Results",
    cardResultItems: [
      "Compatibility score /100 per seed",
      "Personalized agronomic explanation",
      "Strengths & warnings",
    ],
    findSeeds: "Find my seeds",
    badgeLabel: "Find my seed",
    excellent: "Excellent",
    bonMatch: "Good match",
    partiel: "Partial",
    dir: "ltr" as const,
  },
};

/* ═══════════════════════════════════════════════════════════════════
   DONNÉES
════════════════════════════════════════════════════════════════════ */
const MOIS: Record<Lang, string[]> = {
  fr: [
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
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  ar: [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ],
};

const CLIMATS = [
  {
    value: "Semi-aride",
    Icon: Sun,
    color: "#f59e0b",
    labelFr: "Semi-aride",
    labelAr: "شبه جافة",
    labelEn: "Semi-arid",
    descFr: "Saisons sèches marquées",
    descAr: "مواسم جافة واضحة",
    descEn: "Marked dry seasons",
  },
  {
    value: "Chaud et sec",
    Icon: Sun,
    color: "#ef4444",
    labelFr: "Chaud et sec",
    labelAr: "حار وجاف",
    labelEn: "Hot & dry",
    descFr: "Étés très chauds",
    descAr: "صيف شديد الحرارة",
    descEn: "Very hot summers",
  },
  {
    value: "Méditerranéen",
    Icon: Cloud,
    color: "#3b82f6",
    labelFr: "Méditerranéen",
    labelAr: "متوسطي",
    labelEn: "Mediterranean",
    descFr: "Doux, hivers pluvieux",
    descAr: "معتدل، شتاء ممطر",
    descEn: "Mild, rainy winters",
  },
  {
    value: "Tempéré",
    Icon: Cloud,
    color: "#64748b",
    labelFr: "Tempéré",
    labelAr: "معتدل",
    labelEn: "Temperate",
    descFr: "4 saisons équilibrées",
    descAr: "4 فصول متوازنة",
    descEn: "4 balanced seasons",
  },
  {
    value: "Humide",
    Icon: Droplets,
    color: "#0ea5e9",
    labelFr: "Humide",
    labelAr: "رطب",
    labelEn: "Humid",
    descFr: "Pluies fréquentes",
    descAr: "أمطار متكررة",
    descEn: "Frequent rainfall",
  },
  {
    value: "Saharien",
    Icon: Sun,
    color: "#dc2626",
    labelFr: "Saharien",
    labelAr: "صحراوي",
    labelEn: "Saharan",
    descFr: "Très chaud, très sec",
    descAr: "حار جداً وجاف جداً",
    descEn: "Very hot, very dry",
  },
  {
    value: "Venteux",
    Icon: Wind,
    color: "#8b5cf6",
    labelFr: "Venteux",
    labelAr: "عاصف",
    labelEn: "Windy",
    descFr: "Vents dominants forts",
    descAr: "رياح قوية مستمرة",
    descEn: "Strong dominant winds",
  },
  {
    value: "Sous serre",
    Icon: Warehouse,
    color: "#10b981",
    labelFr: "Sous serre",
    labelAr: "تحت البيوت المحمية",
    labelEn: "Greenhouse",
    descFr: "Climat contrôlé",
    descAr: "مناخ متحكم به",
    descEn: "Controlled climate",
  },
];

const SOLS = [
  {
    value: "Sableux",
    Icon: Shovel,
    color: "#f59e0b",
    labelFr: "Sableux",
    labelAr: "رملية",
    labelEn: "Sandy",
    descFr: "Léger, drainant",
    descAr: "خفيفة، جيدة الصرف",
    descEn: "Light, well-draining",
  },
  {
    value: "Argileux",
    Icon: Layers,
    color: "#92400e",
    labelFr: "Argileux",
    labelAr: "طينية",
    labelEn: "Clay",
    descFr: "Lourd, retient l'eau",
    descAr: "ثقيلة، تحتجز الماء",
    descEn: "Heavy, retains water",
  },
  {
    value: "Limoneux",
    Icon: Sprout,
    color: "#65a30d",
    labelFr: "Limoneux",
    labelAr: "طمية",
    labelEn: "Loamy",
    descFr: "Équilibré, fertile",
    descAr: "متوازنة، خصبة",
    descEn: "Balanced, fertile",
  },
  {
    value: "Calcaire",
    Icon: ScanLine,
    color: "#9ca3af",
    labelFr: "Calcaire",
    labelAr: "كلسية",
    labelEn: "Chalky",
    descFr: "Alcalin, caillouteux",
    descAr: "قلوية، حصوية",
    descEn: "Alkaline, stony",
  },
  {
    value: "Humifère",
    Icon: Leaf,
    color: "#1a7040",
    labelFr: "Humifère",
    labelAr: "دبالية",
    labelEn: "Humus-rich",
    descFr: "Riche en matière org.",
    descAr: "غنية بالمواد العضوية",
    descEn: "Rich in organic matter",
  },
  {
    value: "Sablo-limoneux",
    Icon: TreePine,
    color: "#d97706",
    labelFr: "Sablo-limoneux",
    labelAr: "رملية طميية",
    labelEn: "Sandy loam",
    descFr: "Mixte, bien drainé",
    descAr: "مختلطة، جيدة الصرف",
    descEn: "Mixed, well-drained",
  },
  {
    value: "Sec / Aride",
    Icon: Sun,
    color: "#ef4444",
    labelFr: "Sec / Aride",
    labelAr: "جافة/قاحلة",
    labelEn: "Dry / Arid",
    descFr: "Nécessite irrigation",
    descAr: "تحتاج ري",
    descEn: "Requires irrigation",
  },
];

const EXPERIENCES = [
  {
    value: "Débutant",
    Icon: Sprout,
    labelFr: "Débutant",
    labelAr: "مبتدئ",
    labelEn: "Beginner",
    descFr: "Première ou deuxième saison",
    descAr: "الموسم الأول أو الثاني",
    descEn: "First or second season",
  },
  {
    value: "Intermédiaire",
    Icon: Wheat,
    labelFr: "Intermédiaire",
    labelAr: "متوسط",
    labelEn: "Intermediate",
    descFr: "Quelques saisons d'expérience",
    descAr: "عدة مواسم من الخبرة",
    descEn: "Several seasons of experience",
  },
  {
    value: "Confirmé",
    Icon: Tractor,
    labelFr: "Confirmé",
    labelAr: "خبير",
    labelEn: "Expert",
    descFr: "Agriculteur / technicien expéri.",
    descAr: "مزارع / تقني متمرس",
    descEn: "Experienced farmer / technician",
  },
];

const OBJECTIFS = [
  {
    value: "Rendement maximal",
    Icon: TrendingUp,
    labelFr: "Rendement maximal",
    labelAr: "أقصى إنتاجية",
    labelEn: "Max yield",
  },
  {
    value: "Résistance aux maladies",
    Icon: FlaskConical,
    labelFr: "Résistance aux maladies",
    labelAr: "مقاومة الأمراض",
    labelEn: "Disease resistance",
  },
  {
    value: "Précocité",
    Icon: Zap,
    labelFr: "Précocité",
    labelAr: "النضج المبكر",
    labelEn: "Early maturity",
  },
  {
    value: "Qualité gustative",
    Icon: Target,
    labelFr: "Qualité gustative",
    labelAr: "الجودة الغذائية",
    labelEn: "Taste quality",
  },
  {
    value: "Culture biologique",
    Icon: Recycle,
    labelFr: "Culture biologique",
    labelAr: "زراعة عضوية",
    labelEn: "Organic farming",
  },
  {
    value: "Tolérance sécheresse",
    Icon: CloudRain,
    labelFr: "Tolérance sécheresse",
    labelAr: "تحمل الجفاف",
    labelEn: "Drought tolerance",
  },
];

// Icônes pour les étapes de la carte d'intro
const CARD_STEP_ICONS = [Globe, Thermometer, Layers];

// Icônes pour les résultats IA dans la carte d'intro
const CARD_RESULT_ICONS = [Trophy, Leaf, CheckCircle2];

const STEPS_ICONS = [Globe, Thermometer, Layers, Sparkles];

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════════ */
function extractTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map(String);
  if (typeof tags === "string")
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  return [];
}

function toSemencePayload(p: ProduitCardType): ProduitSemence {
  const pp = p as any;
  return {
    id_produit: p.id_produit,
    nom: p.nom,
    slug: p.slug,
    description: p.description ?? null,
    categorie: p.categorie?.nom ?? "",
    marque: p.marque?.nom ?? null,
    saison: pp.saison ?? null,
    type_semence: pp.type_semence ?? null,
    resistance: pp.resistance ?? null,
    descriptif_var: pp.descriptif_var ?? null,
    productivite: pp.productivite ?? null,
    biologique: pp.biologique ?? null,
    tags: extractTags(p.tags),
  };
}

function getLabel(item: any, lang: Lang): string {
  if (lang === "ar") return item.labelAr ?? item.label ?? item.value;
  if (lang === "en") return item.labelEn ?? item.label ?? item.value;
  return item.labelFr ?? item.label ?? item.value;
}
function getDesc(item: any, lang: Lang): string {
  if (lang === "ar") return item.descAr ?? item.desc ?? "";
  if (lang === "en") return item.descEn ?? item.desc ?? "";
  return item.descFr ?? item.desc ?? "";
}

function monthName(index: number | undefined, lang: Lang) {
  if (index === undefined) return "—";
  return MOIS[lang][((index % 12) + 12) % 12];
}

function harvestOffsetMonths(productName: string, categoryName?: string) {
  const n = `${productName} ${categoryName ?? ""}`.toLowerCase();
  if (n.includes("gazon") || n.includes("pelouse")) return 2;
  if (n.includes("laitue") || n.includes("salade") || n.includes("radis"))
    return 2;
  if (n.includes("fleur") || n.includes("floral")) return 3;
  if (
    n.includes("concombre") ||
    n.includes("courgette") ||
    n.includes("haricot")
  )
    return 3;
  if (
    n.includes("tomat") ||
    n.includes("poivron") ||
    n.includes("piment") ||
    n.includes("melon")
  )
    return 4;
  if (n.includes("past") || n.includes("courge")) return 5;
  if (n.includes("carot") || n.includes("oignon")) return 4;
  return 3;
}

function recommendationTextFile({
  productName,
  categoryName,
  rec,
  lang,
  mois,
}: {
  productName: string;
  categoryName?: string;
  rec: RecommandationResult;
  lang: Lang;
  mois?: number;
}) {
  const harvestMonth =
    mois === undefined
      ? undefined
      : mois + harvestOffsetMonths(productName, categoryName);
  return [
    "Résultat de recommandation de semences",
    `Semence: ${productName}`,
    categoryName ? `Catégorie: ${categoryName}` : null,
    `Score: ${rec.score}/100`,
    `Niveau: ${rec.niveau}`,
    mois !== undefined
      ? `${T[lang].recommendedSowing}: ${monthName(mois, lang)}`
      : null,
    harvestMonth !== undefined
      ? `${T[lang].estimatedHarvest}: ${monthName(harvestMonth, lang)}`
      : null,
    `Raison: ${rec.raison}`,
    rec.details ? `Analyse: ${rec.details}` : null,
    rec.points_forts?.length
      ? `Points forts: ${rec.points_forts.join(", ")}`
      : null,
    rec.avertissement ? `Avertissement: ${rec.avertissement}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/* ═══════════════════════════════════════════════════════════════════
   COMPOSANTS UI
════════════════════════════════════════════════════════════════════ */

function LangSwitcher({
  lang,
  setLang,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  return (
    <div
      className="flex items-center gap-1 rounded-xl p-1"
      style={{ background: "rgba(255,255,255,0.15)" }}
    >
      {(["fr", "ar", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="rounded-lg px-2 py-0.5 text-[9px] font-black uppercase transition-all"
          style={
            lang === l
              ? { background: "#fff", color: EV.forest }
              : { color: "rgba(255,255,255,0.7)" }
          }
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#ca8a04" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: "#f0f0f0" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span
        className="text-[10px] font-black w-12 text-right"
        style={{ color }}
      >
        {score}/100
      </span>
    </div>
  );
}

function NiveauBadge({
  niveau,
  lang,
}: {
  niveau: RecommandationResult["niveau"];
  lang: Lang;
}) {
  const t = T[lang];
  const config = {
    excellent: {
      bg: "#f0fdf4",
      text: "#16a34a",
      border: "#86efac",
      label: t.excellent,
    },
    bon: {
      bg: "#fefce8",
      text: "#ca8a04",
      border: "#fde68a",
      label: t.bonMatch,
    },
    partiel: {
      bg: "#fef2f2",
      text: "#ef4444",
      border: "#fecaca",
      label: t.partiel,
    },
  }[niveau];
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[10px] font-bold"
      style={{
        background: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
      }}
    >
      {config.label}
    </span>
  );
}

function ResultCard({
  rec,
  product,
  rank,
  lang,
  mode,
  mois,
}: {
  rec: RecommandationResult;
  product: ProduitCardType | undefined;
  rank: number;
  lang: Lang;
  mode?: string;
  mois?: number;
}) {
  const [open, setOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [detectedPlant, setDetectedPlant] = useState<string>(
    detectPlant(`${product?.nom ?? rec.slug} ${product?.categorie?.nom ?? ""} ${product?.slug ?? ""}`),
  );
  const calculatorRef = useRef<HTMLDivElement>(null);
  const t = T[lang];
  const img = product?.images?.[0];
  const scoreColor =
    rec.score >= 75 ? "#16a34a" : rec.score >= 50 ? "#ca8a04" : "#ef4444";
  const productAny = product as any;
  const productName = product?.nom ?? rec.slug;
  const categoryName = product?.categorie?.nom;
  const harvestMonth =
    mois === undefined
      ? undefined
      : mois + harvestOffsetMonths(productName, categoryName);

  useEffect(() => {
    if (!product) return;

    let cancelled = false;
    setDetectedPlant(
      detectPlant(`${product.nom} ${product.categorie?.nom ?? ""} ${product.slug ?? ""}`),
    );
    detectPlantSemantic({
      slug: product.slug ?? product.nom,
      nom: product.nom,
      categoryName: product.categorie?.nom ?? "",
      usage: productAny.usage,
      descriptifVar: productAny.descriptif_var,
      typeSemence: productAny.type_semence,
    }).then((plant) => {
      if (!cancelled) setDetectedPlant(plant);
    });

    return () => {
      cancelled = true;
    };
  }, [product, productAny?.usage, productAny?.descriptif_var, productAny?.type_semence]);

  useEffect(() => {
    if (!showCalculator) return;

    const timer = window.setTimeout(() => {
      calculatorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [showCalculator]);

  function downloadRecommendation() {
    const blob = new Blob(
      [
        recommendationTextFile({
          productName,
          categoryName,
          rec,
          lang,
          mois,
        }),
      ],
      { type: "text/plain;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recommandation-${productName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="rounded-2xl border bg-white overflow-hidden transition-shadow hover:shadow-md"
      style={{
        borderColor: rank === 1 ? "#86efac" : "#e8ede5",
        boxShadow:
          rank === 1
            ? "0 4px 24px rgba(22,163,74,0.14)"
            : "0 1px 6px rgba(0,0,0,0.04)",
        direction: t.dir,
      }}
    >
      {rank === 1 && (
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{
            background: `linear-gradient(135deg,${EV.forest},${EV.mid})`,
          }}
        >
          <Star size={11} className="text-yellow-300" fill="currentColor" />
          <span className="text-[10px] font-black text-white uppercase tracking-wider">
            {t.bestMatch}
          </span>
        </div>
      )}
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className="relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden"
            style={{ background: EV.pale }}
          >
            {img ? (
              <Image
                src={img.url}
                alt={img.alt ?? rec.slug}
                fill
                className="object-contain p-2"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Sprout size={22} style={{ color: EV.leaf }} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p
                className="text-base font-bold leading-snug"
                style={{ color: EV.text }}
              >
                {productName}
              </p>
              <div
                className="shrink-0 flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5"
                style={{ background: `${scoreColor}15`, minWidth: 48 }}
              >
                <span
                  className="text-[18px] font-black leading-none"
                  style={{ color: scoreColor }}
                >
                  {rec.score}
                </span>
                <span className="text-[10px] font-semibold text-gray-500">
                  / 100
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-gray-500">{categoryName}</span>
              <NiveauBadge niveau={rec.niveau} lang={lang} />
            </div>
            <div className="mt-2">
              <ScoreBar score={rec.score} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
          >
            <CalendarDays size={13} className="shrink-0 text-green-700" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-green-800">
                {t.recommendedSowing}
              </p>
              <p className="text-sm font-semibold text-green-950">
                {monthName(mois, lang)}
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
          >
            <Ruler size={13} className="shrink-0 text-orange-700" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-orange-800">
                {t.estimatedHarvest}
              </p>
              <p className="text-sm font-semibold text-orange-950">
                {monthName(harvestMonth, lang)}
              </p>
            </div>
          </div>
        </div>
        <div
          className="flex items-start gap-2 rounded-xl px-3 py-2.5"
          style={{ background: EV.pale, border: `1px solid ${EV.border}` }}
        >
          <Leaf
            size={11}
            className="mt-0.5 shrink-0"
            style={{ color: EV.mid }}
          />
          <p
            className="text-sm font-medium leading-relaxed"
            style={{ color: "#2d5a3a" }}
          >
            {rec.raison}
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-xs font-semibold transition-colors"
          style={{ color: open ? EV.forest : "#9ca3af" }}
        >
          {open ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
          {open ? t.hideAnalysis : t.seeAnalysis}
        </button>
        {open && (
          <div
            className="rounded-xl p-3 space-y-3"
            style={{ background: "#f9fafb", border: "1px solid #f0f0f0" }}
          >
            <p className="text-sm leading-relaxed text-gray-700">
              {rec.details}
            </p>
            {rec.points_forts?.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {t.strongPoints}
                </p>
                {rec.points_forts.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2
                      size={11}
                      className="mt-0.5 shrink-0"
                      style={{ color: EV.leaf }}
                    />
                    <p className="text-sm text-gray-700">{pt}</p>
                  </div>
                ))}
              </div>
            )}
            {rec.avertissement && (
              <div
                className="flex items-start gap-2 rounded-lg px-3 py-2"
                style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
              >
                <AlertCircle
                  size={11}
                  className="mt-0.5 shrink-0 text-amber-500"
                />
                <p className="text-xs text-amber-800">
                  {rec.avertissement}
                </p>
              </div>
            )}
          </div>
        )}
        {product && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setShowCalculator((v) => !v)}
              className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${EV.leaf}, ${EV.forest})`,
              }}
            >
              <Calculator size={13} /> {t.calculateThis}
            </button>
            <button
              onClick={downloadRecommendation}
              className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-[12px] font-bold transition-all hover:bg-green-50 active:scale-[0.98]"
              style={{ borderColor: EV.border, color: EV.forest }}
            >
              <Download size={13} /> {t.downloadResult}
            </button>
            <Link
              href={getProductHref(product)}
              className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-[12px] font-bold transition-all hover:bg-green-50 active:scale-[0.98]"
              style={{ borderColor: EV.border, color: EV.forest }}
            >
              {t.seeProduct} <ArrowRight size={13} />
            </Link>
          </div>
        )}
        {showCalculator && product && (
          <div ref={calculatorRef}>
            <SeedCalculatorWidget
              inline
              defaultPlant={detectedPlant}
              defaultMode={mode}
              defaultSowingMonth={mois}
              productName={product.nom}
              sowingCalendar={productAny.calendrier_semis}
              harvestCalendar={productAny.calendrier_recolte}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Steps ────────────────────────────────────────────────────── */
function Step1({
  pays,
  setPays,
  region,
  setRegion,
  lang,
}: {
  pays: string;
  setPays: (v: string) => void;
  region: string;
  setRegion: (v: string) => void;
  lang: Lang;
}) {
  const t = T[lang];
  return (
    <div className="space-y-5" dir={t.dir}>
      <div>
        <label
          htmlFor="seed-country"
          className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider sm:text-[13px]"
          style={{ color: EV.forest }}
        >
          <Globe size={15} /> {t.yourCountry}
        </label>
        <input
          id="seed-country"
          value={pays}
          onChange={(e) => setPays(e.target.value)}
          placeholder={t.countryPlaceholder}
          className="w-full rounded-xl border bg-white px-4 py-3.5 text-base outline-none transition focus:ring-2 focus:ring-green-100"
          style={{ borderColor: EV.border, color: EV.text }}
        />
      </div>
      <div>
        <label
          htmlFor="seed-region"
          className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider sm:text-[13px]"
          style={{ color: EV.forest }}
        >
          <MapPin size={15} /> {t.yourRegion}
        </label>
        <input
          id="seed-region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder={t.regionPlaceholder}
          className="w-full rounded-xl border bg-white px-4 py-3.5 text-base outline-none transition focus:ring-2 focus:ring-green-100"
          style={{ borderColor: EV.border, color: EV.text }}
        />
        <div
          className="mt-3 flex items-start gap-2 rounded-xl px-3 py-2"
          style={{ background: EV.pale, border: `1px solid ${EV.border}` }}
        >
          <Wheat
            size={13}
            className="mt-0.5 shrink-0"
            style={{ color: EV.forest }}
          />
          <p className="text-sm leading-relaxed text-gray-700">
            Ces deux informations permettent d'adapter les semences au terrain
            réel, sans imposer une liste fermée.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step2({
  mois,
  setMois,
  sol,
  setSol,
  climat,
  setClimat,
  lang,
}: {
  mois: number;
  setMois: (v: number) => void;
  sol: string;
  setSol: (v: string) => void;
  climat: string;
  setClimat: (v: string) => void;
  lang: Lang;
}) {
  const t = T[lang];
  const moisLabels = MOIS[lang];
  return (
    <div className="space-y-5" dir={t.dir}>
      <div>
        <p
          className="mb-3 text-xs font-bold uppercase tracking-wider sm:text-[13px]"
          style={{ color: EV.forest }}
        >
          {t.sowingMonth}
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {moisLabels.map((m, i) => (
            <button
              type="button"
              key={m}
              aria-pressed={mois === i}
              onClick={() => setMois(i)}
              className="rounded-xl py-2.5 text-xs font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F8050] sm:py-3"
              style={
                mois === i
                  ? {
                      background: EV.forest,
                      color: "#fff",
                      boxShadow: "0 2px 8px rgba(10,92,46,0.25)",
                    }
                  : { background: "#f4f6f2", color: "#6b7a6e" }
              }
            >
              {m.slice(0, lang === "ar" ? 4 : 3)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p
          className="mb-3 text-xs font-bold uppercase tracking-wider sm:text-[13px]"
          style={{ color: EV.forest }}
        >
          {t.soilType}
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SOLS.map((s) => {
            const Ic = s.Icon;
            return (
              <button
                type="button"
                key={s.value}
                aria-pressed={sol === s.value}
                onClick={() => setSol(s.value)}
                className="flex min-h-14 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:border-[#A8BE9B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3F8050]"
                style={
                  sol === s.value
                    ? {
                        background: EV.pale2,
                        border: `1.5px solid ${EV.border}`,
                      }
                    : { background: "#fafafa", border: "1.5px solid #f0f0f0" }
                }
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${s.color}18` }}
                >
                  <Ic size={16} style={{ color: s.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: EV.text }}
                  >
                    {getLabel(s, lang)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getDesc(s, lang)}
                  </p>
                </div>
                {sol === s.value && (
                  <CheckCircle2
                    size={15}
                    className="shrink-0"
                    style={{ color: EV.forest }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p
          className="mb-3 text-xs font-bold uppercase tracking-wider sm:text-[13px]"
          style={{ color: EV.forest }}
        >
          {t.climate}
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CLIMATS.map((c) => {
            const Ic = c.Icon;
            return (
              <button
                type="button"
                key={c.value}
                aria-pressed={climat === c.value}
                onClick={() => setClimat(c.value)}
                className="flex min-h-14 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:border-[#A8BE9B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3F8050]"
                style={
                  climat === c.value
                    ? {
                        background: EV.pale2,
                        border: `1.5px solid ${EV.border}`,
                      }
                    : { background: "#fafafa", border: "1.5px solid #f0f0f0" }
                }
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${c.color}18` }}
                >
                  <Ic size={16} style={{ color: c.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: EV.text }}
                  >
                    {getLabel(c, lang)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getDesc(c, lang)}
                  </p>
                </div>
                {climat === c.value && (
                  <CheckCircle2
                    size={15}
                    className="shrink-0"
                    style={{ color: EV.forest }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step3({
  experience,
  setExperience,
  objectifs,
  setObjectifs,
  lang,
}: {
  experience: string;
  setExperience: (v: string) => void;
  objectifs: string[];
  setObjectifs: (v: string[]) => void;
  lang: Lang;
}) {
  const t = T[lang];
  function toggle(v: string) {
    setObjectifs(
      objectifs.includes(v)
        ? objectifs.filter((o) => o !== v)
        : [...objectifs, v],
    );
  }
  return (
    <div className="space-y-5" dir={t.dir}>
      <div>
        <p
          className="mb-3 text-xs font-bold uppercase tracking-wider sm:text-[13px]"
          style={{ color: EV.forest }}
        >
          {t.experience}
        </p>
        <div className="space-y-2">
          {EXPERIENCES.map((e) => {
            const Ic = e.Icon;
            return (
              <button
                type="button"
                key={e.value}
                aria-pressed={experience === e.value}
                onClick={() => setExperience(e.value)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:border-[#A8BE9B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3F8050]"
                style={
                  experience === e.value
                    ? {
                        background: EV.pale2,
                        border: `1.5px solid ${EV.border}`,
                      }
                    : { background: "#fafafa", border: "1.5px solid #f0f0f0" }
                }
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: experience === e.value ? EV.forest : "#f0f0f0",
                  }}
                >
                  <Ic
                    size={16}
                    style={{
                      color: experience === e.value ? "#fff" : "#9ca3af",
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: EV.text }}
                  >
                    {getLabel(e, lang)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getDesc(e, lang)}
                  </p>
                </div>
                {experience === e.value ? (
                  <CheckCircle2 size={14} style={{ color: EV.forest }} />
                ) : (
                  <Circle size={14} className="text-gray-200" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p
          className="mb-1 text-xs font-bold uppercase tracking-wider sm:text-[13px]"
          style={{ color: EV.forest }}
        >
          {t.objectives}
        </p>
        <p className="mb-3 text-xs text-gray-500">{t.oneOrMore}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {OBJECTIFS.map((o) => {
            const sel = objectifs.includes(o.value);
            const Ic = o.Icon;
            return (
              <button
                type="button"
                key={o.value}
                aria-pressed={sel}
                onClick={() => toggle(o.value)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3F8050]"
                style={
                  sel
                    ? {
                        background: EV.pale2,
                        border: `1.5px solid ${EV.border}`,
                      }
                    : { background: "#fafafa", border: "1.5px solid #f0f0f0" }
                }
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: sel ? EV.forest : "#f0f0f0" }}
                >
                  <Ic size={12} style={{ color: sel ? "#fff" : "#9ca3af" }} />
                </div>
                <p
                  className="text-[10px] font-bold flex-1"
                  style={{ color: EV.text }}
                >
                  {getLabel(o, lang)}
                </p>
                {sel ? (
                  <CheckCircle2 size={11} style={{ color: EV.forest }} />
                ) : (
                  <Circle size={11} className="text-gray-200" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DIALOG PRINCIPAL
════════════════════════════════════════════════════════════════════ */
function RecommandationDialog({
  open,
  onClose,
  products,
}: {
  open: boolean;
  onClose: () => void;
  products: ProduitCardType[];
}) {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Lang>("fr");
  const [step, setStep] = useState(1);
  const [pays, setPays] = useState("Tunisie");
  const [region, setRegion] = useState("");
  const [mois, setMois] = useState(new Date().getMonth());
  const [sol, setSol] = useState("");
  const [climat, setClimat] = useState("");
  // Valeur historique transmise à l'API pour préserver le contrat existant.
  const mode = "Culture standard";
  const [experience, setExperience] = useState("Intermédiaire");
  const [objectifs, setObjectifs] = useState<string[]>(["Rendement maximal"]);
  const [results, setResults] = useState<RecommandationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = T[lang];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const productMap = Object.fromEntries(products.map((p) => [p.id_produit, p]));

  async function fetchRecommandations() {
    setLoading(true);
    setError(null);
    try {
      const profil: VisiteurProfil = {
        pays,
        region,
        climat,
        mois,
        sol,
        mode,
        experience,
        objectifs,
      };
      const res = await fetch("/api/semences/recommander", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profil,
          produits: products.map(toSemencePayload),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `Erreur ${res.status}`);
      }
      const data = (await res.json()) as { results?: RecommandationResult[] };
      setResults(Array.isArray(data.results) ? data.results : []);
      setStep(4);
      setTimeout(
        () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }),
        50,
      );
    } catch (err: any) {
      setError(err.message ?? "Erreur inattendue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(1);
    setResults([]);
    setError(null);
    setPays("Tunisie");
    setRegion("");
    setSol("");
    setClimat("");
    setObjectifs(["Rendement maximal"]);
  }

  const canProceed =
    step === 1
      ? !!pays && !!region
      : step === 2
        ? !!sol && !!climat
        : step === 3
          ? !!experience && objectifs.length > 0
          : true;

  if (!open || !mounted) return null;

  const steps = [t.step1, t.step2, t.step3, t.step4];

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] isolate flex items-end justify-center bg-[#17271d]/65 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-[#F7F7F2] sm:max-h-[90vh] sm:max-w-2xl sm:rounded-[28px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="seed-recommendation-title"
        style={{
          border: `1px solid ${EV.border}`,
          boxShadow: "0 28px 72px rgba(13,36,22,0.30)",
          direction: t.dir,
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex shrink-0 items-center justify-between px-5 py-4 sm:px-7"
          style={{
            background: `linear-gradient(135deg, ${EV.forest}, ${EV.mid})`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.18)" }}
            >
              <Wheat size={19} className="text-white" />
            </div>
            <div>
              <h2 id="seed-recommendation-title" className="text-base font-bold text-white sm:text-lg">{t.title}</h2>
              <p className="mt-0.5 text-xs text-white/75">
                {t.subtitle(products.length)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitcher lang={lang} setLang={setLang} />
            <button
              type="button"
              aria-label={lang === "ar" ? "إغلاق" : lang === "en" ? "Close" : "Fermer"}
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              style={{ background: "rgba(255,255,255,0.18)" }}
            >
              <X size={15} className="text-white" />
            </button>
          </div>
        </div>

        {/* ── Stepper ── */}
        <div
          className="flex shrink-0 items-center border-b bg-[#F7F7F2] px-5 py-4 sm:px-8"
          style={{ borderColor: EV.border }}
        >
          {steps.map((label, i) => {
            const Icon = STEPS_ICONS[i];
            const id = i + 1;
            const done = step > id;
            const cur = step === id;
            return (
              <div key={id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-0.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-all"
                    style={
                      done
                        ? { background: EV.leaf, color: "#fff" }
                        : cur
                          ? {
                              background: EV.forest,
                              color: "#fff",
                              boxShadow: `0 0 0 3px ${EV.pale2}`,
                            }
                          : { background: "#f0f0f0", color: "#c0c0c0" }
                    }
                  >
                    {done ? <CheckCircle2 size={14} /> : <Icon size={13} />}
                  </div>
                  <span
                    className="max-w-[68px] text-center text-[10px] font-semibold leading-tight sm:text-[11px]"
                    style={{
                      color: cur ? EV.forest : done ? EV.leaf : "#c0c0c0",
                    }}
                  >
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-1 rounded-full transition-all"
                    style={{ background: done ? EV.leaf : "#e8e8e8" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Contenu ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
          {step === 1 && (
            <Step1
              pays={pays}
              setPays={setPays}
              region={region}
              setRegion={setRegion}
              lang={lang}
            />
          )}
          {step === 2 && (
            <Step2
              mois={mois}
              setMois={setMois}
              sol={sol}
              setSol={setSol}
              climat={climat}
              setClimat={setClimat}
              lang={lang}
            />
          )}
          {step === 3 && (
            <Step3
              experience={experience}
              setExperience={setExperience}
              objectifs={objectifs}
              setObjectifs={setObjectifs}
              lang={lang}
            />
          )}
          {step === 4 && (
            <div className="space-y-4" dir={t.dir}>
              <div
                className="rounded-2xl px-4 py-3"
                style={{
                  background: EV.pale,
                  border: `1px solid ${EV.border}`,
                }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-wider mb-2"
                  style={{ color: EV.forest }}
                >
                  {t.profileAnalyzed}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    pays || null,
                    region || null,
                    MOIS[lang][mois],
                    sol || null,
                    climat || null,
                    experience,
                    ...objectifs,
                  ]
                    .filter(Boolean)
                    .map((chip, idx) => (
                      <span
                        key={`${String(chip)}-${idx}`}
                        className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                        style={{
                          background: EV.pale2,
                          color: EV.forest,
                          border: `1px solid ${EV.border}`,
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                </div>
              </div>

              {loading && (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-full border-4 animate-spin"
                      style={{
                        borderColor: `${EV.border} ${EV.border} ${EV.border} transparent`,
                      }}
                    />
                    <Sprout
                      size={20}
                      className="absolute inset-0 m-auto"
                      style={{ color: EV.forest }}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className="text-sm font-bold"
                      style={{ color: EV.forest }}
                    >
                      {t.analyzing2}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{t.aiEval}</p>
                  </div>
                </div>
              )}

              {!loading && error && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <AlertCircle size={32} className="text-red-400" />
                  <p className="text-sm font-bold text-red-600">{error}</p>
                  <button
                    onClick={fetchRecommandations}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
                    style={{ background: EV.forest }}
                  >
                    <RefreshCw size={13} /> {t.retry}
                  </button>
                </div>
              )}

              {!loading && !error && results.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "#f9fafb" }}
                  >
                    <Sprout size={28} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-400">
                    {t.noResult}
                  </p>
                  <p className="text-xs text-gray-300">{t.broaden}</p>
                </div>
              )}

              {!loading && !error && results.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[11px] text-gray-400">
                    <span className="font-black" style={{ color: EV.forest }}>
                      {results.length}
                    </span>{" "}
                    {t
                      .recommended(results.length)
                      .replace(String(results.length), "")
                      .trim()}
                  </p>
                  {results.map((r, i) => (
                    <ResultCard
                      key={r.id_produit}
                      rec={r}
                      product={productMap[r.id_produit]}
                      rank={i + 1}
                      lang={lang}
                      mode={mode}
                      mois={mois}
                    />
                  ))}
                </div>
              )}

              {!loading && (
                <button
                  onClick={reset}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold border transition-colors hover:bg-gray-50"
                  style={{ borderColor: EV.border, color: EV.forest }}
                >
                  <RefreshCw size={13} /> {t.modifyCriteria}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {step < 4 && (
          <div
            className="flex shrink-0 items-center justify-between border-t bg-white px-5 py-4 sm:px-8"
            style={{ borderColor: EV.border }}
          >
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-30 transition-all"
              style={{ background: "#f4f6f2", color: EV.forest }}
            >
              {t.dir === "rtl" ? (
                <ChevronRight size={14} />
              ) : (
                <ChevronLeft size={14} />
              )}{" "}
              {t.back}
            </button>
            <span className="text-[10px] text-gray-400 font-semibold">
              {t.stepOf(step)}
            </span>
            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${EV.leaf}, ${EV.forest})`,
                }}
              >
                {t.next}{" "}
                {t.dir === "rtl" ? (
                  <ChevronLeft size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            ) : (
              <button
                onClick={fetchRecommandations}
                disabled={!canProceed || loading}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${EV.leaf}, ${EV.forest})`,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> {t.analyzing}
                  </>
                ) : (
                  <>
                    <Sparkles size={13} /> {t.analyze}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EXPORTS PUBLICS
════════════════════════════════════════════════════════════════════ */
export function SemencesRecommandation() {
  return (
    <a
      href="#recommandations-semences"
      className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
      style={{
        background: `linear-gradient(135deg, ${EV.forest}, ${EV.mid})`,
        boxShadow: "0 8px 20px rgba(10,92,46,0.2)",
      }}
    >
      <Wheat size={12} />
      <span className="hidden sm:inline">Trouver ma semence</span>
      <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-black">
        IA
      </span>
    </a>
  );
}

export function SemencesRecommandationCard({
  products,
}: {
  products: ProduitCardType[];
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  // Lire la locale depuis le contexte i18n du site
  const { locale, t: tSite } = useI18n();
  const lang: Lang =
    locale === "fr" || locale === "ar" || locale === "en" ? locale : "fr";
  const t = T[lang];

  return (
    <>
      <aside
        id="recommandations-semences"
        className="overflow-hidden rounded-[26px] border"
        style={{
          borderColor: EV.border,
          boxShadow: "0 12px 32px rgba(36,60,40,0.10)",
          background: "#F7F7F2",
        }}
      >
        <div className="flex flex-wrap items-center gap-3 p-3 sm:gap-4 sm:p-4" dir={t.dir}>
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#EAF2E6] sm:h-16 sm:w-16">
            <Image
              src="/images/activites/semences-plants.webp"
              alt="Jeunes plants cultivés en pépinière"
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>

          <div className="min-w-[140px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold leading-tight text-[#243128] sm:text-lg">{t.cardTitle}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF2E6] px-2 py-1 text-[10px] font-bold text-[#245C38]">
                <Sparkles size={11} /> IA
              </span>
            </div>
            <p className="mt-1 text-xs text-[#536257] sm:text-sm">{t.cardDesc(products.length)}</p>
          </div>

          <button
            type="button"
            aria-expanded={expanded}
            aria-controls="recommandations-semences-details"
            aria-label={expanded
              ? (lang === "ar" ? "إخفاء التفاصيل" : lang === "en" ? "Hide details" : "Masquer les détails")
              : (lang === "ar" ? "عرض التفاصيل" : lang === "en" ? "Show details" : "Afficher les détails")}
            onClick={() => setExpanded((value) => !value)}
            className="order-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d7e4d2] bg-white text-[#245C38] transition hover:bg-[#EAF2E6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F8050] sm:order-none"
          >
            <ChevronDown
              size={19}
              className={`transition-transform ${expanded ? "rotate-180" : "rotate-0"}`}
              style={{ transitionDuration: reduceMotion ? "0ms" : "220ms" }}
            />
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="order-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245C38] sm:order-none sm:w-auto sm:px-5"
            style={{ background: "#3F8050", boxShadow: "0 5px 15px rgba(36,92,56,0.16)" }}
          >
            <Wheat size={16} /> {t.findSeeds} <ArrowRight size={15} />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              id="recommandations-semences-details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-[#dce8d8]"
            >
              <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[0.8fr_1.2fr] md:items-center" dir={t.dir}>
                <div className="relative min-h-36 overflow-hidden rounded-2xl sm:min-h-44">
                  <Image
                    src="/images/activites/semences-plants.webp"
                    alt="Jeunes plants cultivés en pépinière"
                    fill
                    sizes="(max-width: 768px) 100vw, 35vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#183d2b]/50 to-transparent" />
                </div>
                <div>
                  <p className="text-sm leading-6 text-[#536257] sm:text-[15px]">{t.cardBody}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {t.cardAnalyzes.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border px-3 py-1.5 text-xs font-medium text-[#425647]"
                        style={{ borderColor: EV.border, background: "#EAF2E6" }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      <RecommandationDialog
        open={open}
        onClose={() => setOpen(false)}
        products={products}
      />
    </>
  );
}
