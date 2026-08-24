// Assistant IA public + admin — utilise GROQ (deja configure)
import { Request, Response } from "express";
import { cosineSimilarity, getEmbedding } from "../../lib/embedding";
import { prisma } from "../../lib/prisma";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "llama-3.3-70b-versatile";

interface ChatMessage { role: "user" | "assistant"; content: string; }
interface ChatAction { label: string; href?: string; type: "link" | "suggestion"; }
interface AdminAgentAction {
  type:
    | "CREATE_PRODUIT" | "UPDATE_PRODUIT" | "DELETE_PRODUIT"
    | "CREATE_MARQUE" | "UPDATE_MARQUE" | "DELETE_MARQUE"
    | "CREATE_ACTIVITE" | "UPDATE_ACTIVITE" | "DELETE_ACTIVITE"
    | "CREATE_CATEGORIE" | "UPDATE_CATEGORIE" | "DELETE_CATEGORIE"
    | "CREATE_ACTUALITE" | "UPDATE_ACTUALITE"
    | "CREATE_FAQ" | "UPDATE_FAQ" | "DELETE_FAQ"
    | "UPDATE_DEVIS" | "DELETE_DEVIS" | "UPDATE_DEVIS_STATUS"
    | "UPDATE_RDV" | "UPDATE_RDV_STATUS"
    | "REPLY_CONTACT" | "DELETE_CONTACT"
    | "NAVIGATE" | "ANALYZE" | "SUMMARIZE";
  label: string;
  description: string;
  payload: Record<string, unknown>;
  risk: "low" | "medium" | "high";
  icon: string;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u064B-\u065F\u0670]/g, "");
}

function isArabicText(value: string): boolean {
  return /[\u0600-\u06FF]/.test(value);
}

function parseAdminActionsFromReply(content: string): { reply: string; actions: AdminAgentAction[] } {
  const actionBlockRegex = /```actions\s*([\s\S]*?)```/g;
  const actions: AdminAgentAction[] = [];
  let reply = content;
  let match;

  while ((match = actionBlockRegex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      for (const action of arr) {
        if (
          action &&
          typeof action.type === "string" &&
          typeof action.label === "string" &&
          typeof action.description === "string" &&
          action.payload &&
          typeof action.payload === "object"
        ) {
          actions.push({
            type: action.type,
            label: action.label,
            description: action.description,
            payload: action.payload,
            risk: ["low", "medium", "high"].includes(action.risk) ? action.risk : "medium",
            icon: typeof action.icon === "string" ? action.icon : "Zap",
          } as AdminAgentAction);
        }
      }
      reply = reply.replace(match[0], "").trim();
    } catch (e) {
      console.warn("[ai.admin] action parse failed:", e);
    }
  }

  return { reply, actions };
}

function extractTerms(question: string): string[] {
  const stopWords = new Set([
    "avec", "dans", "des", "les", "une", "pour", "sur", "que", "qui",
    "quoi", "comment", "vous", "nous", "votre", "notre", "sont", "est",
    "disponible", "disponibles", "produit", "produits", "besoin",
    "هذا", "هذه", "ذلك", "تلك", "على", "الى", "إلى", "في", "من", "عن",
    "مع", "هل", "ما", "ماذا", "كيف", "التي", "الذي", "انا", "نحن",
    "عندكم", "لديكم", "منتج", "منتجات", "اريد", "أريد", "احتاج", "بحاجة",
  ]);

  return normalizeText(question)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length >= 3 && !stopWords.has(term))
    .slice(0, 10);
}

async function callGroq(
  messages: Array<{ role: string; content: string }>,
  maxTokens = 500,
  temperature = 0.35,
) {
  let groqRes: globalThis.Response;
  try {
    groqRes = await fetch(GROQ_URL, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });
  } catch (err) {
    throw new Error(`GROQ_NETWORK_ERROR: ${err instanceof Error ? err.message : "unknown error"}`);
  }

  if (!groqRes.ok) {
    const errText = await groqRes.text();
    throw new Error(`GROQ_HTTP_${groqRes.status}: ${errText || groqRes.statusText}`);
  }

  const data = await groqRes.json() as { choices?: Array<{ message?: { content: string } }> };
  return data.choices?.[0]?.message?.content?.trim() ?? "Pas de reponse generee.";
}

interface MatchedEntity { label: string; href: string; }

// Construit le lien réel d'un produit à partir de sa catégorie/marque/activité,
// pour que les suggestions du chatbot pointent vers la fiche exacte trouvée
// par la recherche sémantique plutôt qu'une page générique.
function produitHref(p: {
  slug: string;
  categorie?: { slug?: string | null; marque?: { slug?: string | null } | null; activite?: { slug?: string | null } | null } | null;
}): string {
  const marqueSlug = p.categorie?.marque?.slug;
  const activiteSlug = p.categorie?.activite?.slug;
  if (activiteSlug && marqueSlug) return `/activites/${activiteSlug}/${marqueSlug}/${p.slug}`;
  if (marqueSlug) return `/marques/${marqueSlug}/produits/${p.slug}`;
  if (activiteSlug) return `/activites/${activiteSlug}/produits/${p.slug}`;
  return "/activites";
}

// Détecte si une marque/activité connue est nommée dans la question, pour
// proposer un lien direct vers sa page plutôt qu'un lien générique /marques ou /activites.
function findMentionedEntity<T extends { nom: string; slug: string }>(
  question: string,
  items: T[],
): T | null {
  const q = normalizeText(question);
  const found = items
    .filter((item) => item.nom && normalizeText(item.nom).length >= 3 && q.includes(normalizeText(item.nom)))
    .sort((a, b) => b.nom.length - a.nom.length);
  return found[0] ?? null;
}

function parseEmbedding(value: unknown): number[] {
  if (Array.isArray(value)) return value.map(Number);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(Number) : [];
    } catch {
      return [];
    }
  }
  return [];
}

