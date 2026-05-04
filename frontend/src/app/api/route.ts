// src/app/api/chat/route.ts
// Route API Next.js — reçoit les messages, fetch FAQs, appelle OpenAI

import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const BACKEND_URL    = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage { role: "user" | "assistant" | "system"; content: string; }
interface Faq         { question: string; reponse: string; }

// ─── Fetch FAQs depuis la BDD via votre API backend ──────────────────────────
async function fetchFaqs(): Promise<Faq[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/faqs`, { next: { revalidate: 300 } }); // cache 5 min
    const data = await res.json();
    return (data.data ?? data ?? []) as Faq[];
  } catch {
    return [];
  }
}

// ─── Construit le system prompt avec les FAQs ─────────────────────────────────
function buildSystemPrompt(faqs: Faq[]): string {
  const faqBlock = faqs.length > 0
    ? `\n\nVoici les FAQ disponibles (utilise-les en priorité pour répondre) :\n` +
      faqs.map((f, i) => `Q${i + 1}: ${f.question}\nR${i + 1}: ${f.reponse}`).join("\n\n")
    : "";

  return `Tu es l'assistant virtuel d'Espace Vert, une entreprise agricole tunisienne spécialisée dans l'irrigation, la fertilisation, les semences, le machinisme agricole et la pulvérisation.

Tes marques sont : Fertivert (engrais biologiques), Pulvert (pulvérisation), Matar (irrigation connectée).

Ton rôle :
1. Répondre aux questions agricoles et sur les produits d'Espace Vert
2. Utiliser les FAQs fournies en priorité
3. Proposer des redirections pertinentes selon le contexte
4. Être concis, professionnel et chaleureux en français
5. Si tu ne sais pas, rediriger vers le contact ou un RDV

Format de ta réponse — réponds UNIQUEMENT en JSON valide :
{
  "reply": "Ta réponse en texte",
  "actions": [
    { "label": "Texte du bouton", "href": "/chemin", "type": "link" }
  ]
}

Redirections disponibles :
- Catalogue produits → /catalogue
- Contact → /contact  
- Rendez-vous → /rendez-vous
- Irrigation → /activites/irrigation
- Semences → /activites/semences-et-plants
- Fertilisation → /activites/fertilisation
- Machinisme → /activites/machinisme-et-jardinage
- Pulvérisation → /activites/pulverisation
- Fertivert → /marques/fertivert
- Pulvert → /marques/pulvert
- Matar → /marques/matar

Ne mets JAMAIS de markdown dans "reply". Texte brut uniquement.
Si aucune action n'est pertinente, retourne "actions": [].${faqBlock}`;
}

// ─── Handler POST ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { message, history = [] }: { message: string; history: ChatMessage[] } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message vide" }, { status: 400 });
    }

    // 1. Charger les FAQs
    const faqs = await fetchFaqs();

    // 2. Construire les messages pour OpenAI
    const messages: ChatMessage[] = [
      { role: "system", content: buildSystemPrompt(faqs) },
      ...history.slice(-8), // max 8 messages d'historique
      { role: "user", content: message },
    ];

    // 3. Appel OpenAI
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",       // rapide et économique
        messages,
        max_tokens: 500,
        temperature: 0.5,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json();
      console.error("OpenAI error:", err);
      throw new Error(err.error?.message ?? "Erreur OpenAI");
    }

    const openaiData = await openaiRes.json();
    const raw = openaiData.choices?.[0]?.message?.content ?? "{}";

    // 4. Parser la réponse JSON
    let parsed: { reply: string; actions?: Array<{ label: string; href?: string; type: string }> };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { reply: raw, actions: [] };
    }

    return NextResponse.json({
      reply:   parsed.reply   ?? "Je n'ai pas pu générer une réponse.",
      actions: parsed.actions ?? [],
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        reply: "Une erreur s'est produite. Veuillez réessayer.",
        actions: [{ label: "Nous contacter", href: "/contact", type: "link" }],
      },
      { status: 500 }
    );
  }
}