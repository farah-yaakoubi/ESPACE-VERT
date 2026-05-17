// src/modules/ai/ai.controller.ts
// Chatbot public Espace Vert — Groq (llama-3.3-70b-versatile)

import { Request, Response } from "express";
import { prisma }            from "../../lib/prisma";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "llama-3.3-70b-versatile"; // rapide et gratuit sur Groq

interface ChatMessage { role: "user" | "assistant"; content: string; }

// ─── Contexte public depuis la DB ─────────────────────────────────────────────
async function fetchContext(): Promise<string> {
  const parts: string[] = [];

  try {
    const faqs = await prisma.faq.findMany({
      where:   { active: true },
      select:  { question: true, reponse: true, categorie: true },
      take:    30,
      orderBy: [{ ordre: "asc" }, { nb_consultations: "desc" }],
    });
    if (faqs.length > 0) {
      parts.push(
        `BASE DE CONNAISSANCE FAQ (${faqs.length} entrées) :\n` +
        faqs.map((f, i) =>
          `[${f.categorie ?? "Général"}] Q${i + 1}: ${f.question}\nR${i + 1}: ${f.reponse}`
        ).join("\n\n")
      );
    }
  } catch {}

  try {
    const marques = await prisma.marque.findMany({
      where:  { actif: true },
      select: { nom: true, slug: true, description: true },
    });
    if (marques.length > 0) {
      parts.push(
        `MARQUES DISPONIBLES :\n` +
        marques.map(m => `- ${m.nom}${m.description ? ` : ${m.description.substring(0, 120)}` : ""} → /marques/${m.slug}`).join("\n")
      );
    }
  } catch {}

  try {
    const activites = await prisma.activite.findMany({
      where:   { actif: true },
      select:  { nom: true, slug: true, description: true },
      orderBy: { ordre: "asc" },
    });
    if (activites.length > 0) {
      parts.push(
        `ACTIVITÉS / DOMAINES :\n` +
        activites.map(a => `- ${a.nom}${a.description ? ` : ${a.description.substring(0, 120)}` : ""} → /activites/${a.slug}`).join("\n")
      );
    }
  } catch {}

  return parts.join("\n\n─────────────────────────────\n\n");
}

