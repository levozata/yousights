import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";
import type { RunMode } from "@/generated/prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;
  const { id: studyId } = await params;

  const study = await db.study.findFirst({ where: { id: studyId, workspaceId: ctx.workspace.id } });
  if (!study) return jsonError("Not found", 404);

  const body = await req.json().catch(() => null);
  const personaIds: string[] = body?.personaIds ?? [];
  const mode = (body?.mode as RunMode) ?? (personaIds.length > 1 ? "PANEL" : "SOLO");

  if (personaIds.length === 0) return jsonError("At least one persona is required");
  if (mode === "SOLO" && personaIds.length > 1) return jsonError("SOLO runs take exactly one persona");

  const personas = await db.persona.findMany({
    where: { id: { in: personaIds }, workspaceId: ctx.workspace.id },
    select: { id: true },
  });
  if (personas.length !== personaIds.length) return jsonError("One or more personas not found");

  const run = await db.run.create({
    data: {
      studyId,
      mode,
      panelPreset: body?.panelPreset ?? null,
      status: "PENDING",
      participants: { create: personaIds.map((personaId) => ({ personaId })) },
    },
    include: { participants: { include: { persona: true } } },
  });

  return NextResponse.json(run);
}
