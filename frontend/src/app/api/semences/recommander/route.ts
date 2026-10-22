// src/app/api/semences/recommander/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Route Next.js dédiée aux recommandations de semences par IA (Groq/llama)
// Reçoit le profil du visiteur + la liste des produits semences,
// retourne un tableau JSON classé par score avec explications.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProduitSemence, RecommandationResult, VisiteurProfil } from "@/types/semences-recommandation";
import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "llama-3.3-70b-versatile";

// ── Types (définis dans @/types/semences-recommandation) ──────────────────────
// Réexportés ici pour rétrocompatibilité avec d'éventuels imports depuis route.ts
export type { ProduitSemence, RecommandationResult, VisiteurProfil } from "@/types/semences-recommandation";

// ── Constantes ─────────────────────────────────────────────────────────────────
const MOIS_LABELS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

// ── Prompt système ─────────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `Tu es un agronome expert en semences maraîchères, potagères, hybrides,
semences de gazon et semences florales,
spécialisé sur les pays du Maghreb (Tunisie, Algérie, Maroc) et la région méditerranéenne.

Ton rôle : analyser le profil d'un agriculteur/jardinier et évaluer la compatibilité
de chaque semence proposée avec son contexte (pays, région, climat, sol, saison, objectifs).

Les documents fournis sont les fiches réelles du catalogue. Ils constituent la source de vérité
pour les caractéristiques des produits. Tu peux appliquer tes connaissances agronomiques générales
pour évaluer le profil, mais ne présente jamais une caractéristique absente de la fiche comme un fait.
Signale explicitement les informations manquantes et n'invente aucun produit.

