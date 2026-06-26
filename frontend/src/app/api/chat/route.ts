// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatAction {
  label: string;
  href?: string;
  type: "link" | "suggestion";
}

interface ChatPayload {
  reply: string;
  actions: ChatAction[];
}

type ApiEnvelope<T> = T | { data?: T; meta?: unknown };

interface NamedEntity {
  nom: string;
  slug: string;
  description?: string | null;
  actif?: boolean;
}

interface Marque extends NamedEntity {
  id_marque: number;
  type_marque?: "groupe" | "partenaire" | string;
}

interface Activite extends NamedEntity {
  id_activite: number;
}

interface Categorie extends NamedEntity {
  id_categorie: number;
  parent_id?: number | null;
  marque?: Pick<Marque, "nom" | "slug"> | null;
  activite?: Pick<Activite, "nom" | "slug"> | null;
  sous_cats?: Categorie[];
  _count?: { produits?: number; sous_cats?: number };
}

interface Produit extends NamedEntity {
  id_produit: number;
  division?: string | null;
  tags?: string[] | null;
  fiche_technique?: string | null;
  marque?: Pick<Marque, "nom" | "slug"> | null;
  categorie?: (Pick<Categorie, "nom" | "slug"> & {
    parent?: Pick<Categorie, "nom" | "slug"> | null;
    activite?: Pick<Activite, "nom" | "slug"> | null;
  }) | null;
}

interface Faq {
  question: string;
  reponse: string;
  rubrique?: string | null;
  active?: boolean;
}

interface SiteSection {
  nom: string;
  href: string;
  motsCles: string[];
  description: string;
}

interface SiteKnowledge {
  produits: Produit[];
  marques: Marque[];
  activites: Activite[];
  categories: Categorie[];
  faqs: Faq[];
  sections: SiteSection[];
}

const SITE_SECTIONS: SiteSection[] = [
  {
    nom: "Accueil",
    href: "/",
    motsCles: ["accueil", "home", "presentation", "groupe espace vert"],
    description: "Vue generale du Groupe Espace Vert et acces rapide aux activites.",
  },
  {
    nom: "Activites",
    href: "/activites",
    motsCles: ["activites", "metiers", "irrigation", "fertilisation", "semences", "pulverisation"],
    description: "Toutes les activites: irrigation, fertilisation, semences et plants, pulverisation.",
  },
  {
    nom: "Marques",
    href: "/marques",
    motsCles: ["marques", "fertivert", "pulvert", "matar", "partenaires"],
    description: "Marques du groupe et marques partenaires.",
  },
  {
    nom: "Demande de devis",
    href: "/devis",
    motsCles: ["devis", "prix", "tarif", "cout", "commande", "acheter"],
    description: "Formulaire pour recevoir une offre adaptee.",
  },
  {
    nom: "Rendez-vous",
    href: "/rendez-vous",
    motsCles: ["rendez-vous", "rdv", "bureau etude", "installation", "visite"],
    description: "Prise de rendez-vous avec l'equipe Espace Vert.",
  },
  {
    nom: "Contact",
    href: "/contact",
    motsCles: ["contact", "telephone", "email", "message", "coordonnees"],
    description: "Contact direct avec l'equipe.",
  },
  {
    nom: "Qui sommes-nous",
    href: "/qui-sommes-nous",
    motsCles: ["qui sommes nous", "agences", "societes", "histoire", "carte", "adresse"],
    description: "Presentation du groupe, agences et carte.",
  },
  {
    nom: "Actualites & Conseils",
    href: "/actualites",
    motsCles: ["actualites", "conseils", "articles", "news"],
    description: "Articles, conseils techniques et informations.",
  },
];

const MAX_CONTEXT_CHARS = 15_000;

