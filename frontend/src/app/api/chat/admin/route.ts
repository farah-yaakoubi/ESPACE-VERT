// src/app/api/chat/admin/route.ts
// Assistant IA admin — Groq (llama-3.3-70b-versatile)

import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "llama-3.3-70b-versatile";
const BACKEND_URL  = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface ChatMessage { role: "user" | "assistant"; content: string; }

// ─── Fetch données internes ────────────────────────────────────────────────────
async function fetchAdminContext(token: string): Promise<string> {
  const headers = { Authorization: `Bearer ${token}` };
  const parts: string[] = [];

  await Promise.allSettled([
    fetch(`${BACKEND_URL}/admin/produits?limit=1`, { headers })
      .then(r => r.json())
      .then(d => { if (d.meta?.total !== undefined) parts.push(`Produits actifs dans le catalogue : ${d.meta.total}`); }),

    fetch(`${BACKEND_URL}/marques`)
      .then(r => r.json())
      .then(d => {
        const marques = (d.data ?? d ?? []) as Array<{ nom: string }>;
        if (marques.length > 0) parts.push(`Marques disponibles (${marques.length}) : ${marques.map(m => m.nom).join(", ")}`);
      }),

    fetch(`${BACKEND_URL}/activites`)
      .then(r => r.json())
      .then(d => {
        const activites = (d.data ?? d ?? []) as Array<{ nom: string }>;
        if (activites.length > 0) parts.push(`Activités (${activites.length}) : ${activites.map(a => a.nom).join(", ")}`);
      }),

    fetch(`${BACKEND_URL}/faq`)
      .then(r => r.json())
      .then(d => {
        const faqs = (d.data ?? d ?? []) as Array<{ question: string; reponse: string; rubrique?: string }>;
        if (faqs.length > 0) {
          parts.push(
            `FAQs configurées (${faqs.length}) :\n` +
            faqs.slice(0, 20).map((f, i) => `Q${i + 1}: ${f.question}\nR${i + 1}: ${f.reponse}`).join("\n\n")
          );
        }
      }),

    fetch(`${BACKEND_URL}/admin/devis?limit=1`, { headers })
      .then(r => r.json())
      .then(d => { if (d.meta?.total !== undefined) parts.push(`Total devis reçus : ${d.meta.total}`); }),

    fetch(`${BACKEND_URL}/admin/rdv?limit=1`, { headers })
      .then(r => r.json())
      .then(d => { if (d.meta?.total !== undefined) parts.push(`Total rendez-vous : ${d.meta.total}`); }),
  ]);

  return parts.join("\n\n─────────────────────────────\n\n");
}

// ─── System prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(context: string): string {
  return `Tu es l'assistant IA interne d'Espace Vert, destiné exclusivement aux administrateurs de la plateforme. Espace Vert est une entreprise tunisienne spécialisée dans les produits agricoles : irrigation, fertilisation, semences, machinisme, espace vert.

Tu as accès aux données internes de l'entreprise. Tes capacités :
- Analyser le catalogue produits, les marques, les catégories, les activités
- Répondre aux questions sur les FAQs configurées et leur contenu
- Aider à rédiger du contenu : descriptions produits, FAQ, actualités, emails clients
- Analyser les performances et donner des recommandations de gestion
- Expliquer comment utiliser les fonctionnalités de l'interface admin

Réponds de façon professionnelle et directe. Tu peux utiliser des **mots en gras** pour mettre en valeur les points importants.

Réponds UNIQUEMENT en JSON valide (sans markdown autour) :
{
  "reply": "Ta réponse détaillée. Utilise \\n pour les sauts de ligne et **texte** pour le gras.",
  "actions": [
    { "label": "Voir les produits", "href": "/admin/produits", "type": "link" }
  ]
}

Pages admin disponibles comme actions :
/admin/dashboard · /admin/produits · /admin/marques · /admin/activites · /admin/categories
/admin/faq · /admin/devis · /admin/rdv · /admin/contact · /admin/actualites
/admin/admins · /admin/analytics · /admin/audit · /admin/visiteurs

Si aucune action pertinente, retourne "actions": [].

DONNÉES DISPONIBLES ACTUELLEMENT :
${context || "Aucune donnée chargée."}`;
}

// ─── POST handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { reply: "Assistant IA non configuré (clé GROQ_API_KEY manquante).", actions: [] },
        { status: 503 }
      );
    }

    const { message, history = [] }: { message: string; history: ChatMessage[] } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message vide" }, { status: 400 });
    }

    const context      = await fetchAdminContext(token);
    const systemPrompt = buildSystemPrompt(context);

    // Format OpenAI-compatible (Groq utilise le même format)
    const recentHistory = history.slice(-12);
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
        temperature: 0.7,
        max_tokens:  1000,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      console.error("Groq API error:", err);
      return NextResponse.json(
        { reply: "Service IA temporairement indisponible. Réessayez.", actions: [] },
        { status: 502 }
      );
    }

    const groqData = await groqRes.json() as { choices?: Array<{ message?: { content: string } }> };
    const raw = groqData.choices?.[0]?.message?.content ?? "{}";

    // Nettoyer les éventuels blocs ```json ... ```
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    let parsed: { reply: string; actions?: Array<{ label: string; href?: string; type: string }> };
    try   { parsed = JSON.parse(cleaned); }
    catch { parsed = { reply: cleaned || "Réponse non disponible.", actions: [] }; }

    return NextResponse.json({
      reply:   parsed.reply   ?? "Réponse non disponible.",
      actions: parsed.actions ?? [],
    });

  } catch (error) {
    console.error("Admin chatbot error:", error);
    return NextResponse.json(
      { reply: "Erreur serveur. Réessayez.", actions: [] },
      { status: 500 }
    );
  }
}