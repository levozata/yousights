import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace, isNextResponse } from "@/lib/api-helpers";
import { SECTOR_PACKS } from "@/lib/sector-packs/data";

export async function GET() {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;

  const loaded = await db.loadedPack.findMany({ where: { workspaceId: ctx.workspace.id } });
  const loadedSlugs = new Set(loaded.map((l) => l.slug));

  const packs = SECTOR_PACKS.map((p) => ({
    slug: p.slug,
    name: p.name,
    description: p.description,
    note: p.note ?? null,
    segmentCount: p.segments.length,
    personaCount: p.segments.reduce((sum, s) => sum + s.personas.length, 0),
    studyTemplates: p.studyTemplates,
    journeyScaffold: p.journeyScaffold,
    groundingTemplates: p.groundingTemplates,
    loaded: loadedSlugs.has(p.slug),
  }));

  return NextResponse.json(packs);
}