function unwrapArray<T>(json: ApiEnvelope<T[]>): T[] {
  if (Array.isArray(json)) return json;
  if (json && typeof json === "object" && Array.isArray((json as { data?: unknown }).data)) {
    return (json as { data: T[] }).data;
  }
  return [];
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const QUERY_EXPANSIONS: Array<[string, string[]]> = [
  ["pelouse", ["gazon", "semences gazon", "jardin", "espace vert"]],
  ["gazon", ["pelouse", "semences gazon", "jardin", "espace vert"]],
  ["seche", ["sec", "secheresse", "chaleur", "chaud", "resistant", "tunisie"]],
  ["sec", ["seche", "secheresse", "chaleur", "chaud", "resistant", "tunisie"]],
  ["secheresse", ["sec", "seche", "chaleur", "chaud", "resistant", "tunisie"]],
  ["carotte", ["semences", "semence", "potager", "potageres", "legumes", "maraicheres", "garden"]],
  ["semence", ["semences", "graines", "plants", "potager", "maraicheres"]],
  ["semences", ["semence", "graines", "plants", "potager", "maraicheres"]],
  ["بذور", ["semences", "semence", "graines", "plants"]],
  ["البذور", ["semences", "semence", "graines", "plants"]],
  ["جزر", ["carotte", "semences", "potager", "legumes", "maraicheres"]],
  ["الجزر", ["carotte", "semences", "potager", "legumes", "maraicheres"]],
  ["عشب", ["gazon", "pelouse", "semences gazon"]],
  ["نجيل", ["gazon", "pelouse", "semences gazon"]],
  ["حديقة", ["jardin", "pelouse", "gazon", "espace vert"]],
  ["سخانة", ["chaleur", "chaud", "sec", "secheresse", "resistant"]],
  ["سخون", ["chaleur", "chaud", "sec", "secheresse", "resistant"]],
  ["ناشف", ["sec", "seche", "secheresse", "resistant"]],
];

function expandForSearch(value: string): string {
  const normalized = normalize(value);
  if (!normalized) return "";

  const additions = new Set<string>();
  for (const [needle, terms] of QUERY_EXPANSIONS) {
    if (normalized.includes(normalize(needle))) {
      terms.forEach((term) => additions.add(normalize(term)));
    }
  }

  return [normalized, ...additions].filter(Boolean).join(" ");
}

function short(value?: string | null, max = 150): string {
  if (!value) return "";
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function productHref(product: Produit): string {
  const productSlug = product.slug;
  const marqueSlug = product.marque?.slug;
  const activiteSlug = product.categorie?.activite?.slug;

  if (activiteSlug && marqueSlug) return `/activites/${activiteSlug}/${marqueSlug}/${productSlug}`;
  if (marqueSlug) return `/marques/${marqueSlug}/produits/${productSlug}`;
  if (activiteSlug) return `/activites/${activiteSlug}/produits/${productSlug}`;
  return "/activites";
}

function categoryHref(category: Categorie): string {
  return `/categories/${category.slug}`;
}

function scoreText(query: string, haystack: string): number {
  const q = expandForSearch(query);
  const h = expandForSearch(haystack);
  if (!q || !h) return 0;
  if (h.includes(q)) return 12 + Math.min(q.length / 6, 8);

  const words = q.split(" ").filter((w) => w.length > 2);
  return words.reduce((score, word) => score + (h.includes(word) ? 2 : 0), 0);
}

// Score spécialisé FAQ — favorise les correspondances partielles sur les questions longues
function scoreFaq(query: string, faq: Faq): number {
  const qNorm  = expandForSearch(query);
  const qWords = qNorm.split(" ").filter((w) => w.length > 2);
  if (!qWords.length) return 0;

  const questionNorm = expandForSearch(faq.question);
  const reponseNorm  = expandForSearch(faq.reponse);
  const rubriqueNorm = expandForSearch(faq.rubrique ?? "");

  // Correspondance exacte de la question normalisée
  if (questionNorm.includes(qNorm)) return 20;

  // Score par mots-clés présents dans la question
  const matchInQuestion = qWords.filter((w) => questionNorm.includes(w)).length;
  const matchInReponse  = qWords.filter((w) => reponseNorm.includes(w)).length;
  const matchInRubrique = qWords.filter((w) => rubriqueNorm.includes(w)).length;

  const coverage = matchInQuestion / qWords.length;

  // Au moins 50% des mots de la requête dans la question → score élevé
  if (coverage >= 0.5) return Math.round(coverage * 14) + matchInReponse + matchInRubrique;

  // Quelques mots matchent
  return matchInQuestion * 2 + matchInReponse + matchInRubrique;
}

function topMatches<T>(items: T[], query: string, render: (item: T) => string, limit: number): T[] {
  return items
    .map((item) => ({ item, score: scoreText(query, render(item)) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function wantsPriceOrQuote(message: string): boolean {
  return /\b(prix|tarif|devis|cout|co[uû]t|combien|acheter|commande|disponibilit[eé]|stock)\b/i.test(message);
}

function isGreeting(message: string): boolean {
  const normalized = normalize(message);
  if (!normalized) return false;

  const greetings = [
    "bonjour",
    "bonsoir",
    "salut",
    "coucou",
    "hello",
    "hi",
    "hey",
    "salam",
    "slm",
    "ahla",
    "ahlan",
    "marhba",
    "marhaba",
    "aslema",
    "asslema",
    "sabah el khir",
    "sbeh el khir",
    "مساء الخير",
    "صباح الخير",
    "مرحبا",
    "أهلا",
    "اهلا",
    "سلام",
    "السلام عليكم",
  ];

  return greetings.some((greeting) => normalized === normalize(greeting) || normalized.startsWith(`${normalize(greeting)} `));
}

function buildGreetingAnswer(message: string): ChatPayload {
  const arabic = isArabic(message) || /\b(salam|slm|ahla|ahlan|marhba|marhaba|aslema|asslema)\b/i.test(message);

  return {
    reply: arabic
      ? "مرحباً، أنا مساعد شركة الفضاء الاخضر. أستطيع مساعدتك في المنتجات، العلامات، الأنشطة، البذور، الري، التسميد والتعريف بالمجموعة."
      : "Bonjour, je suis l'assistant du Groupe Espace Vert. Je peux vous guider vers nos produits, nos marques, nos activites ou vous presenter le groupe.",
    actions: [
      { label: arabic ? "المنتجات والأنشطة" : "Voir les produits", href: "/activites", type: "link" },
      { label: arabic ? "العلامات" : "Voir les marques", href: "/marques", type: "link" },
    ],
  };
}

function isProductsOverviewRequest(message: string): boolean {
  const normalized = normalize(message);
  if (!normalized) return false;

  const productWords = /\b(produits?|catalogue|gamme|articles?|منتجات|المنتجات|produit)\b/i.test(normalized);
  const broadIntent = /\b(tous|toutes|liste|affiche|afficher|montre|montrer|quels|quoi|disponibles?|proposez|avez|شنوة|شنو|اعرض|اريني|كل)\b/i.test(normalized);
  const onlyProductWord = ["produit", "produits", "catalogue", "المنتجات", "منتجات"].includes(normalized);

  return onlyProductWord || (productWords && broadIntent);
}

function isAboutCompanyRequest(message: string): boolean {
  const normalized = normalize(message);
  if (!normalized) return false;

  return (
    /\b(qui etes vous|qui êtes vous|qui sommes nous|presentation|presentez vous|historique|histoire|groupe espace vert|a propos|apropos)\b/i.test(normalized)
    || /من انتم|من نحن|عرفني|تعريف/.test(message)
  );
}

function buildAboutCompanyAnswer(message: string): ChatPayload {
  const arabic = isArabic(message);

  return {
    reply: arabic
      ? "Espace Vert est un groupe tunisien specialise dans les solutions agricoles: semences, irrigation, fertilisation, pulverisation et espaces verts. La page Qui sommes-nous presente le groupe, son histoire et ses agences."
      : "Espace Vert est un groupe tunisien specialise dans les solutions agricoles: semences, irrigation, fertilisation, pulverisation et espaces verts. Vous pouvez consulter la page Qui sommes-nous pour decouvrir le groupe, son histoire et ses agences.",
    actions: [{ label: arabic ? "من نحن" : "Qui sommes-nous", href: "/qui-sommes-nous", type: "link" }],
  };
}

function findExactProductByName(products: Produit[], message: string): Produit | null {
  const normalizedMessage = normalize(message);
  if (!normalizedMessage) return null;

  return products
    .filter((product) => {
      const name = normalize(product.nom);
      const slug = normalize(product.slug.replace(/-/g, " "));
      const messageWords = normalizedMessage.split(" ").filter((word) => word.length >= 3);
      return (
        name.length >= 3
        && (
          normalizedMessage === name
          || normalizedMessage.includes(name)
          || normalizedMessage.includes(slug)
          || name.includes(normalizedMessage)
          || slug.includes(normalizedMessage)
          || messageWords.some((word) => name.includes(word) || slug.includes(word))
        )
      );
    })
    .sort((a, b) => normalize(b.nom).length - normalize(a.nom).length)[0] ?? null;
}

async function findProductBySearch(message: string): Promise<Produit | null> {
  const normalizedMessage = normalize(message);
  const term = normalizedMessage.split(" ").find((word) => word.length >= 3);
  if (!term) return null;

  const json = await getJson<ApiEnvelope<Produit[]>>(`/produits?search=${encodeURIComponent(term)}&limit=10`);
  const products = unwrapArray(json ?? []);
  return findExactProductByName(products, message) ?? products[0] ?? null;
}

function buildProductAnswer(product: Produit, message: string): ChatPayload {
  const arabic = isArabic(message);
  const actions: ChatAction[] = [{ label: arabic ? "عرض المنتج" : `Voir ${product.nom}`, href: productHref(product), type: "link" }];
  if (wantsPriceOrQuote(message)) {
    actions.push({ label: arabic ? "طلب عرض سعر" : "Demander un devis", href: "/devis", type: "link" });
  }

  const details = [
    product.marque?.nom ? `marque ${product.marque.nom}` : "",
    product.categorie?.nom ? `categorie ${product.categorie.nom}` : "",
    product.categorie?.activite?.nom ? `activite ${product.categorie.activite.nom}` : "",
  ].filter(Boolean).join(", ");

  return {
    reply: arabic
      ? `وجدت المنتج ${product.nom}${details ? ` (${details})` : ""}. يمكنني توجيهك إلى صفحته.`
      : `J'ai trouve ${product.nom}${details ? ` (${details})` : ""}. Vous pouvez ouvrir sa fiche produit.`,
    actions: actions.slice(0, 2),
  };
}

function messageMentionsEntity(entity: NamedEntity, message: string): boolean {
  const normalizedMessage = normalize(message);
  if (!normalizedMessage) return false;

  const terms = [
    normalize(entity.nom),
    normalize(entity.slug.replace(/-/g, " ")),
  ].filter((term) => term.length >= 3);

  return terms.some((term) => (
    normalizedMessage === term
    || normalizedMessage.includes(term)
    || (normalizedMessage.length >= 4 && term.includes(normalizedMessage))
  ));
}

function buildDirectEntityPageAnswer(message: string, knowledge: SiteKnowledge): ChatPayload | null {
  const arabic = isArabic(message);
  const marque = knowledge.marques.find((m) => messageMentionsEntity(m, message));
  if (marque) {
    const products = knowledge.produits.filter((p) => p.marque?.slug === marque.slug);
    const sample = products.slice(0, 4).map((p) => p.nom).join(", ");
    const details = [
      marque.description ? short(marque.description, 120) : "",
      products.length ? `${products.length} produit${products.length > 1 ? "s" : ""} associe${products.length > 1 ? "s" : ""}` : "",
      sample ? `exemples: ${sample}` : "",
    ].filter(Boolean).join(". ");

    return {
      reply: arabic
        ? `${marque.nom}: ${details || "page marque disponible dans le catalogue."}`
        : `${marque.nom}: ${details || "page marque disponible dans le catalogue."}`,
      actions: [{ label: arabic ? "عرض صفحة العلامة" : `Voir la page ${marque.nom}`, href: `/marques/${marque.slug}`, type: "link" }],
    };
  }

  const activite = knowledge.activites.find((a) => messageMentionsEntity(a, message));
  if (activite) {
    const products = knowledge.produits.filter((p) => p.categorie?.activite?.slug === activite.slug);
    const sample = products.slice(0, 4).map((p) => p.nom).join(", ");
    const details = [
      activite.description ? short(activite.description, 120) : "",
      products.length ? `${products.length} produit${products.length > 1 ? "s" : ""} lie${products.length > 1 ? "s" : ""}` : "",
      sample ? `exemples: ${sample}` : "",
    ].filter(Boolean).join(". ");

    return {
      reply: arabic
        ? `${activite.nom}: ${details || "page activite disponible dans le catalogue."}`
        : `${activite.nom}: ${details || "page activite disponible dans le catalogue."}`,
      actions: [{ label: arabic ? "عرض صفحة النشاط" : `Voir la page ${activite.nom}`, href: `/activites/${activite.slug}`, type: "link" }],
    };
  }

  return null;
}

function firstNames(items: Produit[], max = 4): string {
  return items.slice(0, max).map((product) => product.nom).join(", ");
}

function buildProductsOverviewAnswer(knowledge: SiteKnowledge, message: string): ChatPayload {
  const arabic = isArabic(message);
  const activeProducts = knowledge.produits;

  const marqueLines = knowledge.marques
    .map((marque) => {
      const products = activeProducts.filter((product) => product.marque?.slug === marque.slug);
      return products.length ? `- ${marque.nom}: ${firstNames(products)}` : "";
    })
    .filter(Boolean)
    .slice(0, 5);

  const activiteLines = knowledge.activites
    .map((activite) => {
      const products = activeProducts.filter((product) => product.categorie?.activite?.slug === activite.slug);
      return products.length ? `- ${activite.nom}: ${firstNames(products)}` : "";
    })
    .filter(Boolean)
    .slice(0, 5);

  if (!marqueLines.length && !activiteLines.length) {
    return {
      reply: arabic
        ? "لم أتمكن من تحميل قائمة المنتجات حالياً. يمكن لفريقنا مساعدتك مباشرة."
        : "Je n'arrive pas a charger la liste des produits pour le moment. Notre equipe peut vous guider directement.",
      actions: [{ label: "Nous contacter", href: "/contact", type: "link" }],
    };
  }

  const reply = arabic
    ? [
        "هذه لمحة عن المنتجات حسب العلامات والأنشطة:",
        marqueLines.length ? `حسب العلامات:\n${marqueLines.join("\n")}` : "",
        activiteLines.length ? `حسب الأنشطة:\n${activiteLines.join("\n")}` : "",
      ].filter(Boolean).join("\n\n")
    : [
        "Voici un apercu des produits classes par marques et par activites:",
        marqueLines.length ? `Par marques:\n${marqueLines.join("\n")}` : "",
        activiteLines.length ? `Par activites:\n${activiteLines.join("\n")}` : "",
      ].filter(Boolean).join("\n\n");

  return {
    reply,
    actions: [
      { label: arabic ? "الأنشطة والمنتجات" : "Voir par activites", href: "/activites", type: "link" },
      { label: arabic ? "العلامات والمنتجات" : "Voir par marques", href: "/marques", type: "link" },
    ],
  };
}

function flattenCategories(categories: Categorie[]): Categorie[] {
  const flat: Categorie[] = [];
  const visit = (cat: Categorie) => {
    flat.push(cat);
    (cat.sous_cats ?? []).forEach(visit);
  };
  categories.forEach(visit);
  return flat;
}

function formatProductLine(product: Produit): string {
  const bits = [
    product.nom,
    product.marque?.nom ? `marque: ${product.marque.nom}` : "",
    product.categorie?.nom ? `categorie: ${product.categorie.nom}` : "",
    product.categorie?.activite?.nom ? `activite: ${product.categorie.activite.nom}` : "",
    product.description ? `description: ${short(product.description, 120)}` : "",
    product.tags?.length ? `tags: ${product.tags.join(", ")}` : "",
    product.fiche_technique ? "fiche technique disponible" : "",
  ].filter(Boolean);

  return `- ${bits.join(" | ")} | lien: ${productHref(product)}`;
}

function formatKnowledgeContext(knowledge: SiteKnowledge, message: string): string {
  const matchedProducts = topMatches(
    knowledge.produits,
    message,
    (p) => `${p.nom} ${p.description ?? ""} ${p.tags?.join(" ") ?? ""} ${p.marque?.nom ?? ""} ${p.categorie?.nom ?? ""} ${p.categorie?.activite?.nom ?? ""}`,
    18,
  );

  const matchedMarques = topMatches(
    knowledge.marques,
    message,
    (m) => `${m.nom} ${m.slug} ${m.description ?? ""} ${m.type_marque ?? ""}`,
    8,
  );

  const matchedActivites = topMatches(
    knowledge.activites,
    message,
    (a) => `${a.nom} ${a.slug} ${a.description ?? ""}`,
    8,
  );

  const matchedCategories = topMatches(
    knowledge.categories,
    message,
    (c) => `${c.nom} ${c.slug} ${c.description ?? ""} ${c.marque?.nom ?? ""} ${c.activite?.nom ?? ""}`,
    10,
  );

  const matchedFaqs = knowledge.faqs
    .map((f) => ({ item: f, score: scoreFaq(message, f) }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((e) => e.item);

  const sections = topMatches(
    knowledge.sections,
    message,
    (s) => `${s.nom} ${s.description} ${s.motsCles.join(" ")}`,
    5,
  );

  const productsByMarque = matchedMarques.flatMap((marque) => {
    const products = knowledge.produits.filter((p) => p.marque?.slug === marque.slug).slice(0, 20);
    return products.length
      ? [`${marque.nom}: ${products.map((p) => p.nom).join(", ")}`]
      : [`${marque.nom}: aucun produit actif trouve dans le contexte charge.`];
  });

  const productsByActivity = matchedActivites.flatMap((activite) => {
    const products = knowledge.produits.filter((p) => p.categorie?.activite?.slug === activite.slug).slice(0, 25);
    return products.length
      ? [`${activite.nom}: ${products.map((p) => p.nom).join(", ")}`]
      : [`${activite.nom}: aucun produit actif trouve dans le contexte charge.`];
  });

  const parts = [
    `STATISTIQUES DU CONTEXTE: ${knowledge.produits.length} produits, ${knowledge.marques.length} marques, ${knowledge.activites.length} activites, ${knowledge.categories.length} categories/sections catalogue, ${knowledge.faqs.length} FAQ.`,
    // FAQ EN PRIORITÉ — toujours en tête pour ne pas être coupée par MAX_CONTEXT_CHARS
    matchedFaqs.length
      ? `FAQ PERTINENTES (repondre fidelement si la question correspond):\n${matchedFaqs.map((f) => `Q: ${f.question}\nR: ${f.reponse}${f.rubrique ? `\nRubrique: ${f.rubrique}` : ""}`).join("\n\n")}`
      : "",
    knowledge.marques.length
      ? `TOUTES LES MARQUES REELLES DU SITE:\n${knowledge.marques.map((m) => `- ${m.nom} | lien: /marques/${m.slug}`).join("\n")}`
      : "",
    knowledge.activites.length
      ? `TOUTES LES ACTIVITES REELLES DU SITE:\n${knowledge.activites.map((a) => `- ${a.nom} | lien: /activites/${a.slug}`).join("\n")}`
      : "",
    matchedProducts.length ? `PRODUITS LES PLUS PERTINENTS:\n${matchedProducts.map(formatProductLine).join("\n")}` : "",
    matchedMarques.length
      ? `MARQUES PERTINENTES:\n${matchedMarques.map((m) => `- ${m.nom} (${m.type_marque ?? "marque"}) | ${short(m.description, 120)} | lien: /marques/${m.slug}`).join("\n")}`
      : "",
    productsByMarque.length ? `PRODUITS PAR MARQUE DEMANDEE:\n${productsByMarque.join("\n")}` : "",
    matchedActivites.length
      ? `ACTIVITES PERTINENTES:\n${matchedActivites.map((a) => `- ${a.nom} | ${short(a.description, 140)} | lien: /activites/${a.slug}`).join("\n")}`
      : "",
    productsByActivity.length ? `PRODUITS PAR ACTIVITE DEMANDEE:\n${productsByActivity.join("\n")}` : "",
    matchedCategories.length
      ? `CATEGORIES / SECTIONS CATALOGUE PERTINENTES:\n${matchedCategories.map((c) => `- ${c.nom}${c.parent_id ? " (sous-categorie)" : ""} | ${short(c.description, 100)} | lien: ${categoryHref(c)}`).join("\n")}`
      : "",
    sections.length
      ? `SECTIONS DU SITE PERTINENTES:\n${sections.map((s) => `- ${s.nom}: ${s.description} | lien: ${s.href}`).join("\n")}`
      : "",
    `SECTIONS PRINCIPALES DU SITE:\n${knowledge.sections.map((s) => `- ${s.nom}: ${s.href}`).join("\n")}`,
  ].filter(Boolean);

  return parts.join("\n\n---\n\n").slice(0, MAX_CONTEXT_CHARS);
}

async function fetchSiteKnowledge(): Promise<SiteKnowledge> {
  const [produitsJson, marquesJson, activitesJson, categoriesJson, faqJson] = await Promise.all([
    getJson<ApiEnvelope<Produit[]>>("/produits?limit=500"),
    getJson<ApiEnvelope<Marque[]>>("/marques"),
    getJson<ApiEnvelope<Activite[]>>("/activites"),
    getJson<ApiEnvelope<Categorie[]>>("/categories?tree=true"),
    getJson<ApiEnvelope<Faq[]>>("/faq"),
  ]);

  const categoriesTree = unwrapArray(categoriesJson ?? []);
  const categories = flattenCategories(categoriesTree).filter((c) => c.actif !== false);

  return {
    produits: unwrapArray(produitsJson ?? []).filter((p) => p.actif !== false),
    marques: unwrapArray(marquesJson ?? []).filter((m) => m.actif !== false),
    activites: unwrapArray(activitesJson ?? []).filter((a) => a.actif !== false),
    categories,
    faqs: unwrapArray(faqJson ?? []).filter((f) => f.active !== false),
    sections: SITE_SECTIONS,
  };
}

function buildLocalAnswer(message: string, knowledge: SiteKnowledge): ChatPayload {
  if (isGreeting(message)) return buildGreetingAnswer(message);
  if (isProductsOverviewRequest(message)) return buildProductsOverviewAnswer(knowledge, message);

  const productText = (p: Produit) =>
    [
      p.nom,
      p.slug,
      p.description,
      p.tags?.join(" "),
      p.marque?.nom,
      p.marque?.slug,
      p.categorie?.nom,
      p.categorie?.slug,
      p.categorie?.parent?.nom,
      p.categorie?.parent?.slug,
      p.categorie?.activite?.nom,
      p.categorie?.activite?.slug,
    ].filter(Boolean).join(" ");
  const marqueText = (m: Marque) => `${m.nom} ${m.slug} ${m.description ?? ""}`;
  const activiteText = (a: Activite) => `${a.nom} ${a.slug} ${a.description ?? ""}`;
  const categoryText = (c: Categorie) =>
    `${c.nom} ${c.slug} ${c.description ?? ""} ${c.marque?.nom ?? ""} ${c.marque?.slug ?? ""} ${c.activite?.nom ?? ""} ${c.activite?.slug ?? ""}`;

  const product = topMatches(
    knowledge.produits,
    message,
    productText,
    1,
  )[0];

  const faq = knowledge.faqs
    .map((f) => ({ item: f, score: scoreFaq(message, f) }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.item;
  const marque = topMatches(knowledge.marques, message, marqueText, 1)[0];
  const activite = topMatches(knowledge.activites, message, activiteText, 1)[0];
  const category = topMatches(knowledge.categories, message, categoryText, 1)[0];
  const section = topMatches(knowledge.sections, message, (s) => `${s.nom} ${s.description} ${s.motsCles.join(" ")}`, 1)[0];
  const arabic = isArabic(message);
  const productScore = product ? scoreText(message, productText(product)) : 0;
  const marqueScore = marque ? scoreText(message, marqueText(marque)) : 0;
  const activiteScore = activite ? scoreText(message, activiteText(activite)) : 0;
  const categoryScore = category ? scoreText(message, categoryText(category)) : 0;
  const asksForProductList = /\b(produits?|catalogue|proposez|vendez|avez|liste|gamme)\b/i.test(message);

  if (faq && scoreFaq(message, faq) >= 4) {
    return { reply: faq.reponse, actions: [] };
  }

  if (marque && (asksForProductList || marqueScore >= productScore)) {
    const products = knowledge.produits.filter((p) => p.marque?.slug === marque.slug).slice(0, 5);
    return {
      reply: products.length
        ? `${marque.nom} regroupe notamment: ${products.map((p) => p.nom).join(", ")}. Vous pouvez consulter la page marque pour voir le catalogue associe.`
        : `${marque.nom} est presente dans notre catalogue. La page marque contient les informations et produits disponibles.`,
      actions: [{ label: `Voir ${marque.nom}`, href: `/marques/${marque.slug}`, type: "link" }],
    };
  }

  if (activite && (asksForProductList || activiteScore >= productScore)) {
    const products = knowledge.produits.filter((p) => p.categorie?.activite?.slug === activite.slug).slice(0, 6);
    return {
      reply: products.length
        ? `Pour ${activite.nom}, nous proposons notamment: ${products.map((p) => p.nom).join(", ")}.`
        : `${activite.nom} fait partie des activites du Groupe Espace Vert. Je peux vous guider vers sa page dediee.`,
      actions: [{ label: `Voir ${activite.nom}`, href: `/activites/${activite.slug}`, type: "link" }],
    };
  }

  if (category && (asksForProductList || categoryScore >= productScore)) {
    return {
      reply: `La section ${category.nom} existe dans le catalogue. Elle permet de retrouver les produits lies a cette categorie.`,
      actions: [{ label: `Voir ${category.nom}`, href: categoryHref(category), type: "link" }],
    };
  }

  if (product) {
    const actions: ChatAction[] = [{ label: `Voir ${product.nom}`, href: productHref(product), type: "link" }];
    if (wantsPriceOrQuote(message)) actions.push({ label: "Demander un devis", href: "/devis", type: "link" });
    const details = [
      product.marque?.nom ? `marque ${product.marque.nom}` : "",
      product.categorie?.nom ? `categorie ${product.categorie.nom}` : "",
      product.categorie?.activite?.nom ? `activite ${product.categorie.activite.nom}` : "",
    ].filter(Boolean).join(", ");
    return {
      reply: arabic
        ? `وجدت المنتج ${product.nom}${details ? ` (${details})` : ""}. يمكنني توجيهك إلى صفحته أو طلب عرض سعر حسب حاجتك.`
        : `J'ai trouve ${product.nom}${details ? ` (${details})` : ""}. Je peux vous orienter vers sa fiche ou vers une demande de devis selon votre besoin.`,
      actions: actions.slice(0, 2),
    };
  }

  if (section) {
    return {
      reply: `${section.nom}: ${section.description}`,
      actions: [{ label: `Ouvrir ${section.nom}`, href: section.href, type: "link" }],
    };
  }

  return {
    reply: arabic
      ? "يمكنني مساعدتك في المنتجات، العلامات، الأنشطة، الأقسام، عروض الأسعار والتواصل مع فريق Espace Vert. أعد صياغة طلبك باسم المنتج أو النشاط."
      : "Je n'ai pas trouve une information certaine dans le catalogue ou la FAQ. Vous pouvez contacter notre equipe pour une reponse precise.",
    actions: [
      { label: "Nous contacter", href: "/contact", type: "link" },
    ],
  };
}

function buildSystemPrompt(context: string, hasHistory: boolean): string {
  return `Tu es l'assistant virtuel officiel du Groupe Espace Vert Tunisie. Tu connais le site, le catalogue, les marques, les activites, les categories/sections, la FAQ et les parcours devis/contact.

LANGUE ET TON:
- Detecte la langue du visiteur: francais, arabe ou dialecte maghrebin. Reponds dans la meme langue.
- ${hasHistory ? "Ne salue pas a nouveau: reponds directement." : "Si c'est le premier message, tu peux saluer brievement une seule fois."}
- Style professionnel, clair, utile, niveau projet PFE: pas de blabla, pas d'invention.

REGLES ABSOLUES:
- Utilise uniquement les donnees du contexte pour citer produits, marques, activites, categories, FAQ, pages et liens.
- N'invente jamais un prix, un stock, une disponibilite, une adresse ou une fiche technique absente.
- Interdiction stricte d'utiliser des placeholders ou exemples generiques comme "X, Y, Z", "marque X", "marque Y", "etc." pour les marques/activites/produits. Si tu cites une marque, une activite ou un produit, utilise un nom reel present dans le contexte.
- Si aucune marque/activite/produit reel n'est disponible dans le contexte, dis que l'information n'est pas disponible et propose /contact.
- Si le visiteur salue seulement en francais, arabe ou darija: salue dans la meme langue, presente brievement le Groupe Espace Vert, puis propose les actions /activites et /marques. Ne propose pas /devis dans ce cas.
- Si le visiteur demande globalement "produits", "catalogue", "liste des produits" ou equivalent: affiche une synthese avec deux blocs, "Par marques" et "Par activites", en citant des noms reels de produits. Ajoute les actions /activites et /marques.
- Ajoute une action vers /devis uniquement si le visiteur demande explicitement un devis, un prix, un tarif, un achat, une disponibilite ou un stock.
- Si le visiteur demande une marque, une activite ou une categorie: cite quelques noms reels de produits si presents.
- Si le visiteur demande un produit precis: donne marque, categorie/activite et propose la fiche produit.
- Pour une question FAQ qui correspond clairement: donne la reponse de la FAQ.
- Si tu ne connais pas la reponse ou si le contexte ne contient pas l'information: dis-le clairement et ajoute seulement une action vers /contact.
- Le texte "reply" ne doit pas contenir d'URL brute. Les liens vont uniquement dans "actions".
- Maximum 2 actions, labels lisibles, href exacts issus du contexte ou des pages connues.

FORMAT JSON STRICT, aucun texte autour:
{
  "reply": "reponse courte et utile",
  "actions": [
    { "label": "Voir la fiche produit", "href": "/activites/...", "type": "link" }
  ]
}

CONTEXTE SITE ET CATALOGUE:
${context || "Contexte temporairement indisponible. Orienter vers contact et devis."}`;
}

function sanitizeActions(actions: unknown): ChatAction[] {
  if (!Array.isArray(actions)) return [];
  return actions
    .filter((action): action is ChatAction => {
      if (!action || typeof action !== "object") return false;
      const candidate = action as Partial<ChatAction>;
      return typeof candidate.label === "string" && (candidate.type === "link" || candidate.type === "suggestion");
    })
    .map((action) => ({
      label: action.label,
      href: typeof action.href === "string" && action.href.startsWith("/") ? action.href : undefined,
      type: action.type,
    }))
    .slice(0, 2);
}

function labelForHref(href: string, message: string): string {
  const arabic = isArabic(message);
  if (href === "/devis") return arabic ? "طلب عرض سعر" : "Demander un devis";
  if (href === "/contact") return arabic ? "اتصلوا بنا" : "Nous contacter";
  if (href === "/rendez-vous") return arabic ? "حجز موعد" : "Prendre rendez-vous";
  if (href === "/marques") return arabic ? "عرض العلامات" : "Voir les marques";
  if (href === "/activites") return arabic ? "عرض الأنشطة" : "Voir les activites";
  if (href === "/produits") return arabic ? "المنتجات حسب الأنشطة" : "Voir les produits par activites";
  if (href.includes("/produits/")) return arabic ? "عرض المنتج" : "Voir le produit";
  if (href.includes("/activites/")) return arabic ? "عرض النشاط" : "Voir l'activite";
  if (href.includes("/marques/")) return arabic ? "عرض العلامة" : "Voir la marque";
  return arabic ? "فتح الصفحة" : "Ouvrir la page";
}

function extractInlineActions(reply: string, message: string): ChatAction[] {
  const hrefs = Array.from(reply.matchAll(/(?<![\w-])(\/(?:activites|marques|produits|categories|devis|contact|rendez-vous)[^\s),.;"']*)/g))
    .map((match) => match[1].replace(/[)"'.،。]+$/g, ""))
    .filter((href, index, all) => href.startsWith("/") && all.indexOf(href) === index);

  return hrefs.slice(0, 2).map((href) => ({
    label: labelForHref(href, message),
    href,
    type: "link",
  }));
}

function cleanInlineUrls(reply: string): string {
  return reply
    .replace(/\s*\(["']?\/(?:activites|marques|produits|categories|devis|contact|rendez-vous)[^)"']*["']?\)/g, "")
    .replace(/["']\/(?:activites|marques|produits|categories|devis|contact|rendez-vous)[^"'\s),.;]*/g, "")
    .replace(/(?:\s|^)\/(?:activites|marques|produits|categories|devis|contact|rendez-vous)[^\s),.;"']*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}

function normalizeAnswerActions(answer: ChatPayload, message: string): ChatPayload {
  const shouldShowDevis = wantsPriceOrQuote(message);
  const inlineActions = extractInlineActions(answer.reply, message);
  const actions = [...inlineActions, ...answer.actions].filter((action, index, all) => (
    (!action.href || all.findIndex((candidate) => candidate.href === action.href) === index)
    && (action.href !== "/devis" || shouldShowDevis)
  ));
  const reply = cleanInlineUrls(answer.reply);
  const containsPlaceholder = /\b(X,\s*Y,\s*Z|X\s*,\s*Y\s*,\s*Z|marques?\s+(comme\s+)?X|marque\s+Y|marque\s+Z|activit[eé]s?\s+(comme\s+)?X|produits?\s+(comme\s+)?X)\b/i.test(answer.reply);

  if (shouldShowDevis && !actions.some((action) => action.href === "/devis")) {
    actions.push({ label: "Demander un devis", href: "/devis", type: "link" });
  }

  if (!reply || containsPlaceholder) {
    return {
      reply: "Je n'ai pas trouve une information certaine. Notre equipe peut vous repondre directement.",
      actions: [{ label: "Nous contacter", href: "/contact", type: "link" }],
    };
  }

  return { reply, actions: actions.slice(0, 2) };
}

async function askGroq(message: string, history: ChatMessage[], context: string): Promise<ChatPayload | null> {
  if (!GROQ_API_KEY) return null;

  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: buildSystemPrompt(context, history.length > 0) },
    ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message.trim() },
  ];

  const groqRes = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.2,
      max_tokens: 650,
      response_format: { type: "json_object" },
    }),
  });

  if (!groqRes.ok) {
    console.error("[chatbot] Groq error:", await groqRes.text().catch(() => ""));
    return null;
  }

  const groqData = (await groqRes.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = groqData.choices?.[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  try {
    const parsed = JSON.parse(cleaned) as { reply?: unknown; actions?: unknown };
    if (typeof parsed.reply !== "string" || !parsed.reply.trim()) return null;
    return { reply: parsed.reply.trim(), actions: sanitizeActions(parsed.actions) };
  } catch {
    return null;
  }
}

async function askBackendRag(message: string, history: ChatMessage[]): Promise<ChatPayload | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        message: message.trim(),
        history: history.slice(-6),
      }),
    });

    if (!res.ok) return null;

    const parsed = (await res.json()) as { reply?: unknown; actions?: unknown };
    if (typeof parsed.reply !== "string" || !parsed.reply.trim()) return null;

    return {
      reply: parsed.reply.trim(),
      actions: sanitizeActions(parsed.actions),
    };
  } catch (error) {
    console.error("[chatbot] Backend RAG unavailable:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] }: { message: string; history?: ChatMessage[] } = await req.json();
    const cleanMessage = message?.trim();

    if (!cleanMessage) {
      return NextResponse.json({ error: "Message vide" }, { status: 400 });
    }

    const safeHistory = Array.isArray(history)
      ? history.filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      : [];

    if (isGreeting(cleanMessage)) {
      return NextResponse.json(buildGreetingAnswer(cleanMessage));
    }

    if (isAboutCompanyRequest(cleanMessage)) {
      return NextResponse.json(buildAboutCompanyAnswer(cleanMessage));
    }

    const knowledge = await fetchSiteKnowledge();
    const exactProduct = findExactProductByName(knowledge.produits, cleanMessage);
    if (exactProduct) {
      return NextResponse.json(normalizeAnswerActions(buildProductAnswer(exactProduct, cleanMessage), cleanMessage));
    }

    const directEntityAnswer = buildDirectEntityPageAnswer(cleanMessage, knowledge);
    if (directEntityAnswer) {
      return NextResponse.json(normalizeAnswerActions(directEntityAnswer, cleanMessage));
    }

    const searchProduct = await findProductBySearch(cleanMessage);
    if (searchProduct) {
      return NextResponse.json(normalizeAnswerActions(buildProductAnswer(searchProduct, cleanMessage), cleanMessage));
    }

    const ragAnswer = await askBackendRag(cleanMessage, safeHistory);
    if (ragAnswer) {
      return NextResponse.json(normalizeAnswerActions(ragAnswer, cleanMessage));
    }

    const context = formatKnowledgeContext(knowledge, cleanMessage);
    const aiAnswer = await askGroq(cleanMessage, safeHistory, context);
    const answer = normalizeAnswerActions(aiAnswer ?? buildLocalAnswer(cleanMessage, knowledge), cleanMessage);

    return NextResponse.json(answer);
  } catch (error) {
    console.error("[chatbot] Erreur:", error);
    return NextResponse.json({
      reply: "Une erreur s'est produite. Vous pouvez contacter directement notre equipe.",
      actions: [{ label: "Nous contacter", href: "/contact", type: "link" }],
    });
  }
}