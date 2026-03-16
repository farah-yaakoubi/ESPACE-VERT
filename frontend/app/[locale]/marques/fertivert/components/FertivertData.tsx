import React from "react";

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════
export interface Product {
  id: string;
  name: string;
  formats: string[];
  code: string;
  description: string;
  composition?: string;
  usage?: string;
  dosage?: string;
  avantages?: string[];
  subcategoryLabel?: string; // ex: "Biostimulant", "Gestion du Sol"
}

export interface Subcategory {
  id: string;
  name: string;
  conditionnement?: string;
  products: Product[];
}

export interface Category {
  id: string;
  name: string;
  Icon: (props: any) => JSX.Element;
  color: string;
  subcategories?: Subcategory[];
  products?: Product[];
}

export interface Division {
  id: "pro-agri" | "pro-gazon" | "garden";
  name: string;
  subtitle: string;
  dark: string;
  mid: string;
  light: string;
  pale: string;
  heroGrad: string;
  categories: Category[];
}

export interface Gamme {
  id: "pro" | "garden";
  name: string;
  dark: string;
  mid: string;
  pale: string;
  heroGrad: string;
  divisions?: Division[];   // Pro a des divisions
  categories?: Category[];  // Garden a des catégories directes
}

// ══════════════════════════════════════════════════════════════════════════════
// ICÔNES SVG INLINE
// ══════════════════════════════════════════════════════════════════════════════
export const Icons = {
  Shovel: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4l6 6-9 9H7v-4l9-9z" /><path d="M4 20l4-4" />
    </svg>
  ),
  Drop: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L6 10a7 7 0 1 0 12 0L12 2z" />
    </svg>
  ),
  Leaf: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 5c0 0-8 0-13 5C4 13 4 19 4 19s6 0 9-3c5-5 5-11 7-11z" /><path d="M4 19l7-7" />
    </svg>
  ),
  Sun: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
    </svg>
  ),
  Grass: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20M6 20V11c0-3 2-5 4-6M12 20V9c0-4 3-6 5-7M6 20V15" />
    </svg>
  ),
  Flask: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M10 3v6L5 17a2 2 0 0 0 1.7 3h10.6A2 2 0 0 0 19 17l-5-8V3" /><path d="M7 16h10" />
    </svg>
  ),
  Recycle: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 9l-3-6H6L3 9M3 9h18M8 9l-2 12h12L16 9" />
    </svg>
  ),
  Pot: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9h12l-2 9H8L6 9z" /><path d="M4 9h16M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  ),
  Grain: (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
    </svg>
  ),
};

export const FV_COLORS = {
  // Pro - vert forêt professionnel
  proDark:    "#1B4D2E",
  proMid:     "#2E7D52",
  proLight:   "#4CAF7A",
  proPale:    "#E8F5EE",
  proAccent:  "#37B648",

  // Garden - vert plus clair, naturel
  gardenDark:   "#2E6B30",
  gardenMid:    "#4A9E4E",
  gardenLight:  "#7BC87F",
  gardenPale:   "#EDF7EE",
  gardenAccent: "#6CC26F",

  // Catégories - teintes distinctes mais cohérentes
  support: "#7C5C2A",    // brun terre
  engraisFond: "#1A5276", // bleu profond
  engraisOrg:  "#1B7A4E", // vert foncé
  fertilisant: "#6C3483", // violet
  engraisChi:  "#117A8B", // bleu-vert
  gazon:       "#1B4D2E", // vert gazon
};