// ─── Contexte des pages statiques (Qui sommes-nous + Étude & Installation) ───
function buildStaticPagesContext(): string {
  const parts: string[] = [];

  parts.push(`PAGE QUI SOMMES-NOUS (/qui-sommes-nous) :
Groupe Espace Vert — fondé en 1995 en Tunisie, spécialisé dans l'irrigation, la fertilisation, les semences et le matériel agricole.
Chiffres clés : 1995 année de création, plus de 100 collaborateurs, 5 sociétés du groupe, 30+ ans d'expérience.
Sociétés du groupe : Espace Vert (holding), Fertivert (engrais et fertilisation), STAJAP (spécialiste irrigation), Mendial Irrigation, Baddar Agricole.
Histoire :
- 1995 : Fondation autour des semences agricoles en Tunisie.
- 2000+ : Élargissement des gammes, développement à l'échelle nationale.
- 2015 : Structuration des filiales spécialisées, lancement des marques propres (Fertivert, Pulvert, Matar).
- Aujourd'hui : Un groupe structuré, présence nationale, reconnu dans le secteur agricole tunisien.
Notre mission : Accompagner les projets agricoles et faciliter leur performance avec conseil, proximité et solutions complètes.
Nos principes : Qualité & fiabilité (produits choisis pour leur performance et durabilité), Proximité (présence locale forte et accompagnement terrain), Partenariats solides (collaborations durables basées sur la confiance), Innovation (solutions modernes adaptées aux enjeux agricoles).
Agences :
- Tunis — Siège : 69, rue Abderrazak Chraibi, 1001 Tunis | Tél : (+216) 71 333 858 / 71 348 404 | Email : secretariat.groupeev@planet.tn
- Soliman (Cap Bon) : Route R43, Soliman | Tél : (+216) 72 333 143
- Borj Amri (Nord-Ouest) : Sidi Ali El Hattab, Borj Amri | Tél : (+216) 71 234 567
- Sfax (Centre-Est) : Route de Gabes, Sfax 3049 | Tél : (+216) 74 000 000`);

  parts.push(`PAGE BUREAU D'ÉTUDE & INSTALLATION IRRIGATION (/activites/irrigation/etude-installation) :
Service disponible uniquement pour l'activité irrigation (STAJAP — partenaire Espace Vert).
Ce service couvre l'étude, la conception, l'installation et l'accompagnement des systèmes d'irrigation agricoles.
Accroche : "Chaque goutte compte. Chaque culture mérite le meilleur."
Systèmes proposés : goutte-à-goutte (précision maximale, économie d'eau jusqu'à 50%) et aspersion (couverture large, plein soleil, résistant UV, pression régulée 0,5–3,5 bar).
Processus en 6 étapes : 1. Visite terrain, 2. Plan technique, 3. Dimensionnement, 4. Installation, 5. Mise en service, 6. Suivi.
Détail des services :
- Étude : relevé du terrain, analyse de la source d'eau, pression, débit et contraintes d'exploitation.
- Conception : plans, sectorisation, dimensionnement et choix des équipements adaptés à chaque culture.
- Réalisation : préparation du chantier, pose du réseau, raccordements et contrôle de conformité.
- Installation : mise en place des arroseurs, goutte-à-goutte, filtres, vannes et automatismes.
- Suivi : tests, réglage, optimisation des zones et contrôle du rendement après mise en service.
- Conseil : recommandations techniques pour économiser l'eau et améliorer la régularité d'irrigation.
- Accompagnement : assistance terrain et support après installation pour garder le système performant.
Pour lancer une étude d'irrigation, l'équipe a besoin de : surface, type de culture, source d'eau, pression disponible, objectif d'automatisation.
Contact projet : prendre rendez-vous sur /rendez-vous ou contacter via /contact.`);

  return parts.join("\n\n");
}


async function fetchPublicSiteContext(question: string): Promise<{ context: string; matched: MatchedEntity[] }> {
  const db = prisma as any;

  try {
    const questionVector = await getEmbedding(question);
    const allEmbeddings = await db.produitEmbedding.findMany({
      include: {
        produit: {
          select: {
            nom: true,
            slug: true,
            description: true,
            usage: true,
            nature: true,
            biologique: true,
            conditionnement: true,
            categorie: {
              select: {
                nom: true,
                slug: true,
                activite: { select: { nom: true, slug: true } },
                marque: { select: { nom: true, slug: true } },
              },
            },
          },
        },
      },
    });

    if (!allEmbeddings.length) {
      return fetchPublicSiteContextFallback(question);
    }

    // Détecter si la question est générale (pas de produit spécifique attendu)
    const GENERAL_QUESTION_PATTERNS = [
      /domaine|activit|service|que fait|présent|bonjour|bienvenu|comment trouver|qui êtes|qui etes|espace vert fait|faites.vous|proposez.vous comme/i,
    ];
    const isGeneralQuestion = GENERAL_QUESTION_PATTERNS.some((p) => p.test(question));

    // Seuil minimum de similarité cosinus — évite d'injecter des produits non pertinents
    const SIMILARITY_THRESHOLD = isGeneralQuestion ? 0.75 : 0.45;

    const scored = allEmbeddings
      .map((item: any) => ({
        chunk: item.chunk,
        produit: item.produit,
        score: cosineSimilarity(questionVector, parseEmbedding(item.embedding)),
      }))
      .filter((item: any) => item.produit && item.score >= SIMILARITY_THRESHOLD)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 6);

    const [faqs, marques, activites, categories, actualites] = await Promise.all([
      prisma.faq.findMany({
        take: 5,
        where: { active: true },
        orderBy: [{ ordre: "asc" }, { id_faq: "desc" }],
        select: { question: true, reponse: true, rubrique: true },
      }),
      prisma.marque.findMany({
        take: 12,
        where: { actif: true },
        orderBy: { nom: "asc" },
        select: { nom: true, slug: true, description: true, type_marque: true },
      }),
      prisma.activite.findMany({
        take: 12,
        where: { actif: true },
        orderBy: [{ ordre: "asc" }, { nom: "asc" }],
        select: { nom: true, slug: true, description: true },
      }),
      prisma.categorie.findMany({
        take: 60,
        where: { actif: true },
        orderBy: [{ ordre: "asc" }, { nom: "asc" }],
        select: {
          nom: true,
          slug: true,
          description: true,
          parent_id: true,
          activite: { select: { nom: true, slug: true } },
          marque: { select: { nom: true, slug: true } },
          _count: { select: { sous_cats: true } },
        },
      }),
      prisma.actualite.findMany({
        take: 5,
        where: { publiee: true },
        orderBy: { published_at: "desc" },
        select: { titre: true, slug: true, contenu: true },
      }),
    ]);

    const parts: string[] = [];

    parts.push(`PAGES UTILES DU SITE :
- Produits par activites: /activites
- Produits par marques: /marques
- Activites: /activites
- Marques: /marques
- Actualites et conseils: /actualites
- Demande de devis: /devis
- Rendez-vous avec un expert: /rendez-vous
- Contact: /contact`);

    if (activites.length > 0) {
      parts.push("ACTIVITES Espace Vert:\n" +
        activites.map((a) => `- ${a.nom} (/activites/${a.slug})${a.description ? `: ${a.description.slice(0, 160)}` : ""}`).join("\n")
      );
    }

    if (marques.length > 0) {
      parts.push("MARQUES:\n" +
        marques.map((m) => `- ${m.nom} (${m.type_marque}, /marques/${m.slug})${m.description ? `: ${m.description.slice(0, 140)}` : ""}`).join("\n")
      );
    }

    // Catégories — on distingue racines (avec sous-cats) et feuilles (sans)
    if (categories.length > 0) {
      const catLeaves  = categories.filter((c) => c._count.sous_cats === 0);
      const catParents = categories.filter((c) => c._count.sous_cats > 0);
      if (catParents.length > 0) {
        parts.push("CATÉGORIES PRINCIPALES:\n" +
          catParents.map((c) =>
            `- ${c.nom}` +
            (c.activite ? ` | activité: ${c.activite.nom} (/activites/${c.activite.slug})` : "") +
            (c.marque   ? ` | marque: ${c.marque.nom} (/marques/${c.marque.slug})` : "") +
            (c.description ? `: ${c.description.slice(0, 120)}` : "")
          ).join("\n")
        );
      }
      if (catLeaves.length > 0) {
        parts.push("SOUS-CATÉGORIES (feuilles — contiennent des produits):\n" +
          catLeaves.map((c) =>
            `- ${c.nom}` +
            (c.activite ? ` | activité: ${c.activite.nom}` : "") +
            (c.marque   ? ` | marque: ${c.marque.nom}` : "") +
            (c.description ? `: ${c.description.slice(0, 120)}` : "")
          ).join("\n")
        );
      }
    }

    // Ne jamais injecter des produits spécifiques pour les questions générales
    if (scored.length > 0 && !isGeneralQuestion) {
      parts.push("PRODUITS PERTINENTS POUR LA QUESTION (recherche semantique):\n" +
        scored.map((r: any) => [
          `- ${r.produit.nom}`,
          `score: ${r.score.toFixed(3)}`,
          r.produit.categorie?.marque?.nom ? `marque: ${r.produit.categorie.marque.nom}` : null,
          r.produit.categorie?.activite?.nom ? `activite: ${r.produit.categorie.activite.nom}` : null,
          r.produit.categorie?.nom ? `categorie: ${r.produit.categorie.nom}` : null,
          r.produit.nature ? `nature: ${r.produit.nature}` : null,
          r.produit.conditionnement ? `conditionnement: ${r.produit.conditionnement}` : null,
          r.produit.biologique ? "biologique" : null,
          r.produit.usage ? `usage: ${r.produit.usage.slice(0, 180)}` : null,
          r.produit.description ? `description: ${r.produit.description.slice(0, 180)}` : null,
        ].filter(Boolean).join(" | ")).join("\n")
      );
    }

    if (faqs.length > 0) {
      parts.push("FAQ:\n" +
        faqs.map((faq) => `Q: ${faq.question}\nR: ${faq.reponse}`).join("\n\n")
      );
    }

    if (actualites.length > 0) {
      parts.push("ACTUALITÉS ET CONSEILS RÉCENTS:\n" +
        actualites.map((a) =>
          `- ${a.titre} (/actualites/${a.slug})${a.contenu ? `: ${a.contenu.replace(/<[^>]*>/g, "").slice(0, 200)}` : ""}`
        ).join("\n")
      );
    }

    // ─── Entités précises pour les boutons de suggestion ───
    // Priorité aux produits réellement trouvés par la recherche sémantique ;
    // sinon on propose la marque / activité explicitement nommée dans la question.
    const matched: MatchedEntity[] = [];
    if (!isGeneralQuestion) {
      scored.slice(0, 2).forEach((r: any) => {
        matched.push({ label: r.produit.nom, href: produitHref(r.produit) });
      });
    }
    const mentionedMarque = findMentionedEntity(question, marques);
    if (mentionedMarque) matched.push({ label: mentionedMarque.nom, href: `/marques/${mentionedMarque.slug}` });
    const mentionedActivite = findMentionedEntity(question, activites);
    if (mentionedActivite) matched.push({ label: mentionedActivite.nom, href: `/activites/${mentionedActivite.slug}` });

    return { context: parts.join("\n\n"), matched };
  } catch (e) {
    console.error("[ai.public] semantic context unavailable, using fallback:", e);
    return fetchPublicSiteContextFallback(question);
  }
}

