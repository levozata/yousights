import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";
import type { PersonaDraft } from "@/lib/ai/persona-draft";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() ?? "";
  const tag = searchParams.get("tag");

  const personas = await db.persona.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      archived: false,
      ...(tag ? { tags: { has: tag } } : {}),
    },
    include: {
      segment: { select: { id: true, name: true } },
      _count: { select: { groundingSources: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const filtered = q
    ? personas.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline?.toLowerCase().includes(q) ||
          p.role?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      )
    : personas;

  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;

  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const draft = body.draft as PersonaDraft | undefined;
  const origin = body.origin ?? "BRIEF";

  if (!draft?.name) return jsonError("draft.name is required");

  const persona = await db.persona.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: draft.name,
      tagline: draft.tagline,
      origin,
      tags: draft.tags ?? [],
      role: draft.role,
      demographics: draft.demographics ?? {},
      context: draft.context,
      beliefs: draft.beliefs,
      priorAttempts: draft.priorAttempts,
      skepticismSources: draft.skepticismSources,
      decisionProcess: draft.decisionProcess,
      consults: draft.consults,
      dealbreakers: draft.dealbreakers,
      bigFive: draft.bigFive ?? {},
      values: draft.values ?? [],
      motivations: draft.motivations,
      decisionBehaviour: draft.decisionBehaviour,
      segmentId: body.segmentId ?? null,
    },
  });

  if (body.sourceLabel) {
    const fields = Object.keys(draft).filter((f) => !["name", "tags"].includes(f));
    await db.personaFieldProvenance.createMany({
      data: fields.map((fieldName) => ({
        personaId: persona.id,
        fieldName,
        sourceLabel: body.sourceLabel,
      })),
    });
  }

  return NextResponse.json(persona);
}
