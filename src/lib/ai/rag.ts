import { db } from "@/lib/db";
import { cosineSimilarity, embedTexts } from "./embeddings";

export type RetrievedChunk = {
  content: string;
  sourceTitle: string;
  score: number;
};

/** Retrieves the top-K grounding chunks for a persona relevant to `query`. */
export async function retrieveGroundingChunks(
  personaId: string,
  query: string,
  topK = 5,
): Promise<RetrievedChunk[]> {
  const chunks = await db.groundingChunk.findMany({
    where: { personaId },
    include: { source: { select: { title: true } } },
  });
  if (chunks.length === 0) return [];

  const [queryEmbedding] = await embedTexts([query], "query");

  const scored = chunks.map((c) => ({
    content: c.content,
    sourceTitle: c.source.title,
    score: cosineSimilarity(queryEmbedding, c.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