async function fetchPublicSiteContextFallback(question: string): Promise<{ context: string; matched: MatchedEntity[] }> {
  try {
    const terms = extractTerms(question);
    const productOr = terms.flatMap((term) => [
      { nom: { contains: term } },
      { description: { contains: term } },
      { usage: { contains: term } },
      { fiche_technique: { contains: term } },
      { categorie: { nom: { contains: term } } },
      { categorie: { marque: { nom: { contains: term } } } },
      { categorie: { activite: { nom: { contains: term } } } },
    ]);

    const catOr = terms.flatMap((term) => [
      { nom: { contains: term } },
      { description: { contains: term } },
    ]);
    const actualiteOr = terms.flatMap((term) => [
      { titre: { contains: term } },
      { contenu: { contains: term } },
    ]);

    const [faqs, produits, marques, activites, categories, actualites] = await Promise.all([
      prisma.faq.findMany({
        take: 12,
        where: { active: true },
        orderBy: [{ ordre: "asc" }, { id_faq: "desc" }],
        select: { question: true, reponse: true, rubrique: true },
      }),
      prisma.produit.findMany({
        take: 8,
        where: {
          actif: true,
          ...(productOr.length > 0 ? { OR: productOr } : {}),
        },
        orderBy: [{ ordre: "asc" }, { nom: "asc" }],
        select: {
          nom: true,
          slug: true,
          description: true,
          usage: true,
          nature: true,
          biologique: true,
          conditionnement: true,
          categorie: {
            select: {
              nom: true,
              slug: true,
              activite: { select: { nom: true, slug: true } },
              marque: { select: { nom: true, slug: true } },
            },
          },
        },
      }),
      prisma.marque.findMany({
        take: 12,
        where: { actif: true },
        orderBy: { nom: "asc" },
        select: { nom: true, slug: true, description: true, type_marque: true },
      }),
      prisma.activite.findMany({
        take: 12,
        where: { actif: true },
        orderBy: [{ ordre: "asc" }, { nom: "asc" }],
        select: { nom: true, slug: true, description: true },
      }),
      prisma.categorie.findMany({
        take: 60,
        where: {
          actif: true,
          ...(catOr.length > 0 ? { OR: catOr } : {}),
        },
        orderBy: [{ ordre: "asc" }, { nom: "asc" }],
        select: {
          nom: true,
          slug: true,
          description: true,
          parent_id: true,
          activite: { select: { nom: true, slug: true } },
          marque: { select: { nom: true, slug: true } },
          _count: { select: { sous_cats: true } },
        },
      }),
      prisma.actualite.findMany({
        take: 4,
        where: {
          publiee: true,
          ...(actualiteOr.length > 0 ? { OR: actualiteOr } : {}),
        },
        orderBy: { published_at: "desc" },
        select: { titre: true, slug: true, contenu: true },
      }),
    ]);

    const ranked = faqs
      .map((faq: { question: string; reponse: string; rubrique: string | null }) => {
        const haystack = `${faq.question} ${faq.reponse}`
          .toLowerCase();
        const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
        return { ...faq, score };
      })
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, 4);

    const parts: string[] = [];

    parts.push(`PAGES UTILES DU SITE :
- Produits par activites: /activites
- Produits par marques: /marques
- Activites: /activites
- Marques: /marques
- Actualites et conseils: /actualites
- Demande de devis: /devis
- Rendez-vous avec un expert: /rendez-vous
- Contact: /contact`);

    if (activites.length > 0) {
      parts.push("ACTIVITES Espace Vert:\n" +
        activites.map((a) => `- ${a.nom} (/activites/${a.slug})${a.description ? `: ${a.description.slice(0, 160)}` : ""}`).join("\n")
      );
    }

    if (marques.length > 0) {
      parts.push("MARQUES:\n" +
        marques.map((m) => `- ${m.nom} (${m.type_marque}, /marques/${m.slug})${m.description ? `: ${m.description.slice(0, 140)}` : ""}`).join("\n")
      );
    }

    if (categories.length > 0) {
      const catLeaves  = categories.filter((c) => c._count.sous_cats === 0);
      const catParents = categories.filter((c) => c._count.sous_cats > 0);
      if (catParents.length > 0) {
        parts.push("CATÉGORIES PRINCIPALES:\n" +
          catParents.map((c) =>
            `- ${c.nom}` +
            (c.activite ? ` | activité: ${c.activite.nom} (/activites/${c.activite.slug})` : "") +
            (c.marque   ? ` | marque: ${c.marque.nom} (/marques/${c.marque.slug})` : "") +
            (c.description ? `: ${c.description.slice(0, 120)}` : "")
          ).join("\n")
        );
      }
      if (catLeaves.length > 0) {
        parts.push("SOUS-CATÉGORIES (feuilles — contiennent des produits):\n" +
          catLeaves.map((c) =>
            `- ${c.nom}` +
            (c.activite ? ` | activité: ${c.activite.nom}` : "") +
            (c.marque   ? ` | marque: ${c.marque.nom}` : "") +
            (c.description ? `: ${c.description.slice(0, 120)}` : "")
          ).join("\n")
        );
      }
    }

    const GENERAL_Q_PATTERNS = [
      /domaine|activit|service|que fait|présent|bonjour|bienvenu|comment trouver|qui êtes|qui etes|espace vert fait|faites.vous|proposez.vous comme/i,
    ];
    const isFallbackGeneral = GENERAL_Q_PATTERNS.some((p) => p.test(question));

    if (produits.length > 0 && !isFallbackGeneral) {
      parts.push("PRODUITS PERTINENTS POUR LA QUESTION:\n" +
        produits.map((p) => [
          `- ${p.nom}`,
          p.categorie?.marque?.nom ? `marque: ${p.categorie.marque.nom}` : null,
          p.categorie?.activite?.nom ? `activite: ${p.categorie.activite.nom}` : null,
          p.categorie?.nom ? `categorie: ${p.categorie.nom}` : null,
          p.nature ? `nature: ${p.nature}` : null,
          p.conditionnement ? `conditionnement: ${p.conditionnement}` : null,
          p.biologique ? "biologique" : null,
          p.usage ? `usage: ${p.usage.slice(0, 180)}` : null,
          p.description ? `description: ${p.description.slice(0, 180)}` : null,
        ].filter(Boolean).join(" | ")).join("\n")
      );
    }

    if (ranked.length > 0) {
      parts.push("FAQ PERTINENTE:\n" +
        ranked.map((faq) => `Q: ${faq.question}\nR: ${faq.reponse}`).join("\n\n")
      );
    }

    if (actualites.length > 0) {
      parts.push("ACTUALITÉS ET CONSEILS RÉCENTS:\n" +
        actualites.map((a) =>
          `- ${a.titre} (/actualites/${a.slug})${a.contenu ? `: ${a.contenu.replace(/<[^>]*>/g, "").slice(0, 200)}` : ""}`
        ).join("\n")
      );
    }

    const matched: MatchedEntity[] = [];
    if (!isFallbackGeneral) {
      produits.slice(0, 2).forEach((p: any) => {
        matched.push({ label: p.nom, href: produitHref(p) });
      });
    }
    const mentionedMarque = findMentionedEntity(question, marques);
    if (mentionedMarque) matched.push({ label: mentionedMarque.nom, href: `/marques/${mentionedMarque.slug}` });
    const mentionedActivite = findMentionedEntity(question, activites);
    if (mentionedActivite) matched.push({ label: mentionedActivite.nom, href: `/activites/${mentionedActivite.slug}` });

    return { context: parts.join("\n\n"), matched };
  } catch (e) {
    console.error("[ai.public] fetchPublicSiteContext error:", e);
    return { context: "", matched: [] };
  }
}

