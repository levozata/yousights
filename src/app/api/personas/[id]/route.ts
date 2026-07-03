import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;
  const { id } = await params;

  const persona = await db.persona.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: {
      segment: true,
      groundingSources: { orderBy: { createdAt: "desc" } },
      provenance: true,
    },
  });
  if (!persona) return jsonError("Not found", 404);
  return NextResponse.json(persona);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;
  const { id } = await params;

  const existing = await db.persona.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return jsonError("Not found", 404);

  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const allowedFields = [
    "name",
    "tagline",
    "tags",
    "role",
    "demographics",
    "context",
    "beliefs",
    "priorAttempts",
    "skepticismSources",
    "decisionProcess",
    "consults",
    "dealbreakers",
    "bigFive",
    "values",
    "motivations",
    "decisionBehaviour",
    "segmentId",
    "archived",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) data[field] = body[field];
  }

  const persona = await db.persona.update({ where: { id }, data });
  return NextResponse.json(persona);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;
  const { id } = await params;

  const existing = await db.persona.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return jsonError("Not found", 404);

  await db.persona.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
