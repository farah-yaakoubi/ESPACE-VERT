const HF_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";
const HF_FEATURE_EXTRACTION_URL =
  `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`;

export async function getEmbedding(text: string): Promise<number[]> {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error("HF_TOKEN is missing");
  }

  let response: Response;
  try {
    response = await fetch(
      HF_FEATURE_EXTRACTION_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      },
    );
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown network error";
    throw new Error(`HuggingFace network error: ${detail}`);
  }

  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.status}`);
  }

  const data = await response.json();
  const vector = Array.isArray(data?.[0]) ? data[0] : data;
  if (!Array.isArray(vector)) {
    throw new Error("Invalid HuggingFace embedding response");
  }

  return vector.map(Number);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));

  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}