function buildPublicActions(message: string): ChatAction[] {
  const q = normalizeText(message);
  const arabic = isArabicText(message);
  const actions: ChatAction[] = [];
  const add = (label: string, href: string) => {
    if (!actions.some((a) => a.href === href)) actions.push({ label, href, type: "link" });
  };
  const label = {
    devis: arabic ? "طلب عرض سعر" : "Demander un devis",
    rdv: arabic ? "حجز موعد" : "Prendre rendez-vous",
    contact: arabic ? "اتصلوا بنا" : "Contacter Espace Vert",
    marques: arabic ? "عرض العلامات" : "Voir les marques",
    activites: arabic ? "عرض الأنشطة" : "Voir les activités",
    produits: arabic ? "المنتجات حسب الأنشطة" : "Produits par activites",
    actualites: arabic ? "الأخبار والنصائح" : "Actualités & Conseils",
    quiSommesNous: arabic ? "من نحن" : "Qui sommes-nous",
    etudeInstallation: arabic ? "دراسة وتركيب الري" : "Bureau d'étude & installation",
  };

  if (/(devis|prix|tarif|cout|commande|acheter|achat|سعر|اسعار|أسعار|عرض|شراء|طلب)/.test(q)) add(label.devis, "/devis");
  if (/(rdv|rendez|expert|conseil|visite|installation|etude|موعد|زيارة|خبير|نصيحة|تركيب|دراسة)/.test(q)) add(label.rdv, "/rendez-vous");
  if (/(contact|telephone|adresse|agence|localisation|horaire|اتصال|هاتف|عنوان|فرع|وكالة|اوقات|أوقات)/.test(q)) add(label.contact, "/contact");
  if (/(actualite|article|conseil|blog|news|astuce|technique|culture|actualit|أخبار|نصائح|مقال|نشرة)/.test(q)) add(label.actualites, "/actualites");
  if (/(qui etes|qui sommes|histoire|fondation|groupe|societe|mission|equipe|agence|من نحن|تاريخ|مجموعة|شركة|مهمة|فريق|وكالة)/.test(q)) add(label.quiSommesNous, "/qui-sommes-nous");
  if (/(etude|installation|bureau|systeme irrigation|goutte|aspersion|dimensionnement|sectorisation|mise en service|دراسة|تركيب|نظام ري|رش|تقطير)/.test(q)) add(label.etudeInstallation, "/activites/irrigation/etude-installation");
  if (/(pelouse|gazon|عشب|نجيل)/.test(q) && /(seche|sec|secheresse|chaud|chaleur|ناشف|سخون|سخانة)/.test(q)) {
    add(arabic ? "مجموعة الحديقة والعشب" : "Kit Jardin & Pelouse", "/activites/irrigation/produits/kit-jardin-pelouse");
    add(arabic ? "الري" : "Irrigation", "/activites/irrigation");
  }
  if (/(semence|graine|carotte|potager|maraicher|بذور|جزر|الجزر)/.test(q)) add(arabic ? "بذور ونباتات" : "Semences & Plants", "/activites/semences-et-plants");
  if (/(pelouse|gazon|عشب|نجيل)/.test(q)) add(arabic ? "بذور ونباتات" : "Semences & Plants", "/activites/semences-et-plants");
  if (/(irrigation|arrosage|goutte|aspersion|ري|سقي)/.test(q)) add(arabic ? "الري" : "Irrigation", "/activites/irrigation");
  if (/(marque|fertivert|pulvert|matar|semence|baddar|علامة|ماركة|بذور|مطر)/.test(q)) add(label.marques, "/marques");
  if (/(irrigation|fertilisation|pulverisation|semence|jardin|activite|service|ري|تسميد|رش|بذور|حديقة|نشاط|خدمة)/.test(q)) add(label.activites, "/activites");
  if (/(produit|catalogue|fiche|disponible|materiel|equipement|منتج|منتجات|كتالوج|متوفر|معدات|تجهيزات)/.test(q)) {
    add(label.produits, "/activites");
    add(label.marques, "/marques");
  }

  if (actions.length === 0) {
    add(label.produits, "/activites");
    add(label.contact, "/contact");
  }

  return actions.slice(0, 3);
}

