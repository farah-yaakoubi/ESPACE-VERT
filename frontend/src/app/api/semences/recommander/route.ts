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
- Utilise tes connaissances agronomiques réelles, pas seulement les données fournies.
- Les pays/régions sont déjà limités côté interface : ne propose pas d'hypothèse hors du pays/région indiqué.
- Traite correctement les catégories gazon/pelouse et florales, pas uniquement les légumes.
- Si un produit a peu de données, base-toi sur le nom et la catégorie pour inférer.
- Sois précis sur les réalités climatiques du pays/région indiqué.
- N'inclus que les semences avec score > 20 (filtre les incompatibles totales).
- Retourne au maximum 6 résultats, minimum 1.`;
}

function buildUserPrompt(profil: VisiteurProfil, produits: ProduitSemence[]): string {
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

CATALOGUE DE SEMENCES À ÉVALUER (${produits.length} produits) :
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

Analyse chaque semence et retourne le JSON.`;
}

// ── Handler POST ───────────────────────────────────────────────────────────────

// Simple local fallback recommender used when the upstream LLM is rate-limited.
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
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Service IA indisponible (clé manquante)" },
        { status: 503 }
      );
    }

    const body = await req.json() as { profil: VisiteurProfil; produits: ProduitSemence[] };
    const { profil, produits } = body;

    if (!profil || !produits?.length) {
      return NextResponse.json(
        { error: "Profil et produits requis" },
        { status: 400 }
      );
    }

    // Limiter à 30 produits max pour ne pas dépasser le contexte
    const produitsLimites = produits.slice(0, 30);

    const groqBody = {
      model:       GROQ_MODEL,
      temperature: 0.2,   // bas pour des résultats cohérents et reproductibles
      max_tokens:  2048,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user",   content: buildUserPrompt(profil, produitsLimites) },
      ],
    };

    const groqRes = await fetch(GROQ_URL, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(groqBody),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => "");
      console.error("[semences/recommander] Groq error:", groqRes.status, errText);

      // If Groq rate limit (429) or explicit rate-limit error, compute a local fallback
      if (groqRes.status === 429 || /rate[_-]?limit/i.test(errText)) {
        try {
          const fallback = computeFallbackRecommendations(profil, produitsLimites);
          return NextResponse.json({ results: fallback });
        } catch (fbErr) {
          console.error("[semences/recommander] Fallback failed:", fbErr);
          return NextResponse.json({ error: "Service IA temporairement indisponible" }, { status: 503 });
        }
      }

      return NextResponse.json(
        { error: `Erreur IA (${groqRes.status})` },
        { status: 502 }
      );
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
      return NextResponse.json(
        { error: "Réponse IA invalide, réessayez." },
        { status: 500 }
      );
    }

    // Validation + nettoyage des résultats
    const validated = results
      .filter(r =>
        typeof r.id_produit === "number" &&
        typeof r.slug === "string" &&
        typeof r.score === "number" &&
        typeof r.raison === "string"
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

    return NextResponse.json({ results: validated });

  } catch (err) {
    console.error("[semences/recommander] Unexpected error:", err);
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    );
  }
}