// ─── System prompt ─────────────────────────────────────────────────────────────
function buildSystem(context: string): string {
  return `Tu es l'assistant virtuel d'Espace Vert, entreprise tunisienne spécialisée dans les produits agricoles et horticoles : irrigation, fertilisation, semences, machinisme agricole, espace vert et jardinage.

Ton rôle est d'aider les visiteurs à :
- Trouver des produits et des informations techniques
- Répondre aux questions fréquentes (FAQ)
- Les orienter vers les bonnes pages du site
- Les inciter à prendre contact ou demander un devis

RÈGLES STRICTES :
- Réponds TOUJOURS en français, de façon concise et professionnelle
- Ne jamais inventer de prix, références ou disponibilités produits
- Si tu ne sais pas, propose de contacter l'équipe Espace Vert
- Réponds UNIQUEMENT avec ce JSON valide (pas de markdown, pas de texte avant/après) :
{"reply":"ta réponse ici","actions":[{"label":"Texte bouton","href":"/chemin","type":"link"}]}

ACTIONS DISPONIBLES (utilise si pertinent) :
- /produits → Voir tous les produits
- /activites → Voir les activités / domaines
- /marques → Voir les marques
- /devis → Demander un devis
- /rendez-vous → Prendre un rendez-vous
- /contact → Nous contacter
- /actualites → Actualités et conseils

Si aucune action pertinente, retourne "actions":[].

DONNÉES DISPONIBLES :
${context || "Aucune donnée chargée pour l'instant."}`;
}

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
export async function aiChat(req: Request, res: Response): Promise<void> {
  if (!GROQ_API_KEY) {
    res.status(503).json({ reply: "Chatbot temporairement indisponible (clé GROQ_API_KEY manquante).", actions: [] });
    return;
  }

  const { message, history = [] } = req.body as { message: string; history: ChatMessage[] };

  if (!message?.trim()) {
    res.status(400).json({ error: "Message vide" });
    return;
  }

  // Incrémenter nb_consultations FAQ (non bloquant)
  prisma.faq.findFirst({
    where: { active: true, question: { contains: message.substring(0, 50) } },
    select: { id_faq: true },
  }).then(faq => {
    if (faq) prisma.faq.update({
      where: { id_faq: faq.id_faq },
      data:  { nb_consultations: { increment: 1 } },
    }).catch(() => {});
  }).catch(() => {});

  try {
    const context      = await fetchContext();
    const systemPrompt = buildSystem(context);

    // Format OpenAI-compatible (Groq utilise le même format)
    const recentHistory = (history as ChatMessage[]).slice(-8);
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }
    messages.push({ role: "user", content: message.trim() });

    const groqRes = await fetch(GROQ_URL, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        messages,
        temperature: 0.5,
        max_tokens:  700,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      console.error("[ai.controller] Groq error:", err);
      res.status(502).json({
        reply:   "Service temporairement indisponible. Réessayez dans un instant.",
        actions: [{ label: "Nous contacter", href: "/contact", type: "link" }],
      });
      return;
    }

    const data    = await groqRes.json() as { choices?: Array<{ message?: { content: string } }> };
    const raw     = data.choices?.[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    let parsed: { reply?: string; actions?: unknown[] };
    try   { parsed = JSON.parse(cleaned); }
    catch { parsed = { reply: cleaned, actions: [] }; }

    res.json({
      reply:   parsed.reply   ?? "Réponse non disponible.",
      actions: parsed.actions ?? [],
    });

  } catch (err) {
    console.error("[ai.controller] error:", err);
    res.status(500).json({
      reply:   "Une erreur s'est produite. Veuillez réessayer.",
      actions: [{ label: "Nous contacter", href: "/contact", type: "link" }],
    });
  }
}
// ─── POST /api/ai/recommend-semences ──────────────────────────────────────────
// Recommande des semences du catalogue en croisant données OpenFarm + Groq LLM
export async function aiRecommendSemences(req: Request, res: Response): Promise<void> {
  if (!GROQ_API_KEY) {
    res.status(503).json({ error: "Service indisponible (clé GROQ_API_KEY manquante)." });
    return;
  }

  const { culture, mois, sol } = req.body as {
    culture: string; mois?: string; sol?: string;
  };

  if (!culture?.trim()) {
    res.status(400).json({ error: "Paramètre 'culture' requis." });
    return;
  }

  try {
    // ── 1. Données agronomiques OpenFarm (API publique, sans clé) ────────────
    let cropData = "";
    try {
      const ofRes = await fetch(
        `https://openfarm.cc/api/v1/crops?q=${encodeURIComponent(culture.trim())}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (ofRes.ok) {
        const ofJson = await ofRes.json() as any;
        const crop   = ofJson?.data?.[0];
        if (crop?.attributes) {
          const a = crop.attributes;
          cropData = [
            a.name           && `Nom botanique : ${a.name}`,
            a.description    && `Description : ${String(a.description).substring(0, 400)}`,
            a.sun_requirements && `Ensoleillement : ${a.sun_requirements}`,
            a.sowing_method  && `Mode de semis : ${a.sowing_method}`,
            a.spread         && `Espacement : ${a.spread} cm`,
            a.row_spacing    && `Inter-rangs : ${a.row_spacing} cm`,
            a.height         && `Hauteur à maturité : ${a.height} cm`,
            a.growing_degree_days && `Degrés-jours croissance : ${a.growing_degree_days}`,
          ].filter(Boolean).join("\n");
        }
      }
    } catch {
      // OpenFarm inaccessible → on continue sans données externes
    }

    // ── 2. Catalogue semences depuis la DB ────────────────────────────────────
    const semencesActivite = await prisma.activite.findFirst({
     where: { slug: "semences-et-plants", actif: true },
      select: { id_activite: true },
    });

    const produits = semencesActivite
      ? await prisma.produit.findMany({
          where: {
            id_activite: semencesActivite.id_activite,
            actif:       true,
          },
          select: {
            id_produit:  true,
            nom:         true,
            slug:        true,
            description: true,
            tags:        true,
            images:      {
              select:  { url: true, alt: true },
              orderBy: { ordre: "asc" },
              take:    1,
            },
            categorie: { select: { nom: true } },
          },
          take:    100,
          orderBy: { ordre: "asc" },
        })
      : [];

    if (produits.length === 0) {
      res.json({ recommendations: [], message: "Aucun produit semence disponible dans le catalogue." });
      return;
    }

    const catalogueTxt = produits
      .map(p =>
        `ID:${p.id_produit} | "${p.nom}" | Catégorie: ${p.categorie.nom}` +
        (p.description ? ` | ${String(p.description).substring(0, 80)}` : "")
      )
      .join("\n");

    // ── 3. Prompt Groq ────────────────────────────────────────────────────────
    const userPrompt =
      `Un agriculteur souhaite cultiver : "${culture.trim()}".` +
      (mois ? `\nMois de semis prévu : ${mois}.` : "") +
      (sol  ? `\nType de sol : ${sol}.` : "") +
      (cropData ? `\n\nDONNÉES AGRONOMIQUES OPENFARM :\n${cropData}` : "") +
      `\n\nCATALOGUE DISPONIBLE (semences) :\n${catalogueTxt}` +
      `\n\nSélectionne entre 3 et 5 produits du catalogue ci-dessus qui sont les mieux adaptés à la culture de "${culture.trim()}" selon les conditions indiquées. Si aucun produit ne correspond, retourne un tableau vide.\n` +
      `Réponds UNIQUEMENT avec ce JSON valide, sans markdown, sans texte autour :\n` +
      `{"recommendations":[{"id_produit":123,"nom":"Nom produit","slug":"slug","raison":"1-2 phrases expliquant pourquoi ce produit est adapté"}]}`;

    const groqRes = await fetch(GROQ_URL, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        messages: [
          {
            role:    "system",
            content: "Tu es un expert agronome tunisien. Tu réponds UNIQUEMENT avec du JSON valide, sans markdown, sans texte avant ni après. Ne jamais inventer de produits — sélectionne uniquement parmi la liste fournie.",
          },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.25,
        max_tokens:  900,
      }),
    });

    if (!groqRes.ok) {
      console.error("[ai.controller] Groq recommend-semences error:", groqRes.status);
      res.status(502).json({ error: "Service IA temporairement indisponible. Veuillez réessayer." });
      return;
    }

    const data    = await groqRes.json() as { choices?: Array<{ message?: { content: string } }> };
    const raw     = data.choices?.[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed: { recommendations?: any[]; message?: string } = {};
    try   { parsed = JSON.parse(cleaned); }
    catch { parsed = { recommendations: [] }; }

    const recs = (parsed.recommendations ?? []).slice(0, 5);

    // ── 4. Enrichissement avec images / catégorie depuis la DB ───────────────
    const ids      = recs.map((r: any) => Number(r.id_produit));
    const enriched = produits.filter(p => ids.includes(p.id_produit));

    const final = recs
      .map((r: any) => {
        const p = enriched.find(e => e.id_produit === Number(r.id_produit));
        if (!p) return null; // sécurité : on ignore les IDs inventés
        return {
          id_produit: p.id_produit,
          nom:        p.nom,
          slug:       p.slug,
          raison:     r.raison ?? "",
          categorie:  p.categorie?.nom ?? "",
          images:     p.images ?? [],
        };
      })
      .filter(Boolean);

    res.json({
      recommendations: final,
      message:         final.length === 0
        ? `Aucune semence spécifique à "${culture}" n'a été trouvée dans notre catalogue. Parcourez nos catégories pour découvrir toutes nos variétés disponibles.`
        : null,
    });

  } catch (err) {
    console.error("[ai.controller] recommend-semences error:", err);
    res.status(500).json({ error: "Erreur serveur. Veuillez réessayer." });
  }
}