function buildAdminActions(message: string): AdminAgentAction[] {
  const q = normalizeText(message);
  const arabic = isArabicText(message);
  const actions: AdminAgentAction[] = [];
  const add = (label: string, href: string) => {
    if (!actions.some((a) => a.payload.href === href)) {
      actions.push({
        type: "NAVIGATE",
        label,
        description: arabic ? `فتح ${href} في لوحة التحكم` : `Ouvrir ${href} dans le dashboard admin`,
        payload: { href },
        risk: "low",
        icon: "ArrowRight",
      });
    }
  };

  if (/(devis|commande|demande|client|عرض|طلب|عميل)/.test(q)) add(arabic ? "فتح عروض السعر" : "Ouvrir les devis", "/admin/devis");
  if (/(rdv|rendez|planning|confirmer|موعد|مواعيد|تأكيد)/.test(q)) add(arabic ? "فتح المواعيد" : "Ouvrir les rendez-vous", "/admin/rdv");
  if (/(message|contact|non lu|email|رسالة|رسائل|بريد)/.test(q)) add(arabic ? "عرض الرسائل" : "Voir les messages", "/admin/contact");
  if (/(produit|catalogue|stock|fiche|prix|منتج|منتجات|كتالوج)/.test(q)) add(arabic ? "إدارة المنتجات" : "Gérer les produits", "/admin/produits");
  if (/(marque|fertivert|pulvert|matar|علامة|ماركة)/.test(q)) add(arabic ? "إدارة العلامات" : "Gérer les marques", "/admin/marques");
  if (/(categorie|activite|menu|صنف|تصنيف|نشاط)/.test(q)) add(arabic ? "إدارة التصنيفات" : "Gérer les catégories", "/admin/categories");
  if (/(faq|question|reponse|سؤال|أسئلة|اجابة|إجابة)/.test(q)) add(arabic ? "إدارة الأسئلة الشائعة" : "Gérer la FAQ", "/admin/faq");
  if (/(stat|analyse|analytics|visiteur|performance|احصائ|تحليل|زوار|اداء|أداء)/.test(q)) add(arabic ? "عرض التحليلات" : "Voir analytics", "/admin/analytics");

  if (actions.length === 0) add(arabic ? "لوحة التحكم" : "Tableau de bord", "/admin/dashboard");
  return actions.slice(0, 3);
}

function buildAdminFallbackReply(message: string, reason: unknown): string {
  const arabic = isArabicText(message);
  const detail = reason instanceof Error ? reason.message : String(reason ?? "");
  const q = normalizeText(message);
  const isGreeting = arabic
    ? /^(اهلا|أهلا|مرحبا|سلام|السلام عليكم|هاي|هلا)[\s!.؟]*$/.test(message.trim())
    : /^(hi|hello|salut|bonjour|bonsoir|hey)[\s!.?]*$/i.test(message.trim());

  if (arabic) {
    if (isGreeting) {
      return "أهلاً! كيف يمكنني مساعدتك في إدارة لوحة التحكم اليوم؟";
    }

    if (/(اضف|أضف|انشئ|أنشئ|اعمل|زيد|ajout|cree|crée).*(منتج|produit)/.test(q)) {
      return [
        "فهمت أنك تريد إضافة منتج.",
        "لإنشاء المنتج بشكل صحيح، أحتاج: **اسم المنتج**، **القسم أو رقم الفئة**، ويفضّل **العلامة** و**وصف قصير**.",
        "إذا أعطيتني هذه المعلومات سأحضّر لك إجراء إنشاء المنتج للتأكيد.",
      ].join("\n");
    }

    if (/(احذف|حذف|supprime|delete).*(منتج|produit)/.test(q)) {
      return [
        "فهمت أنك تريد حذف منتج.",
        "أرسل لي **رقم المنتج ID** حتى أحضّر إجراء الحذف للتأكيد.",
      ].join("\n");
    }

    if (/(موعد|مواعيد|rdv|rendez)/.test(q)) {
      return "فهمت أنك تريد إدارة المواعيد. يمكنك فتح صفحة المواعيد من الزر المقترح، أو أعطني رقم الموعد والحالة الجديدة لأحضّر إجراء التحديث.";
    }

    if (/(عرض|عروض|devis|طلب سعر|عرض سعر)/.test(q)) {
      return "فهمت أنك تريد إدارة عروض السعر. يمكنك فتح صفحة العروض من الزر المقترح، أو أعطني رقم العرض والحالة الجديدة لأحضّر إجراء التحديث.";
    }

    if (/(احصائ|إحصائ|تحليل|زوار|اداء|أداء|analytics|stat)/.test(q)) {
      return "فهمت أنك تريد تحليلاً للوحة التحكم. افتح صفحة التحليلات من الزر المقترح، أو حدّد الفترة التي تريد تحليلها.";
    }

    return [
      "فهمت طلبك، ويمكنني توجيهك داخل لوحة التحكم عبر الأزرار المقترحة.",
      "لإنجاز إجراء فعلي، أعطني التفاصيل الأساسية مثل الرقم ID أو اسم العنصر والفئة المطلوبة.",
      detail.includes("401") || detail.includes("403")
        ? "ملاحظة تقنية: مفتاح خدمة الذكاء الاصطناعي غير صحيح أو لا يملك صلاحية."
        : detail.includes("429")
          ? "ملاحظة تقنية: تم تجاوز حد الاستخدام مؤقتاً."
          : "",
    ].filter(Boolean).join("\n");
  }

  if (isGreeting) {
    return "Bonjour ! Comment puis-je vous aider dans le dashboard aujourd'hui ?";
  }

  if (/(ajoute|ajouter|cree|crée|creer|créer).*(produit)/.test(q)) {
    return [
      "J'ai compris que vous voulez ajouter un produit.",
      "Pour le créer correctement, il me faut au minimum : **nom du produit**, **catégorie ou ID catégorie**, et idéalement **marque** + **description courte**.",
      "Avec ces informations, je préparerai l'action de création à confirmer.",
    ].join("\n");
  }

  return [
    "J'ai compris la demande et je peux proposer les raccourcis admin pertinents.",
    "Pour exécuter une action réelle, donnez les détails indispensables comme l'ID, le statut ou la catégorie.",
    detail.includes("401") || detail.includes("403")
      ? "Cause probable : `GROQ_API_KEY` invalide ou non autorisée."
      : detail.includes("429")
        ? "Cause probable : limite Groq atteinte temporairement."
        : "Réessayez dans un instant.",
  ].join("\n");
}

