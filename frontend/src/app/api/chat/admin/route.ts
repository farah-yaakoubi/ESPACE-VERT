// src/app/api/chat/admin/route.ts
// Route chat admin — accès élargi aux données internes (stats, produits, devis...)

import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const BACKEND_URL    = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface ChatMessage { role: "user" | "assistant" | "system"; content: string; }

// ─── Fetch données internes ────────────────────────────────────────────────────
async function fetchAdminContext(token: string): Promise<string> {
  const headers = { Authorization: `Bearer ${token}` };
  const parts: string[] = [];

  try {
    // Stats produits
    const prodRes = await fetch(`${BACKEND_URL}/admin/produits?limit=5`, { headers });
    const prodData = await prodRes.json();
    const total = prodData.meta?.total ?? "?";
    parts.push(`Produits actifs dans le catalogue : ${total}`);
  } catch {}

  try {
    // FAQs
    const faqRes  = await fetch(`${BACKEND_URL}/faqs`, { next: { revalidate: 300 } });
    const faqData = await faqRes.json();
    const faqs = (faqData.data ?? faqData ?? []) as Array<{ question: string; reponse: string }>;
    if (faqs.length > 0) {
      parts.push(`\nFAQs disponibles (${faqs.length}) :\n` +
        faqs.map((f, i) => `Q${i + 1}: ${f.question}\nR${i + 1}: ${f.reponse}`).join("\n\n"));
    }
  } catch {}

  try {
    // Marques
    const marqRes  = await fetch(`${BACKEND_URL}/marques`);
    const marqData = await marqRes.json();
    const marques = (marqData.data ?? marqData ?? []) as Array<{ nom: string }>;
    parts.push(`Marques : ${marques.map(m => m.nom).join(", ")}`);
  } catch {}

  return parts.join("\n\n");
}

// ─── System prompt admin ──────────────────────────────────────────────────────
function buildAdminPrompt(context: string): string {
  return `Tu es l'assistant IA interne d'Espace Vert, destiné aux administrateurs de la plateforme.

Tu as accès aux données internes de l'entreprise. Tu peux :
- Analyser le catalogue produits, les marques, les catégories
- Répondre aux questions sur les FAQs configurées
- Donner des conseils de gestion et d'optimisation
- Aider à rédiger du contenu (descriptions produits, FAQ, actualités)
- Analyser les tendances et faire des recommandations

Réponds UNIQUEMENT en JSON valide :
{
  "reply": "Ta réponse détaillée en texte brut (pas de markdown)",
  "actions": [
    { "label": "Voir les produits", "href": "/admin/produits", "type": "link" }
  ]
}

Si aucune action pertinente, retourne "actions": [].

Données disponibles actuellement :
${context || "Aucune donnée chargée."}`;
}

// ─── Handler POST ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Vérifier le token admin
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { message, history = [] }: { message: string; history: ChatMessage[] } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message vide" }, { status: 400 });
    }

    // Charger le contexte interne
    const context = await fetchAdminContext(token);

    const messages: ChatMessage[] = [
      { role: "system", content: buildAdminPrompt(context) },
      ...history.slice(-10),
      { role: "user", content: message },
    ];

    // Appel OpenAI
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 800,
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json();
      throw new Error(err.error?.message ?? "Erreur OpenAI");
    }

    const openaiData = await openaiRes.json();
    const raw = openaiData.choices?.[0]?.message?.content ?? "{}";

    let parsed: { reply: string; actions?: Array<{ label: string; href?: string; type: string }> };
    try { parsed = JSON.parse(raw); }
    catch { parsed = { reply: raw, actions: [] }; }

    return NextResponse.json({
      reply:   parsed.reply   ?? "Réponse non disponible.",
      actions: parsed.actions ?? [],
    });

  } catch (error) {
    console.error("Admin chat error:", error);
    return NextResponse.json(
      { reply: "Erreur serveur. Réessayez.", actions: [] },
      { status: 500 }
    );
  }
}