RÈGLES STRICTES :
1. Tu réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après.
2. Tu retournes un tableau JSON dans l'ordre : meilleure semence en premier.
3. Pour chaque semence, tu fournis :
   - id_produit (number, exact, copié depuis l'input)
   - slug (string, exact, copié depuis l'input)
   - score (number entre 0 et 100, basé sur compatibilité réelle)
   - niveau ("excellent" si score≥75, "bon" si score≥50, "partiel" si score<50)
   - raison (string, 1 phrase courte max 15 mots, la raison principale du score)
   - details (string, explication agronomique complète ~40 mots, en français)
   - points_forts (array de 2-3 strings, chaque élément ~8 mots max)
   - avertissement (string ou null, si incompatibilité partielle avec le profil)

CRITÈRES DE SCORING (total 100 pts) :
- Adéquation saison/calendrier avec le mois indiqué : 25 pts
- Compatibilité sol avec les exigences de la culture : 20 pts
- Adaptation au climat et au pays/région : 20 pts
- Correspondance avec le mode de culture indiqué (Culture maraîchère, Culture standard,
  Culture hybride, Culture potagère) : 15 pts
- Alignement avec les objectifs (rendement, résistance, bio, etc.) : 15 pts
- Niveau de difficulté adapté à l'expérience du cultivateur : 5 pts

IMPORTANT :
- Base chaque résultat sur les fiches récupérées ci-dessous. Les données du catalogue priment.
- N'invente ni saison, résistance, rendement, certification ni caractéristique absente des fiches.
- Si les données ne permettent pas de confirmer une compatibilité, indique-le dans details ou avertissement.
- Les pays/régions sont déjà limités côté interface : ne propose pas d'hypothèse hors du pays/région indiqué.
- Traite correctement les catégories gazon/pelouse et florales, pas uniquement les légumes.
- Si un produit a peu de données, indique cette limite au lieu de lui attribuer des caractéristiques.
- Sois précis sur les réalités climatiques du pays/région indiqué.
- N'inclus que les semences avec score > 20 (filtre les incompatibles totales).
- Retourne au maximum 6 résultats, minimum 1.`;
}

function buildUserPrompt(profil: VisiteurProfil, produits: ProduitSemence[], totalCatalogue: number): string {
  const moisLabel = MOIS_LABELS[profil.mois] ?? "Mai";
  const objetifsStr = profil.objectifs.join(", ") || "Rendement général";

  return `PROFIL DU CULTIVATEUR :
- Pays : ${profil.pays}
- Région : ${profil.region || "Non précisée"}
- Climat : ${profil.climat}
- Mois de semis prévu : ${moisLabel} (mois ${profil.mois + 1})
- Type de sol : ${profil.sol || "Non précisé"}
- Mode de culture : ${profil.mode}
- Expérience : ${profil.experience}
- Objectifs : ${objetifsStr}

FICHES RÉCUPÉRÉES DU CATALOGUE (${produits.length} sur ${totalCatalogue} produits) :
${produits.map(p => `
ID:${p.id_produit} | Slug:${p.slug}
Nom: ${p.nom}
Catégorie: ${p.categorie}
Marque: ${p.marque ?? "—"}
Type: ${p.type_semence ?? "—"}
Saison: ${p.saison ?? "—"}
Bio: ${p.biologique ? "Oui" : "Non"}
Résistances: ${p.resistance ?? "—"}
Productivité: ${p.productivite ?? "—"}
Description: ${p.descriptif_var ?? p.description ?? "—"}
Tags: ${p.tags.join(", ") || "—"}
`).join("\n---\n")}

Évalue uniquement les fiches récupérées ci-dessus. Retourne au maximum 6 produits existants,
avec leur id_produit et slug exacts. N'ajoute pas de produit absent de ces fiches.`;
}

// Recherche lexicale locale dans le catalogue transmis par le site (RAG sans service vectoriel).
// Les champs du profil servent de requête et les fiches produit sont le contexte récupéré.
const SEARCH_STOP_WORDS = new Set([
  "avec", "dans", "pour", "une", "des", "les", "sur", "par", "plus", "mon", "mes",
  "the", "and", "for", "from", "with", "this", "that", "aux", "est", "sont", "sol",
]);

function normalizeSearchText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function searchTokens(value: unknown): string[] {
  return normalizeSearchText(value)
    .split(/\s+/)
    .filter(token => token.length > 2 && !SEARCH_STOP_WORDS.has(token));
}

function retrieveRelevantProducts(
  profil: VisiteurProfil,
  produits: ProduitSemence[],
  limit = 40,
): ProduitSemence[] {
  const month = typeof profil.mois === "number" ? profil.mois : -1;
  const monthLabel = MOIS_LABELS[month] ?? "";
  const objectives = (profil.objectifs ?? []).map(value => normalizeSearchText(value));
  const query = searchTokens([
    profil.pays, profil.region, profil.climat, profil.sol, profil.mode,
    profil.experience, ...(profil.objectifs ?? []), monthLabel,
  ].join(" "));

  return produits
    .map((product, index) => {
      const name = searchTokens(product.nom);
      const category = searchTokens(product.categorie);
      const type = searchTokens(product.type_semence);
      const tags = searchTokens((product.tags ?? []).join(" "));
      const description = searchTokens([
        product.descriptif_var, product.description, product.resistance,
        product.productivite, product.saison,
      ].join(" "));
      const fields = [
        { tokens: name, weight: 4 },
        { tokens: category, weight: 3 },
        { tokens: type, weight: 3 },
        { tokens: tags, weight: 2 },
        { tokens: description, weight: 1 },
      ];
      const productTokens = new Set(fields.flatMap(field => field.tokens));
      let score = query.reduce((total, token) => {
        if (!productTokens.has(token)) return total;
        const bestWeight = Math.max(...fields.filter(field => field.tokens.includes(token)).map(field => field.weight));
        return total + bestWeight;
      }, 0);

      const rawSeason = String(product.saison ?? "").trim();
      const season = normalizeSearchText(rawSeason);
      const monthMatches = /^[01]{12}$/.test(rawSeason)
        ? rawSeason[month] === "1"
        : Boolean(monthLabel && season.includes(normalizeSearchText(monthLabel)));
      if (month >= 0 && monthMatches) {
        score += 8;
      }
      if (product.biologique && objectives.some(objective => /bio|biolog|organic/.test(objective))) score += 5;

      return { product, index, score };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Math.min(limit, produits.length))
    .map(entry => entry.product);
}

// ── Handler POST ───────────────────────────────────────────────────────────────

// Recommender local pour garder le service disponible si l'API IA est indisponible.
function computeFallbackRecommendations(profil: VisiteurProfil, produits: ProduitSemence[]): RecommandationResult[] {
  const mois = typeof profil.mois === 'number' ? profil.mois : -1;
  const moisLabel = MOIS_LABELS[mois] ?? "";
  const objectifs = (profil.objectifs || []).map(o => String(o).toLowerCase());

  const scored = produits.map(p => {
    let score = 40;
    const reasons: string[] = [];

    // Saison: either textual or 12-char mask
    const saisonRaw = (p as any).calendrier_semis ?? p.saison ?? null;
    if (typeof saisonRaw === 'string') {
      const s = saisonRaw.toLowerCase();
      // 12-char mask check (e.g. "010010000000")
      if (/^[01]{12}$/.test(s) && mois >= 0) {
        if (s[mois] === '1') { score += 25; reasons.push('Semis adapté au mois'); }
      } else if (moisLabel && s.includes(moisLabel.toLowerCase())) {
        score += 20; reasons.push('Saison mentionnée');
      }
    }

    // Biologique objective
    if (p.biologique && objectifs.includes('culture biologique')) { score += 15; reasons.push('Produit biologique'); }

    // Sol compatibility (naïf: check tags/description)
    const sol = (profil.sol || '').toLowerCase();
    if (sol) {
      const hay = ((p.tags || []) as string[]).join(' ').toLowerCase() + ' ' + (p.descriptif_var || '') + ' ' + (p.description || '');
      if (hay.includes(sol)) { score += 10; reasons.push('Compatible avec le sol'); }
    }

    // Mode de culture hint
    const mode = (profil.mode || '').toLowerCase();
    if (mode) {
      const hay = ((p.tags || []) as string[]).join(' ').toLowerCase() + ' ' + (p.categorie || '') + ' ' + (p.type_semence || '');
      if (hay.includes(mode) || (p.categorie || '').toLowerCase().includes(mode)) { score += 10; reasons.push('Adapté au mode de culture'); }
    }

    // Climat hint
    const climat = (profil.climat || '').toLowerCase();
    if (climat) {
      const hay = ((p.tags || []) as string[]).join(' ').toLowerCase();
      if (hay.includes(climat.split(' ')[0])) { score += 5; reasons.push('Adapté au climat'); }
    }

    // Small bonus for product name matching objectives keywords
    const nameHay = (p.nom || '').toLowerCase();
    if (objectifs.some(o => nameHay.includes(o.split(' ')[0]))) { score += 5; reasons.push('Nom/description en accord'); }

    // Clamp and determine niveau
    score = Math.max(0, Math.min(100, Math.round(score)));
    const niveau = score >= 75 ? 'excellent' : score >= 50 ? 'bon' : 'partiel';

    const raison = reasons.length ? reasons[0] : 'Compatibilité estimée';
    const details = `Analyse heuristique: ${reasons.join('; ') || 'basée sur nom/catégorie/étiquettes'}.`;
    const points_forts = reasons.slice(0, 3).map(r => r.replace(/Produit|Semis/gi, '').trim()).filter(Boolean);

    return {
      id_produit: p.id_produit,
      slug: p.slug,
      score,
      niveau: niveau as RecommandationResult['niveau'],
      raison,
      details,
      points_forts,
      avertissement: undefined,
    } as RecommandationResult;
  });

  return scored
    .filter(r => r.score > 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { profil: VisiteurProfil; produits: ProduitSemence[] };
    const { profil, produits } = body;

    if (!profil || !produits?.length) {
      return NextResponse.json(
        { error: "Profil et produits requis" },
        { status: 400 }
      );
    }

    // Récupérer les fiches les plus proches du profil avant d'augmenter le prompt IA.
    const produitsRecuperes = retrieveRelevantProducts(profil, produits);

    // L'outil reste utilisable même sans clé IA (ou pendant une panne du fournisseur).
    if (!GROQ_API_KEY) {
      return NextResponse.json({ results: computeFallbackRecommendations(profil, produitsRecuperes) });
    }

    const groqBody = {
      model:       GROQ_MODEL,
      temperature: 0.2,   // bas pour des résultats cohérents et reproductibles
      max_tokens:  2048,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user",   content: buildUserPrompt(profil, produitsRecuperes, produits.length) },
      ],
    };

    let groqRes: Response;
    try {
      groqRes = await fetch(GROQ_URL, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify(groqBody),
      });
    } catch (upstreamError) {
      console.error("[semences/recommander] Groq request failed:", upstreamError);
      return NextResponse.json({ results: computeFallbackRecommendations(profil, produitsRecuperes) });
    }

    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => "");
      console.error("[semences/recommander] Groq error:", groqRes.status, errText);

      return NextResponse.json({ results: computeFallbackRecommendations(profil, produitsRecuperes) });
    }

    const groqData = await groqRes.json();
    const rawContent: string = groqData.choices?.[0]?.message?.content ?? "";

    // Parser le JSON retourné par le LLM
    let results: RecommandationResult[] = [];
    try {
      // Nettoyer les éventuels blocs markdown ```json ... ```
      const cleaned = rawContent
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      const parsed = JSON.parse(cleaned);
      results = Array.isArray(parsed) ? parsed : [];
    } catch (parseErr) {
      console.error("[semences/recommander] JSON parse failed:", parseErr, "\nRaw:", rawContent);
      return NextResponse.json({ results: computeFallbackRecommendations(profil, produitsRecuperes) });
    }

    // Validation + nettoyage des résultats
    const allowedProducts = new Map(produitsRecuperes.map(product => [product.id_produit, product]));
    const validated = results
      .filter(r =>
        typeof r.id_produit === "number" &&
        typeof r.slug === "string" &&
        typeof r.score === "number" &&
        typeof r.raison === "string" &&
        allowedProducts.get(r.id_produit)?.slug === r.slug
      )
      .map(r => ({
        id_produit:   r.id_produit,
        slug:         r.slug,
        score:        Math.min(100, Math.max(0, Math.round(r.score))),
        niveau:       (r.score >= 75 ? "excellent" : r.score >= 50 ? "bon" : "partiel") as RecommandationResult["niveau"],
        raison:       r.raison,
        details:      r.details ?? "",
        points_forts: Array.isArray(r.points_forts) ? r.points_forts.slice(0, 3) : [],
        avertissement: r.avertissement ?? null,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return NextResponse.json({
      results: validated.length ? validated : computeFallbackRecommendations(profil, produitsRecuperes),
    });

  } catch (err) {
    console.error("[semences/recommander] Unexpected error:", err);
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    );
  }
}