// ─── Contexte stats depuis la DB ──────────────────────────────────────────────
async function fetchAdminContext(): Promise<string> {
  const parts: string[] = [];
  try {
    const [devisStats, rdvStats, msgStats, prodCount, marqueCount, activiteCount, faqCount] = await Promise.all([
      prisma.devisDemande.groupBy({ by: ["statut"], _count: { statut: true } }),
      prisma.rendezVous.groupBy({ by: ["statut"], _count: { statut: true } }),
      prisma.contactMessage.aggregate({ _count: { id_contact: true }, where: { lu: false } }),
      prisma.produit.count({ where: { actif: true } }),
      prisma.marque.count({ where: { actif: true } }),
      prisma.activite.count({ where: { actif: true } }),
      prisma.faq.count({ where: { active: true } }),
    ]);

    const devisMap = Object.fromEntries(devisStats.map(d => [d.statut, d._count.statut]));
    const rdvMap   = Object.fromEntries(rdvStats.map(r => [r.statut, r._count.statut]));
    const devisTotal = Object.values(devisMap).reduce((a, b) => a + b, 0);
    const rdvTotal   = Object.values(rdvMap).reduce((a, b) => a + b, 0);

    parts.push(`ÉTAT DU SITE EN CE MOMENT :
- Demandes de devis : ${devisTotal} total
  • En attente (nouveaux) : ${devisMap.nouveau ?? 0}
  • En cours de traitement : ${devisMap.en_cours ?? 0}
  • Traités : ${devisMap.traite ?? 0}
  • Refusés : ${devisMap.rejete ?? 0}
- Rendez-vous : ${rdvTotal} total
  • À confirmer : ${rdvMap.nouveau ?? 0}
  • Confirmés : ${rdvMap.confirme ?? 0}
  • Terminés : ${rdvMap.termine ?? 0}
  • Annulés : ${rdvMap.annule ?? 0}
- Messages non lus : ${msgStats._count.id_contact}
- Catalogue : ${prodCount} produits actifs, ${marqueCount} marques, ${activiteCount} activités, ${faqCount} FAQ actives`);

    // Derniers devis
    const dernierDevis = await prisma.devisDemande.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      select: { nom: true, email: true, statut: true, created_at: true, produit: { select: { nom: true } } },
    });
    if (dernierDevis.length > 0) {
      const statutLabel: Record<string, string> = { nouveau: "En attente", en_cours: "En cours", traite: "Traité", rejete: "Refusé" };
      parts.push("DERNIÈRES DEMANDES DE DEVIS :\n" +
        dernierDevis.map(d =>
          `- ${d.nom} | ${d.produit?.nom ?? "Produit non précisé"} | ${statutLabel[d.statut] ?? d.statut} | ${new Date(d.created_at).toLocaleDateString("fr-FR")}`
        ).join("\n")
      );
    }

    // Prochains RDV à confirmer
    const prochainRdv = await prisma.rendezVous.findMany({
      take: 5,
      where: { statut: { in: ["nouveau", "confirme"] }, date_souhaitee: { gte: new Date() } },
      orderBy: { date_souhaitee: "asc" },
      select: { nom: true, date_souhaitee: true, statut: true, agence: true },
    });
    if (prochainRdv.length > 0) {
      parts.push("PROCHAINS RENDEZ-VOUS :\n" +
        prochainRdv.map(r =>
          `- ${r.nom} | ${new Date(r.date_souhaitee).toLocaleDateString("fr-FR")} | ${r.agence ?? "agence non précisée"} | ${r.statut === "nouveau" ? "À confirmer" : "Confirmé"}`
        ).join("\n")
      );
    }

    const messagesNonLus = await prisma.contactMessage.findMany({
      take: 5,
      where: { lu: false },
      orderBy: { created_at: "desc" },
      select: { nom: true, sujet: true, created_at: true },
    });
    if (messagesNonLus.length > 0) {
      parts.push("MESSAGES CLIENTS NON LUS :\n" +
        messagesNonLus.map(m =>
          `- ${m.nom} | ${m.sujet ?? "Sans sujet"} | ${new Date(m.created_at).toLocaleDateString("fr-FR")}`
        ).join("\n")
      );
    }

    const categories = await prisma.categorie.findMany({
      take: 80,
      where: { actif: true },
      orderBy: [{ nom: "asc" }],
      select: {
        id_categorie: true,
        nom: true,
        parent_id: true,
        marque: { select: { nom: true } },
        activite: { select: { nom: true } },
        _count: { select: { sous_cats: true } },
      },
    });
    const feuilles = categories.filter((c) => c._count.sous_cats === 0);
    if (feuilles.length > 0) {
      parts.push("CATÉGORIES FEUILLES VALIDES POUR CRÉER UN PRODUIT :\n" +
        feuilles.map((c) =>
          `- ID ${c.id_categorie}: ${c.nom}` +
          (c.marque?.nom ? ` | marque: ${c.marque.nom}` : "") +
          (c.activite?.nom ? ` | activité: ${c.activite.nom}` : "")
        ).join("\n")
      );
    }

    const [marquesList, activitesList] = await Promise.all([
      prisma.marque.findMany({
        take: 60,
        where: { actif: true },
        orderBy: { nom: "asc" },
        select: { id_marque: true, nom: true, type_marque: true },
      }),
      prisma.activite.findMany({
        take: 60,
        where: { actif: true },
        orderBy: [{ ordre: "asc" }, { nom: "asc" }],
        select: { id_activite: true, nom: true },
      }),
    ]);

    if (marquesList.length > 0) {
      parts.push("MARQUES EXISTANTES :\n" +
        marquesList.map((m) => `- ID ${m.id_marque}: ${m.nom} | type: ${m.type_marque}`).join("\n")
      );
    }

    if (activitesList.length > 0) {
      parts.push("ACTIVITÉS EXISTANTES :\n" +
        activitesList.map((a) => `- ID ${a.id_activite}: ${a.nom}`).join("\n")
      );
    }

  } catch (e) {
    console.error("[ai.admin] fetchAdminContext error:", e);
  }
  return parts.join("\n\n");
}

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
export async function publicAiChat(req: Request, res: Response): Promise<void> {
  const { message, history = [] } = req.body as { message: string; history: ChatMessage[] };
  const arabic = isArabicText(message ?? "");

  if (!GROQ_API_KEY) {
    res.status(503).json({
      reply: arabic
        ? "المساعد غير متوفر حالياً. يمكنكم التواصل معنا مباشرة."
        : "Assistant IA indisponible pour le moment.",
      actions: buildPublicActions(message ?? ""),
    });
    return;
  }

  if (!message?.trim()) {
    res.status(400).json({ error: "Message vide" });
    return;
  }

  try {
    const [{ context: siteContext, matched }, staticContext] = await Promise.all([
      fetchPublicSiteContext(message),
      Promise.resolve(buildStaticPagesContext()),
    ]);
    const replyLanguage = isArabicText(message)
      ? "arabe"
      : "français";
    const systemPrompt = `Tu es l'assistant public officiel d'Espace Vert, entreprise tunisienne spécialisée dans l'irrigation, la fertilisation, les semences, le matériel agricole et les espaces verts.

RÈGLES DE RÉPONSE :
- Réponds en ${replyLanguage}, avec un ton professionnel, clair et utile.
- Si le visiteur écrit en arabe, réponds en arabe naturel et lisible.
- Reste orienté Espace Vert: produits, activités, marques, devis, rendez-vous, contact.
- Ne promets pas de disponibilité, de prix, de délai ou de dosage exact si le contexte ne le donne pas.
- Maximum 6 phrases, sauf si l'utilisateur demande un détail.
- Ne mentionne jamais Groq, modèle IA, prompt, base de données ou contexte interne.
- N'écris jamais d'URL brute dans la réponse.
- Le site n'a pas de catalogue produits indépendant: les produits se consultent par activités, marques et catégories.

RÈGLE CRITIQUE — TYPE DE QUESTION :
Analyse d'abord l'intention de la question avant de répondre :

1. QUESTION GÉNÉRALE (présentation, activités, domaines, marques, services) :
   → Réponds avec une description générale d'Espace Vert et ses activités/marques.
   → INTERDIT : ne mentionne JAMAIS un produit spécifique ("J'ai trouvé [produit]", "Voici un produit", etc.).
   → INTERDIT : n'invente PAS et ne présente PAS de produit comme réponse à une question générale.
   → Exemples : "Quels sont vos domaines d'activité ?", "Que fait Espace Vert ?", "Comment trouver un produit adapté ?"
   → Pour ces questions, présente les activités (irrigation, fertilisation, semences, pulvérisation) et oriente vers /activites ou /marques.

2. QUESTION PRODUIT SPÉCIFIQUE (nom de plante, culture, problème précis, produit nommé) :
   → Utilise les produits du contexte pour répondre de façon ciblée.
   → Exemples : "Je cherche un engrais pour tomates", "Quel produit pour irriguer 2 hectares ?"

3. QUESTION FAQ / INFORMATION (horaires, agences, devis, contact) :
   → Réponds directement avec l'information disponible dans le contexte FAQ.

4. QUESTION INSTITUTIONNELLE (histoire, fondation, agences, équipe, mission, principes, qui êtes-vous, bureau d'étude, installation irrigation, étude technique) :
   → Utilise exclusivement le contexte des pages statiques ci-dessous.
   → Réponds avec les vrais chiffres (1995, 100+ collaborateurs, 5 sociétés, 4 agences) et les vrais contacts.
   → Pour l'étude & installation, détaille le processus en 6 étapes et les 7 services disponibles.

PAGES STATIQUES DU SITE :
${staticContext}

Contexte site dynamique (produits, catégories, FAQ, actualités) :
${siteContext || "Aucun contexte site specifique disponible."}`;


    const recentHistory = (history as ChatMessage[]).slice(-6);
    const reply = await callGroq(
      [
        { role: "system", content: systemPrompt },
        ...recentHistory,
        { role: "user", content: message.trim() },
      ],
      520,
      0.25,
    );

    // Détecter si la réponse correspond à une FAQ pour le tracking
    let id_faq: number | null = null;
    try {
      const faqs = await prisma.faq.findMany({
        take: 50, where: { active: true },
        select: { id_faq: true, question: true, reponse: true },
      });
      const msgNorm = normalizeText(message);
      const terms = extractTerms(message);
      const matched = faqs
        .map((f) => {
          const qNorm = normalizeText(f.question);
          const hay   = normalizeText(f.question + " " + f.reponse);
          // Score basé sur les termes communs
          const termScore = terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
          // Bonus si la question du visiteur est très proche de la question FAQ
          const questionMatch = qNorm.includes(msgNorm) || msgNorm.includes(qNorm) ? 3 : 0;
          return { id_faq: f.id_faq, score: termScore + questionMatch };
        })
        .filter((f) => f.score >= 1)
        .sort((a, b) => b.score - a.score)[0];
      if (matched) id_faq = matched.id_faq;
    } catch {}

    // Priorité aux liens precis (produit/marque/activite reellement trouves par
    // la recherche), completes par les suggestions generiques basees sur des mots-cles.
    const preciseActions: ChatAction[] = matched.map((m) => ({ label: m.label, href: m.href, type: "link" }));
    const genericActions = buildPublicActions(message);
    const actions = [...preciseActions, ...genericActions]
      .filter((a, index, all) => all.findIndex((other) => other.href === a.href) === index)
      .slice(0, 3);

    res.json({
      reply,
      actions,
      ...(id_faq ? { id_faq } : {}),
    });
  } catch (err) {
    console.error("[ai.public] error:", err);
    res.status(500).json({
      reply: arabic
        ? "حدث خطأ أثناء معالجة طلبكم. يمكنكم المحاولة مرة أخرى أو التواصل معنا مباشرة."
        : "Une erreur s'est produite. Veuillez reessayer ou nous contacter directement.",
      actions: buildPublicActions(message),
    });
  }
}

