import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_ITEMS = 40;
const MAX_TEXT_LENGTH = 6000;

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) {
    return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
  }
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: "Translation service is not configured" }, { status: 503 });
  }

  let body: { locale?: unknown; texts?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const locale = body.locale;
  const texts = body.texts;
  if ((locale !== "en" && locale !== "ar") || !Array.isArray(texts) || texts.length > MAX_ITEMS ||
      !texts.every((value) => typeof value === "string" && value.length <= MAX_TEXT_LENGTH) ||
      texts.reduce((total, value) => total + (typeof value === "string" ? value.length : 0), 0) > 24000) {
    return NextResponse.json({ error: "Invalid translation request" }, { status: 400 });
  }
  if (texts.length === 0) return NextResponse.json({ translations: [] });

  const language = locale === "ar" ? "Modern Standard Arabic" : "English";
  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `Translate each input string into ${language}. Preserve meaning, names, numbers, URLs, HTML entities, and placeholders. Keep product and brand names unchanged unless they are ordinary descriptive words. Return only JSON: {"translations":["..."]}, in the same order and with the same number of items.` },
          { role: "user", content: JSON.stringify(texts) },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Translation provider failed" }, { status: 502 });
    }
    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.translations) || parsed.translations.length !== texts.length ||
        !parsed.translations.every((item: unknown) => typeof item === "string")) {
      return NextResponse.json({ error: "Invalid translation response" }, { status: 502 });
    }
    return NextResponse.json({ translations: parsed.translations });
  } catch {
    return NextResponse.json({ error: "Translation provider unavailable" }, { status: 502 });
  }
}
