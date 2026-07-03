import { db } from "@/lib/db";
import type { GroundingSourceType } from "@/generated/prisma/client";
import { chunkText } from "./chunking";
import { embedTexts } from "./embeddings";
import { computeGroundingStrength } from "./grounding-strength";

/** Ingests a grounding source: chunk, embed, persist, and recompute the
 *  persona's grounding-strength indicator (§3). */
export async function ingestGroundingSource(params: {
  personaId: string;
  type: GroundingSourceType;
  title: string;
  rawText: string;
  fileName?: string;
  citationUrl?: string;
}) {
  const source = await db.groundingSource.create({
    data: {
      personaId: params.personaId,
      type: params.type,
      title: params.title,
      rawText: params.rawText,
      fileName: params.fileName,
      citationUrl: params.citationUrl,
    },
  });

  const chunks = chunkText(params.rawText);
  if (chunks.length) {
    const embeddings = await embedTexts(chunks, "document");
    await db.groundingChunk.createMany({
      data: chunks.map((content, i) => ({
        sourceId: source.id,
        personaId: params.personaId,
        chunkIndex: i,
        content,
        embedding: embeddings[i],
      })),
    });
  }

  await recomputeGroundingStrength(params.personaId);

  return source;
}

export async function recomputeGroundingStrength(personaId: string) {
  const sources = await db.groundingSource.findMany({
    where: { personaId },
    select: { type: true, rawText: true },
  });
  const groundingStrength = computeGroundingStrength(sources);
  await db.persona.update({ where: { id: personaId }, data: { groundingStrength } });
  return groundingStrength;
}

export async function deleteGroundingSource(sourceId: string) {
  const source = await db.groundingSource.delete({ where: { id: sourceId } });
  await recomputeGroundingStrength(source.personaId);
}