// ─── POST /api/admin/ai/chat ──────────────────────────────────────────────────
export async function adminAiChat(req: Request, res: Response): Promise<void> {
  const { message, history = [] } = req.body as { message: string; history: ChatMessage[] };
  const arabic = isArabicText(message ?? "");

  if (!GROQ_API_KEY) {
    res.json({
      reply: buildAdminFallbackReply(message ?? "", new Error("GROQ_API_KEY missing")),
      actions: buildAdminActions(message ?? ""),
    });
    return;
  }

  if (!message?.trim()) {
    res.status(400).json({ error: "Message vide" });
    return;
  }

  try {
    const context = await fetchAdminContext();
    const admin   = (req as any).admin;
    const replyLanguage = arabic ? "arabe" : "français";

    const systemPrompt = `Tu es l'assistant IA interne du tableau de bord Espace Vert.

Tu aides ${admin?.nom ?? "l'administrateur"} à gérer le site: devis, rendez-vous, messages clients, catalogue, marques, activités, catégories, FAQ, actualités et suivi des visiteurs.

RÈGLES :
- Réponds en ${replyLanguage} professionnel, clair et exploitable.
- Si l'utilisateur écrit en arabe, réponds en arabe naturel et lisible. Garde les noms techniques, slugs et URLs tels quels.
- Commence par la réponse utile, puis donne les prochaines actions.
- Maximum 6 phrases, sauf demande explicite de détail.
- Utilise les chiffres du contexte quand ils existent; ne les invente jamais.
- Quand tu recommandes une action, indique le menu admin exact: Devis, Rendez-vous, Contact, Produits, Marques, Catégories, FAQ, Analytics.
- Si l'information exacte n'est pas dans le contexte, dis-le et propose où vérifier dans l'admin.
- Tu peux proposer des actions exécutables, mais l'interface demandera confirmation avant modification.
- Ne propose pas de CRUD sur les comptes administrateurs, rôles, permissions, audit ou configuration système. Oriente vers la page admin concernée.
- Pour toute création/modification, si un champ obligatoire manque, pose une question courte au lieu d'inventer.

ACTIONS EXÉCUTABLES :
Quand l'utilisateur donne un ordre clair et assez précis, ajoute à la fin un bloc JSON strict:
\`\`\`actions
[
  {
    "type": "UPDATE_DEVIS_STATUS",
    "label": "Marquer le devis #12 comme en cours",
    "description": "Changer le statut du devis #12 vers en_cours.",
    "payload": { "id_devis": 12, "statut": "en_cours" },
    "risk": "medium",
    "icon": "FileText"
  }
]
\`\`\`

Types disponibles:
- UPDATE_DEVIS_STATUS: payload { "id_devis": number, "statut": "nouveau"|"en_cours"|"traite"|"rejete" }
- UPDATE_DEVIS: payload { "id_devis": number, "statut"?: string, "reponse_admin"?: string, "note_interne"?: string }
- DELETE_DEVIS: payload { "id_devis": number }
- UPDATE_RDV_STATUS: payload { "id_rdv": number, "statut": "nouveau"|"confirme"|"termine"|"annule" }
- UPDATE_RDV: payload { "id_rdv": number, "statut"?: string, "note_interne"?: string }
- REPLY_CONTACT: payload { "id_contact": number, "reponse": string }
- DELETE_CONTACT: payload { "id_contact": number }
- CREATE_FAQ: payload { "question": string, "reponse": string, "categorie"?: string|null, "ordre"?: number, "active"?: boolean }
- UPDATE_FAQ: payload { "id_faq": number, "question"?: string, "reponse"?: string, "categorie"?: string|null, "ordre"?: number, "active"?: boolean }
- DELETE_FAQ: payload { "id_faq": number }
- CREATE_ACTUALITE: payload { "titre": string, "slug": string, "contenu": string, "image"?: string|null, "publiee"?: boolean }
- UPDATE_ACTUALITE: payload { "id_actualite": number, "titre"?: string, "slug"?: string, "contenu"?: string, "image"?: string|null, "publiee"?: boolean }
- CREATE_MARQUE: payload { "nom": string, "slug": string, "description"?: string|null, "logo"?: string|null, "banniere"?: string|null, "type_marque"?: "groupe"|"partenaire" }
- UPDATE_MARQUE: payload { "id_marque": number, "nom"?: string, "slug"?: string, "description"?: string|null, "logo"?: string|null, "banniere"?: string|null, "type_marque"?: "groupe"|"partenaire", "actif"?: boolean }
- DELETE_MARQUE: payload { "id_marque": number }
- CREATE_ACTIVITE: payload { "nom": string, "slug": string, "description"?: string|null, "image"?: string|null, "banniere"?: string|null, "ordre"?: number }
- UPDATE_ACTIVITE: payload { "id_activite": number, "nom"?: string, "slug"?: string, "description"?: string|null, "image"?: string|null, "banniere"?: string|null, "ordre"?: number, "actif"?: boolean }
- DELETE_ACTIVITE: payload { "id_activite": number }
- CREATE_CATEGORIE: payload { "nom": string, "slug": string, "description"?: string|null, "image"?: string|null, "id_activite"?: number|null, "id_marque"?: number|null, "parent_id"?: number|null, "ordre"?: number }
- UPDATE_CATEGORIE: payload { "id_categorie": number, "nom"?: string, "slug"?: string, "description"?: string|null, "image"?: string|null, "id_activite"?: number|null, "id_marque"?: number|null, "parent_id"?: number|null, "ordre"?: number, "actif"?: boolean }
- DELETE_CATEGORIE: payload { "id_categorie": number }
- CREATE_PRODUIT: payload { "nom": string, "slug": string, "id_categorie": number, "division"?: "pro"|"garden", "description"?: string|null, "actif"?: boolean }
- UPDATE_PRODUIT: payload { "id_produit": number, ...champs_a_modifier }
- DELETE_PRODUIT: payload { "id_produit": number, "nom"?: string }
- NAVIGATE: payload { "href": "/admin/..." }
- ANALYZE ou SUMMARIZE: payload libre

Contraintes:
- N'ajoute pas de bloc actions si une information obligatoire manque; pose d'abord une question courte.
- Pour CREATE_PRODUIT, utilise uniquement un id_categorie présent dans "CATÉGORIES FEUILLES VALIDES POUR CRÉER UN PRODUIT".
- Si aucune catégorie valide ne correspond au besoin, demande la catégorie au lieu d'inventer un ID.
- Les suppressions sont toujours risk "high".
- Les créations, modifications, réponses client et changements de statut sont risk "medium".
- Les navigations et analyses sont risk "low".
- Le JSON doit être valide, sans commentaire, sans virgule finale.

${context}`;

    const recentHistory = (history as ChatMessage[]).slice(-6);
    const messages = [
      { role: "system", content: systemPrompt },
      ...recentHistory,
      { role: "user", content: message.trim() },
    ];

    const rawReply = await callGroq(messages, 900, 0.2);
    const parsed = parseAdminActionsFromReply(rawReply);
    res.json({
      reply: parsed.reply,
      actions: parsed.actions.length > 0 ? parsed.actions : buildAdminActions(message),
    });

  } catch (err) {
    console.error("[ai.admin] error:", err);
    res.json({
      reply: buildAdminFallbackReply(message, err),
      actions: buildAdminActions(message),
    });
  }
}