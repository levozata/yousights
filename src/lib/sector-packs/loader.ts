import { db } from "@/lib/db";
import { getSectorPack } from "./data";

/**
 * Loads a sector pack into a workspace's persona library: segments +
 * starter personas (unground, origin PACK — grounding-strength stays 0
 * until the team calibrates with real data, per §14) and a journey
 * scaffold. Idempotent per workspace.
 */
export async function loadSectorPack(workspaceId: string, slug: string) {
  const pack = getSectorPack(slug);
  if (!pack) throw new Error(`Unknown sector pack: ${slug}`);

  const already = await db.loadedPack.findUnique({ where: { workspaceId_slug: { workspaceId, slug } } });
  if (already) return { alreadyLoaded: true };

  for (const seg of pack.segments) {
    const segment = await db.segment.create({
      data: {
        workspaceId,
        name: seg.name,
        definition: seg.definition,
        tags: ["sector-pack", pack.slug],
      },
    });

    for (const persona of seg.personas) {
      await db.persona.create({
        data: {
          workspaceId,
          segmentId: segment.id,
          origin: "PACK",
          name: persona.name,
          tagline: persona.tagline,
          role: persona.role,
          demographics: persona.demographics,
          context: persona.context,
          beliefs: persona.beliefs,
          priorAttempts: persona.priorAttempts,
          skepticismSources: persona.skepticismSources,
          decisionProcess: persona.decisionProcess,
          consults: persona.consults,
          dealbreakers: persona.dealbreakers,
          bigFive: persona.bigFive,
          values: persona.values,
          motivations: persona.motivations,
          decisionBehaviour: persona.decisionBehaviour,
          tags: [...persona.tags, "sector-pack"],
          groundingStrength: 0,
        },
      });
    }
  }

  await db.journey.create({
    data: {
      workspaceId,
      name: pack.journeyScaffold.name,
      stages: pack.journeyScaffold.stages,
      scaffoldSource: pack.slug,
    },
  });

  await db.loadedPack.create({ data: { workspaceId, slug: pack.slug } });

  return { alreadyLoaded: false };
}
