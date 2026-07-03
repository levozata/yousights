import { AI_CONFIG, hasEmbeddingProvider } from "./config";

const LOCAL_EMBEDDING_DIM = 256;

/**
 * Local, dependency-free lexical embedding: a hashed bag-of-words vector,
 * L2-normalised. It has none of the semantic power of a trained embedding
 * model, but it keeps retrieval (and the whole app) functional with zero
 * external services — a deliberate offline fallback, not a mock.
 */
function localEmbedding(text: string): number[] {
  const vec = new Array(LOCAL_EMBEDDING_DIM).fill(0);
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
    }
    const idx = hash % LOCAL_EMBEDDING_DIM;
    vec[idx] += 1;
  }

  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

async function voyageEmbedding(texts: string[], inputType: "document" | "query"): Promise<number[][]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_CONFIG.voyageApiKey}`,
    },
    body: JSON.stringify({
      input: texts,
      model: "voyage-3-lite",
      input_type: inputType,
    }),
  });

  if (!res.ok) {
    throw new Error(`Voyage embeddings request failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data.map((d) => d.embedding);
}

export async function embedTexts(texts: string[], inputType: "document" | "query" = "document"): Promise<number[][]> {
  if (texts.length === 0) return [];
  if (hasEmbeddingProvider()) {
    try {
      return await voyageEmbedding(texts, inputType);
    } catch (err) {
      console.error("Voyage embedding failed, falling back to local embedding:", err);
    }
  }
  return texts.map(localEmbedding);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
