import { detectPlant } from "./plant-detection";

const PLANT_KEYS = [
  "gazon",
  "fleurs",
  "tournesol",
  "basilic",
  "persil",
  "coriandre",
  "tomate",
  "poivron",
  "piment",
  "concombre",
  "courgette",
  "pasteque",
  "melon",
  "laitue",
  "carotte",
  "oignon",
  "haricot",
  "pois",
  "courge",
  "radis",
  "navet",
  "ail",
  "epinard",
  "brocoli",
  "chou",
  "poireau",
  "betterave",
  "blette",
  "celeri",
] as const;

type PlantKey = (typeof PLANT_KEYS)[number];

const cache = new Map<string, PlantKey | "">();

function toPlantKey(value: string): PlantKey | null {
  const normalized = value.trim().toLowerCase();
  return PLANT_KEYS.find((key) => key === normalized) ?? null;
}

function fallbackPlantKey(text: string): PlantKey | "" {
  return toPlantKey(detectPlant(text)) ?? "";
}

export async function detectPlantSemantic(params: {
  slug: string;
  nom: string;
  categoryName: string;
  usage?: string | null;
  descriptifVar?: string | null;
  typeSemence?: string | null;
}): Promise<PlantKey | ""> {
  const { slug, nom, categoryName, usage, descriptifVar, typeSemence } = params;
  const cacheKey = slug || nom;

  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const fallback = fallbackPlantKey(`${nom} ${categoryName} ${slug}`);
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    cache.set(cacheKey, fallback);
    return fallback;
  }

  const productText = [nom, categoryName, usage, typeSemence, descriptifVar]
    .filter(Boolean)
    .join(" | ");

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 10,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You are a seed catalog classifier. Return only one exact key from the list, with no explanation and no punctuation.",
          },
          {
            role: "user",
            content: `Given this product, return the single most matching key from this exact list:
${PLANT_KEYS.join(", ")}

Product: ${productText}

Return only the key.`,
          },
        ],
      }),
    });

    if (!response.ok) throw new Error(`Groq error: ${response.status}`);

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "";
    const detected = toPlantKey(raw);

    if (!detected) throw new Error(`Invalid plant key: ${raw}`);

    cache.set(cacheKey, detected);
    return detected;
  } catch {
    cache.set(cacheKey, fallback);
    return fallback;
  }
}