// ══════════════════════════════════════════════════════════════════════════════
// PRO → AGRICULTURE
// ══════════════════════════════════════════════════════════════════════════════
const proAgriCategories: Category[] = [
  {
    id: "agri-support",
    name: "Support de Culture",
    color: FV_COLORS.support,
    Icon: Icons.Shovel,
    subcategories: [
      {
        id: "agri-support-produits",
        name: "Produits",
        products: [
          { id: "agri-terreau", name: "Terreau", formats: ["20L", "40L", "50L", "80L"], code: "FV-T-AGR", description: "Support de culture professionnel haute densité, structure aérée optimale.", composition: "Tourbe blonde, fibre de coco, perlite, chaux.", usage: "Agriculture intensive, maraîchage, horticulture.", dosage: "En pleine terre ou en conteneur selon besoin.", avantages: ["Excellente rétention d'eau", "Structure aérée favorisant les racines", "pH optimisé"] },
          { id: "agri-fumier", name: "Fumier", formats: ["40L", "50L", "80L"], code: "FV-FM-AGR", description: "Fumier naturel composté à maturité optimale, riche en matière organique.", composition: "Fumier bovin composté, matière organique >40%.", usage: "Amendement organique du sol avant plantation.", dosage: "3 à 5 kg/m²", avantages: ["Améliore la structure du sol", "Libération lente des nutriments", "100% naturel"] },
          { id: "agri-composte", name: "Composte", formats: ["40L", "50L"], code: "FV-CP-AGR", description: "Composte végétal certifié biologique, enrichi en humus actif.", composition: "Déchets végétaux compostés, humus, micro-organismes.", usage: "Enrichissement du sol, culture biologique.", dosage: "2 à 4 kg/m²", avantages: ["Certifié biologique", "Stimule l'activité microbienne", "Améliore la fertilité"] },
        ],
      },
    ],
  },
  {
    id: "agri-fond",
    name: "Engrais de Fond",
    color: FV_COLORS.engraisFond,
    Icon: Icons.Drop,
    subcategories: [
      {
        id: "agri-fond-produits",
        name: "Produits",
        products: [
          { id: "agri-ferti-fond", name: "Ferti Fond", formats: ["25KG", "50KG"], code: "FV-FF-AGR", description: "Engrais de fond NPK équilibré pour préparer le sol avant plantation.", composition: "N-P-K 15-15-15 + oligo-éléments chélatés.", usage: "Engrais de fond avant semis ou plantation.", dosage: "50-80 g/m²", avantages: ["NPK parfaitement équilibré", "Solubilité optimale", "Action prolongée 3 mois"] },
          { id: "agri-ferti-fumure", name: "Ferti Fumure", formats: ["25KG", "50KG"], code: "FV-FFM-AGR", description: "Fumure organique enrichie en macro et micro-éléments essentiels.", composition: "Matière organique 70% + N-P-K 4-3-3.", usage: "Fumure de fond organique avant plantation.", dosage: "100-150 g/m²", avantages: ["Base organique naturelle", "Structure sol améliorée", "Libération progressive"] },
        ],
      },
    ],
  },
  {
    id: "agri-organique",
    name: "Engrais Organique",
    color: FV_COLORS.engraisOrg,
    Icon: Icons.Leaf,
    subcategories: [
      {
        id: "agri-org-granule",
        name: "Granulé",
        products: [
          { id: "agri-ferti-micro", name: "Ferti Micro", formats: ["5KG", "10KG", "25KG"], code: "FV-FMG-AGR", description: "Granulés de micro-éléments concentrés pour correction et prévention de carences.", composition: "Fe, Mn, Zn, Cu, B, Mo chélatés EDTA.", usage: "Correction des carences en micro-éléments.", dosage: "20-30 g/m²", avantages: ["Micro-éléments chélatés", "Absorption optimale", "Action rapide"] },
        ],
      },
      {
        id: "agri-org-liquide",
        name: "Liquide",
        products: [
          { id: "agri-ferti-actif-1", name: "Ferti Actif", formats: ["1L", "5L", "20L"], code: "FV-FA-AGR", description: "Engrais liquide organique à action rapide. Absorption foliaire et racinaire optimisée.", composition: "N 8% + P₂O₅ 5% + K₂O 6% + acides aminés 4%.", usage: "Application foliaire ou racinaire tous les 10-15 j.", dosage: "Foliaire: 3-5 ml/L | Racinaire: 5-10 ml/L", avantages: ["Action en 48h", "Double voie d'absorption", "Formule équilibrée"] },
          { id: "agri-ferti-fruit", name: "Ferti Fruit", formats: ["1L", "5L", "20L"], code: "FV-FFR-AGR", description: "Spécial arbres fruitiers. Améliore le grossissement, la couleur et la saveur des fruits.", composition: "K₂O 12% + B + Ca + acides aminés.", usage: "Arbres fruitiers en période de fructification.", dosage: "Foliaire: 4-6 ml/L | Tous les 12 jours", avantages: ["Grossissement des fruits +30%", "Coloration améliorée", "Teneur en sucre augmentée"] },
          { id: "agri-ferti-leaf", name: "Ferti Leaf", formats: ["1L", "5L", "20L"], code: "FV-FL-AGR", description: "Application foliaire haute efficacité. Absorption rapide par les stomates foliaires.", composition: "N 10% + K₂O 8% + oligo-éléments + mouillant.", usage: "Pulvérisation foliaire en croissance végétative.", dosage: "3-4 ml/L | En matinée ou soirée", avantages: ["Absorption rapide <2h", "Formule anti-dérive", "Compatible avec phytosanitaires"] },
          { id: "agri-ferti-go", name: "Ferti Go", formats: ["1L", "5L", "20L"], code: "FV-FG-AGR", description: "Stimule la croissance en période de stress hydrique ou thermique.", composition: "Acides aminés libres 15% + extraits végétaux.", usage: "Période de stress, reprise végétative.", dosage: "5 ml/L | En période de stress", avantages: ["Anti-stress naturel", "Reprise rapide", "Stimule la photosynthèse"] },
        ],
      },
    ],
  },
  {
    id: "agri-fertilisant",
    name: "Fertilisant",
    color: FV_COLORS.fertilisant,
    Icon: Icons.Sun,
    subcategories: [
      {
        id: "agri-biostim",
        name: "Biostimulants",
        products: [
          { id: "agri-pouss-roots", name: "Pouss Roots+", formats: ["1L", "5L", "20L"], code: "FV-PR-AGR", description: "Puissant stimulant racinaire. Enracinement rapide et développement racinaire intense.", composition: "IBA + NAA + extraits d'algues + acides humiques.", usage: "Transplantation, bouturage, semis.", dosage: "2-3 ml/L en trempage ou arrosage", avantages: ["Enracinement x2 plus rapide", "Masse racinaire accrue", "Taux de reprise amélioré"], subcategoryLabel: "Biostimulant" },
          { id: "agri-aminal", name: "Aminal+", formats: ["1L", "5L", "20L"], code: "FV-AM-AGR", description: "Complexe d'acides aminés naturels. Renforce la résistance aux stress biotiques et abiotiques.", composition: "Acides aminés hydrolysés 40% + glycine-bétaïne.", usage: "Stress thermique, hydrique, salin.", dosage: "3-5 ml/L | 2 fois par semaine en période stress", avantages: ["Acides aminés L-forme bio-actifs", "Anti-stress polyvalent", "Stimule la croissance"], subcategoryLabel: "Biostimulant" },
          { id: "agri-fort-start", name: "Fort Start+", formats: ["1L", "5L", "20L"], code: "FV-FS-AGR", description: "Démarrage vigoureux — reprise rapide après plantation ou transplantation.", composition: "P₂O₅ 20% + acides aminés + extraits d'algues.", usage: "Au semis, plantation, repiquage.", dosage: "3 ml/L en arrosage au pied", avantages: ["Démarrage en 5 jours", "Stimule le système racinaire", "Réduit le choc de transplantation"], subcategoryLabel: "Biostimulant" },
          { id: "agri-oceano", name: "Oceano+", formats: ["1L", "5L", "20L"], code: "FV-OC-AGR", description: "Extraits d'algues marines Ascophyllum nodosum. Biostimulant premium nouvelle génération.", composition: "Extraits d'algues 35% + cytokinine + auxines naturelles.", usage: "Application préventive régulière.", dosage: "2-3 ml/L | Tous les 15 jours", avantages: ["Phytohormones naturels", "Stimule l'immunité végétale", "Améliore la qualité"], subcategoryLabel: "Biostimulant" },
        ],
      },
      {
        id: "agri-sol",
        name: "Gestion du Sol",
        products: [
          { id: "agri-fulvical", name: "Fulvical+", formats: ["1L", "5L", "20L"], code: "FV-FV-AGR", description: "Acides fulviques + calcium. Améliore la structure cellulaire et la perméabilité du sol.", composition: "Acides fulviques 12% + Ca 8% + Mg 2%.", usage: "Amélioration de la structure et perméabilité sol.", dosage: "5-8 ml/L en arrosage", avantages: ["Améliore la CEC du sol", "Libère les nutriments bloqués", "Favorise l'activité biologique"], subcategoryLabel: "Gestion du Sol" },
          { id: "agri-sweeter", name: "Sweeter+", formats: ["1L", "5L", "20L"], code: "FV-SW-AGR", description: "Améliore le goût, la couleur et le calibre des fruits en phase de maturation.", composition: "K₂O 15% + bore + molybdène + acides aminés.", usage: "En phase de fructification et mûrissement.", dosage: "4-6 ml/L | Tous les 10 jours", avantages: ["Indice de réfraction +2°Brix", "Coloration et calibre améliorés", "Conservation prolongée"], subcategoryLabel: "Gestion du Sol" },
        ],
      },
      {
        id: "agri-correcteur",
        name: "Correcteurs de Carences",
        products: [
          { id: "agri-calcimag", name: "CalciMag+", formats: ["1L", "5L", "20L"], code: "FV-CM-AGR", description: "Calcium et magnésium hautement assimilables. Prévention et correction des carences.", composition: "CaO 15% + MgO 5% chélatés.", usage: "Correction carence calcium/magnésium.", dosage: "3-5 ml/L | Foliaire ou racinaire", avantages: ["Double action Ca+Mg", "Forme chélatée biodisponible", "Prévient la nécrose apicale"], subcategoryLabel: "Correcteur de Carences" },
          { id: "agri-calcial", name: "Calcial+", formats: ["1L", "5L", "20L"], code: "FV-CL-AGR", description: "Solution calcique concentrée. Renforce la turgescence et la fermeté des fruits.", composition: "CaO 20% + acides organiques + mouillant.", usage: "Correction carence calcium sévère.", dosage: "4-6 ml/L | 2 fois par semaine", avantages: ["Concentration maximale Ca", "Fermeté fruits +25%", "Prévient la brûlure apicale"], subcategoryLabel: "Correcteur de Carences" },
        ],
      },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// PRO → GAZON
// ══════════════════════════════════════════════════════════════════════════════
const proGazonCategories: Category[] = [
  {
    id: "gazon-support",
    name: "Support de Culture",
    color: FV_COLORS.support,
    Icon: Icons.Shovel,
    subcategories: [
      {
        id: "gazon-support-produits",
        name: "Produits",
        products: [
          { id: "gazon-terreau", name: "Terreau", formats: ["30L", "50L"], code: "FV-T-GAZ", description: "Substrat spécial gazon et pelouse, excellente rétention hydrique et drainage.", composition: "Tourbe brune, sable de rivière, chaux dolomitique.", usage: "Semis gazon, regarnissage, terrain de sport.", dosage: "5 cm d'épaisseur sur sol préparé", avantages: ["Spécial gazon", "Drainage optimal", "pH neutre 6.5"] },
          { id: "gazon-fumier", name: "Fumier", formats: ["40L", "50L"], code: "FV-FM-GAZ", description: "Fumier enrichi idéal pour améliorer la structure du sol des surfaces gazonnées.", composition: "Fumier bovin composté + compost végétal.", usage: "Amendement des pelouses existantes.", dosage: "3 kg/m²", avantages: ["Enrichit en matière organique", "Libération lente", "Améliore la tenue"] },
          { id: "gazon-composte", name: "Composte", formats: ["40L", "50L"], code: "FV-CP-GAZ", description: "Composte végétal pour améliorer la structure du sol des surfaces gazonnées.", composition: "Déchets verts compostés, matière organique 40%.", usage: "Amélioration sol avant engazonnement.", dosage: "2 kg/m²", avantages: ["100% végétal", "Sol drainant et fertile", "Écologique"] },
        ],
      },
    ],
  },
  {
    id: "gazon-fond",
    name: "Engrais de Fond",
    color: FV_COLORS.engraisFond,
    Icon: Icons.Drop,
    subcategories: [
      {
        id: "gazon-fond-produits",
        name: "Produits",
        products: [
          { id: "gazon-ferti-fond", name: "Ferti Fond", formats: ["5KG", "10KG", "25KG"], code: "FV-FF-GAZ", description: "Engrais de fond longue durée spécial gazon et pelouses sportives.", composition: "N-P-K 12-8-16 + Fe + retardateur de libération.", usage: "Engrais de fond avant semis gazon.", dosage: "40-60 g/m²", avantages: ["Libération prolongée 4 mois", "Fortifie les racines", "Verdissement durable"] },
          { id: "gazon-ferti-fumure", name: "Ferti Fumure", formats: ["10KG", "25KG"], code: "FV-FFM-GAZ", description: "Fumure organique adaptée aux surfaces gazonnées. Action prolongée et douce.", composition: "Matière organique 60% + N-P-K 4-2-5.", usage: "Fumure de fond bio pour gazon.", dosage: "60-80 g/m²", avantages: ["Action biologique prolongée", "Pas de brûlure", "Renforce la résistance"] },
        ],
      },
    ],
  },
  {
    id: "gazon-organique",
    name: "Engrais Organique",
    color: FV_COLORS.engraisOrg,
    Icon: Icons.Leaf,
    subcategories: [
      {
        id: "gazon-org-granule",
        name: "Granulé",
        products: [
          { id: "gazon-fertimax", name: "FertiMax", formats: ["1KG", "5KG", "10KG"], code: "FV-FMX-GAZ", description: "Engrais organique granulé premium pour gazon. Verdissement intense et durable.", composition: "Matière organique 70% + N 8% + Fe chélaté.", usage: "Engrais de croissance gazon.", dosage: "30-50 g/m² tous les 2 mois", avantages: ["Verdissement en 7 jours", "Pas de brûlure", "Longue durée d'action"] },
        ],
      },
      {
        id: "gazon-org-liquide",
        name: "Liquide",
        products: [
          { id: "gazon-fertiactif", name: "FertiActif", formats: ["1L", "5L", "20L"], code: "FV-FA-GAZ", description: "Stimulant liquide pour gazon. Verdissement rapide garanti dès la première application.", composition: "N 6% + Fe 3% + acides aminés + algues.", usage: "Application régulière sur gazon.", dosage: "5 ml/L en arrosage | Tous les 15 jours", avantages: ["Verdissement en 5 jours", "Stimule la densité", "Améliore la résistance sécheresse"] },
          { id: "gazon-fertitop", name: "FertiTop", formats: ["1L", "5L", "20L"], code: "FV-FT-GAZ", description: "Formule premium pour pelouses de prestige et gazons sportifs. Résistance à la sécheresse.", composition: "N 8% + K₂O 6% + Fe + Si + acides aminés.", usage: "Gazon de prestige et sportif.", dosage: "6 ml/L | Tous les 10 jours en saison", avantages: ["Résistance accrue à la sécheresse", "Feuillage dense et vert foncé", "Effet longue durée"] },
          { id: "gazon-fertigo", name: "FertiGo", formats: ["1L", "5L", "20L"], code: "FV-FGO-GAZ", description: "Boost de croissance après tonte. Repousse rapide et uniforme du gazon.", composition: "N 10% + acides aminés + extraits d'algues.", usage: "Après tonte pour repousse rapide.", dosage: "5 ml/L dès le lendemain de tonte", avantages: ["Repousse en 48h", "Uniformité de la pelouse", "Stimule le tallage"] },
        ],
      },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// GARDEN CATEGORIES
// ══════════════════════════════════════════════════════════════════════════════
const gardenCategories: Category[] = [
  {
    id: "garden-support",
    name: "Support de Culture",
    color: FV_COLORS.support,
    Icon: Icons.Pot,
    subcategories: [
      {
        id: "garden-support-produits",
        name: "Produits",
        products: [
          { id: "garden-terreau", name: "Terreau", formats: ["10L", "20L", "40L"], code: "FV-T-GDN", description: "Terreau universel pour toutes plantes d'intérieur et d'extérieur. Prêt à l'emploi.", composition: "Tourbe, fibre de coco, perlite, engrais starter.", usage: "Rempotage, plantation, semis.", dosage: "Remplissage des pots ou mélange 50/50 avec terre jardin", avantages: ["Universel toutes plantes", "Rétention d'eau optimale", "Enrichi en starter"] },
          { id: "garden-fumier", name: "Fumier", formats: ["20L", "40L"], code: "FV-FM-GDN", description: "Fumier composté sans odeur, idéal pour jardiniers amateurs et potagers.", composition: "Fumier ovin composté, matière organique 35%.", usage: "Amendement potager et massifs.", dosage: "3-4 kg/m²", avantages: ["Sans odeur gênante", "Riche en oligo-éléments", "Améliore la texture"] },
          { id: "garden-composte", name: "Composte", formats: ["20L", "40L"], code: "FV-CP-GDN", description: "Composte végétal pour jardins potagers et ornementaux. Certification bio.", composition: "Déchets verts et alimentaires compostés.", usage: "Fertilisation douce jardins et potagers.", dosage: "2-3 kg/m²", avantages: ["Certifié biologique", "Enrichit le sol en profondeur", "Favorise la biodiversité"] },
        ],
      },
    ],
  },
  {
    id: "garden-fond",
    name: "Engrais de Fond",
    color: FV_COLORS.engraisFond,
    Icon: Icons.Drop,
    subcategories: [
      {
        id: "garden-fond-produits",
        name: "Produits",
        products: [
          { id: "garden-ferti-fond", name: "Ferti Fond", formats: ["2KG", "5KG", "10KG"], code: "FV-FF-GDN", description: "Engrais de fond équilibré pour potagers, massifs et jardins ornementaux.", composition: "N-P-K 8-8-8 + oligo-éléments.", usage: "Fertilisation de fond avant plantation.", dosage: "60-80 g/m²", avantages: ["Équilibre NPK universel", "Longue durée 3 mois", "Sans risque de brûlure"] },
        ],
      },
    ],
  },
  {
    id: "garden-chimiques",
    name: "Engrais Chimiques",
    color: FV_COLORS.engraisChi,
    Icon: Icons.Flask,
    subcategories: [
      {
        id: "garden-granule",
        name: "Granulé",
        conditionnement: "2 KG",
        products: [
          { id: "grd-oliviers", name: "Engrais Oliviers", formats: ["2KG"], code: "FV-EO-GDN", description: "Formule spéciale oliviers. Riche en potassium et bore pour une production optimale.", composition: "N-P-K 7-3-12 + B + Mn.", usage: "Oliviers 2 fois/an printemps et automne.", dosage: "100-150 g/plant", avantages: ["Spécial olivier", "Stimule la fructification", "Renforce la résistance"] },
          { id: "grd-agrumes", name: "Engrais Agrumes", formats: ["2KG"], code: "FV-EA-GDN", description: "Magnésium et fer pour agrumes sains. Feuillage brillant et fruits abondants.", composition: "N-P-K 8-4-8 + Fe + Mg + Mn.", usage: "Citrus 3 fois/an.", dosage: "80-120 g/plant", avantages: ["Prévient la chlorose", "Feuillage brillant", "Production abondante"] },
          { id: "grd-potager", name: "Engrais Potager", formats: ["2KG"], code: "FV-EP-GDN", description: "Équilibré pour légumes. Favorise une croissance vigoureuse et une fructification optimale.", composition: "N-P-K 12-6-8 + Ca + Mg + oligo-éléments.", usage: "Légumes toute la saison.", dosage: "50-80 g/m²", avantages: ["Récoltes généreuses", "Légumes goûteux", "Polyvalent toutes cultures"] },
          { id: "grd-fleurs", name: "Engrais Fleurs", formats: ["2KG"], code: "FV-EF-GDN", description: "Riche en phosphore pour une floraison abondante, longue et colorée.", composition: "N-P-K 6-12-8 + Fe + Mn + B.", usage: "Plantes fleuries tout au long de la saison.", dosage: "30-50 g/m²", avantages: ["Floraison prolongée", "Couleurs intenses", "Formation de boutons floraux"] },
          { id: "grd-arbres", name: "Engrais Arbres", formats: ["2KG"], code: "FV-ER-GDN", description: "Action longue durée pour arbres d'ornement, fruitiers et haies.", composition: "N-P-K 10-5-10 + Mg + Fe.", usage: "Arbres et arbustes 2 fois/an.", dosage: "150-200 g/plant selon taille", avantages: ["Libération progressive 6 mois", "Stimule la croissance", "Renforce le système racinaire"] },
          { id: "grd-geraniums", name: "Engrais Géraniums", formats: ["2KG"], code: "FV-EG-GDN", description: "Spécialement formulé pour géraniums et pélargoniums. Floraison continue.", composition: "N-P-K 7-10-10 + Fe + Mn.", usage: "Géraniums et pélargoniums toute la saison.", dosage: "40-60 g pot de 20cm", avantages: ["Floraison ininterrompue", "Tiges robustes", "Résistance aux maladies"] },
          { id: "grd-universel", name: "Engrais Universel", formats: ["2KG"], code: "FV-EU-GDN", description: "Formule universelle pour toutes plantes. Balcon, jardin, intérieur.", composition: "N-P-K 8-8-8 + oligo-éléments complets.", usage: "Toutes plantes d'intérieur et d'extérieur.", dosage: "30-60 g/pot ou /m²", avantages: ["Usage universel", "Simple et efficace", "Adapté débutants et experts"] },
          { id: "grd-gazon", name: "Engrais Gazon", formats: ["2KG"], code: "FV-EGZ-GDN", description: "Vert intense garanti. Résistance à la sécheresse et densification du gazon.", composition: "N-P-K 15-5-8 + Fe + retardateur.", usage: "Gazon jardin 3-4 fois par an.", dosage: "30-40 g/m²", avantages: ["Verdissement en 7 jours", "Densifie la pelouse", "Résistance sécheresse"] },
        ],
      },
      {
        id: "garden-soluble",
        name: "Soluble",
        products: [
          // 750g
          { id: "sol-agrumes-750", name: "Agrumes 750g", formats: ["750G"], code: "FV-SA-750", description: "Engrais hydrosoluble spécial agrumes. Dissolution instantanée, absorption immédiate.", composition: "N-P-K 15-7-18 + Fe + Mg + Mn.", usage: "Arrosage ou pulvérisation foliaire agrumes.", dosage: "2-3 g/L | Tous les 15 jours", avantages: ["Dissolution parfaite", "Absorption rapide", "Visible en 5 jours"] },
          { id: "sol-legumes-750", name: "Légumes 750g", formats: ["750G"], code: "FV-SL-750", description: "Micro-éléments inclus pour légumes sains et productifs tout au long de la saison.", composition: "N-P-K 20-8-15 + Ca + Mg + oligo-éléments.", usage: "Légumes en pleine terre ou hors sol.", dosage: "2 g/L | Toutes les semaines", avantages: ["Croissance rapide", "Rendement accru", "Qualité nutritionnelle"] },
          { id: "sol-fruitiers-750", name: "Fruitiers 750g", formats: ["750G"], code: "FV-SF-750", description: "Grossissement et qualité optimisés pour arbres fruitiers.", composition: "N-P-K 12-6-18 + B + Ca.", usage: "Arbres fruitiers en période de fructification.", dosage: "3 g/L | Toutes les 2 semaines", avantages: ["Grossissement fruits", "Saveur améliorée", "Conservation prolongée"] },
          // 500g
          { id: "sol-fertivit-1313", name: "Fertivit 13.40.13", formats: ["500G"], code: "FV-FV1-500", description: "Riche en phosphore pour floraison et fructification. Stimule la mise à fruit.", composition: "N 13% + P₂O₅ 40% + K₂O 13%.", usage: "Floraison et nouaison des fruits.", dosage: "2 g/L | En début floraison", avantages: ["Stimule la floraison", "Améliore la nouaison", "Fruits nombreux et calibrés"] },
          { id: "sol-fertivit-2020", name: "Fertivit 20.20.20", formats: ["500G"], code: "FV-FV2-500", description: "NPK parfaitement équilibré pour croissance harmonieuse de toutes plantes.", composition: "N 20% + P₂O₅ 20% + K₂O 20% + oligo-éléments.", usage: "Croissance générale toutes plantes.", dosage: "2 g/L | Toutes les 2 semaines", avantages: ["Équilibre parfait", "Universel", "Croissance harmonieuse"] },
        ],
      },
      {
        id: "garden-liquide",
        name: "Liquide",
        conditionnement: "1 L",
        products: [
          { id: "liq-universel", name: "Universel 1L", formats: ["1L"], code: "FV-LU-1", description: "Solution universelle prête à l'emploi. Toutes plantes d'intérieur et d'extérieur.", composition: "N-P-K 3-1-4 + oligo-éléments en solution.", usage: "Arrosage ou pulvérisation toutes plantes.", dosage: "Cap/2L eau | Toutes les 2 semaines", avantages: ["Prêt à l'emploi", "Usage universel", "Dosage facile"] },
          { id: "liq-plantes-vert", name: "Plantes Vertes 1L", formats: ["1L"], code: "FV-LPV-1", description: "Vert profond garanti. Feuillage luxuriant, brillant et sain.", composition: "N 4% + Mg + Fe chélate + azote organique.", usage: "Plantes à feuillage intérieur et extérieur.", dosage: "Cap/2L eau | Toutes les 2 semaines", avantages: ["Vert intense", "Feuillage brillant", "Prévient le jaunissement"] },
          { id: "liq-palmiers", name: "Palmiers d'Intérieurs 1L", formats: ["1L"], code: "FV-LPI-1", description: "Manganèse et magnésium pour palmiers et plantes tropicales.", composition: "N-P-K 2-1-5 + Mn + Mg + Fe.", usage: "Palmiers, dracénas, yuccas.", dosage: "Cap/2L | Tous les mois", avantages: ["Spécial palmiers", "Prévient carence Mn", "Frondes saines"] },
          { id: "liq-cactees", name: "Plantes Grasses Cactées 1L", formats: ["1L"], code: "FV-LGC-1", description: "Faible en azote, adapté aux cactus, succulentes et plantes grasses.", composition: "N-P-K 1-2-5 + oligo-éléments trace.", usage: "Cactus, agaves, succulentes.", dosage: "Cap/2L | 1 fois/mois", avantages: ["Formule basse azote", "Favorise la floraison", "Évite la pourriture"] },
          { id: "liq-fleuries", name: "Plantes Fleuries 1L", formats: ["1L"], code: "FV-LPF-1", description: "Floraison prolongée. Couleurs vives et éclatantes tout au long de la saison.", composition: "N-P-K 2-4-4 + Fe + Mn + B.", usage: "Toutes plantes fleuries en pots ou massifs.", dosage: "Cap/2L | Toutes les semaines en floraison", avantages: ["Floraison continue", "Couleurs intenses", "Boutons floraux nombreux"] },
          { id: "liq-agrumes-1l", name: "Agrumes 1L", formats: ["1L"], code: "FV-LA-1", description: "Formule complète pour citrus en pot. Fructification améliorée, saveur optimisée.", composition: "N-P-K 3-2-5 + Fe + Mg + Mn.", usage: "Citrus en pots: citronnier, oranger, mandarinier.", dosage: "Cap/2L | Toutes les 2 semaines", avantages: ["Feuillage vert foncé", "Fruits abondants", "Saveur améliorée"] },
          { id: "liq-geraniums", name: "Géraniums 1L", formats: ["1L"], code: "FV-LGR-1", description: "Floraison continue et abondante pour géraniums et pélargoniums.", composition: "N-P-K 2-4-5 + Fe + B.", usage: "Géraniums, pélargoniums, fuchsias.", dosage: "Cap/2L | Toutes les semaines", avantages: ["Floraison non-stop", "Ombelles généreuses", "Tiges robustes"] },
        ],
      },
    ],
  },
  {
    id: "garden-organique",
    name: "Engrais Organiques",
    color: FV_COLORS.engraisOrg,
    Icon: Icons.Recycle,
    subcategories: [
      {
        id: "garden-org-250",
        name: "250G",
        conditionnement: "250 G",
        products: [
          { id: "garden-ferti-fort", name: "Ferti Fort", formats: ["250G"], code: "FV-FFT-250", description: "Humus de ver ultra-concentré. Richesse organique naturelle pour tous types de plantes.", composition: "Humus lombric 90% + enzymes + micro-organismes.", usage: "Amendement organique concentré.", dosage: "10-15 g/L arrosage | 50g/m²", avantages: ["Ultra-concentré", "100% naturel", "Active la vie du sol"] },
        ],
      },
      {
        id: "garden-org-500",
        name: "500G",
        conditionnement: "500 G",
        products: [
          { id: "garden-ferti-micro", name: "Ferti Micro", formats: ["500G"], code: "FV-FMI-500", description: "Micro-organismes bénéfiques pour sol vivant et actif. Améliore l'absorption des nutriments.", composition: "Mycorhizes + bactéries PGPR + acides humiques.", usage: "Amendement biologique régulier.", dosage: "20-30 g/m² | Ou en arrosage 5g/L", avantages: ["Sol biologiquement actif", "Absorption nutriments x2", "Améliore la structure"] },
        ],
      },
      {
        id: "garden-org-1kg",
        name: "1KG",
        conditionnement: "1 KG",
        products: [
          { id: "garden-ferti-max", name: "Ferti Max", formats: ["1KG"], code: "FV-FMXG-1KG", description: "Engrais organique premium gamme Garden. Résultats visibles en 7 jours garantis.", composition: "NPK organique 5-4-3 + humus + micro-organismes.", usage: "Fertilisation organique complète jardin.", dosage: "80-100 g/m²", avantages: ["Résultats en 7 jours", "Formule complète", "Certifié biologique"] },
        ],
      },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// EXPORT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export const GAMMES: Gamme[] = [
  {
    id: "pro",
    name: "Fertivert Pro",
    dark: FV_COLORS.proDark,
    mid: FV_COLORS.proMid,
    pale: FV_COLORS.proPale,
    heroGrad: `linear-gradient(135deg, #0D2918 0%, ${FV_COLORS.proDark} 40%, ${FV_COLORS.proMid} 80%, ${FV_COLORS.proLight} 100%)`,
    divisions: [
      {
        id: "pro-agri",
        name: "Agriculture",
        subtitle: "Solutions pour l'agriculture professionnelle",
        dark: FV_COLORS.proDark,
        mid: FV_COLORS.proMid,
        light: FV_COLORS.proLight,
        pale: FV_COLORS.proPale,
        heroGrad: `linear-gradient(135deg, #0D2918 0%, ${FV_COLORS.proDark} 40%, ${FV_COLORS.proMid} 80%, ${FV_COLORS.proLight} 100%)`,
        categories: proAgriCategories,
      },
      {
        id: "pro-gazon",
        name: "Gazon",
        subtitle: "Gamme spécialisée pelouses et gazons",
        dark: "#1A4D28",
        mid: "#2E7050",
        light: "#4A9E6C",
        pale: "#E5F4EC",
        heroGrad: "linear-gradient(135deg, #0A2010 0%, #1A4D28 40%, #2E7050 80%, #4A9E6C 100%)",
        categories: proGazonCategories,
      },
    ],
  },
  {
    id: "garden",
    name: "Fertivert Garden",
    dark: FV_COLORS.gardenDark,
    mid: FV_COLORS.gardenMid,
    pale: FV_COLORS.gardenPale,
    heroGrad: `linear-gradient(135deg, #133015 0%, ${FV_COLORS.gardenDark} 40%, ${FV_COLORS.gardenMid} 80%, ${FV_COLORS.gardenLight} 100%)`,
    categories: gardenCategories,
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════
export type FlatProduct = Product & {
  catId: string;
  catName: string;
  catColor: string;
  CatIcon: (props: any) => JSX.Element;
  subId?: string;
  subName?: string;
  conditionnement?: string;
  gammeId: string;
  gammeName: string;
  divisionId?: string;
  divisionName?: string;
};

export function flattenAll(gammeId: "pro" | "garden", divisionId?: string): FlatProduct[] {
  const gamme = GAMMES.find(g => g.id === gammeId)!;
  const results: FlatProduct[] = [];

  function processCategory(cat: Category, gammeName: string, divId?: string, divName?: string) {
    const base = {
      catId: cat.id,
      catName: cat.name,
      catColor: cat.color,
      CatIcon: cat.Icon,
      gammeId,
      gammeName,
      divisionId: divId,
      divisionName: divName,
    };

    if (cat.products) {
      cat.products.forEach(p => results.push({ ...p, ...base }));
    }

    if (cat.subcategories) {
      cat.subcategories.forEach(sub => {
        sub.products.forEach(p =>
          results.push({
            ...p,
            ...base,
            subId: sub.id,
            subName: sub.name,
            conditionnement: sub.conditionnement,
          })
        );
      });
    }
  }

  if (gamme.divisions) {
    gamme.divisions
      .filter(div => !divisionId || div.id === divisionId)
      .forEach(div => {
        div.categories.forEach(cat => processCategory(cat, gamme.name, div.id, div.name));
      });
  } else if (gamme.categories) {
    gamme.categories.forEach(cat => processCategory(cat, gamme.name));
  }

  return results;
}

export function countCategoryProducts(cat: Category): number {
  return (
    (cat.products?.length ?? 0) +
    (cat.subcategories ?? []).reduce((sum, sub) => sum + sub.products.length, 0)
  );
}

export function getGamme(id: "pro" | "garden"): Gamme {
  return GAMMES.find(g => g.id === id)!;
}