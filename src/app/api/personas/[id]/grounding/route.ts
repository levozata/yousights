import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";
import { ingestGroundingSource } from "@/lib/ai/ingest";
import type { GroundingSourceType } from "@/generated/prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;
  const { id } = await params;

  const persona = await db.persona.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!persona) return jsonError("Not found", 404);

  const body = await req.json().catch(() => null);
  const rawText = body?.rawText?.trim();
  const title = body?.title?.trim();
  const type = (body?.type as GroundingSourceType) ?? "OTHER";
  if (!rawText || !title) return jsonError("title and rawText are required");

  const source = await ingestGroundingSource({
    personaId: id,
    type,
    title,
    rawText,
    fileName: body?.fileName,
    citationUrl: body?.citationUrl,
  });

  const updated = await db.persona.findUnique({ where: { id } });
  return NextResponse.json({ source, groundingStrength: updated?.groundingStrength ?? 0 });
}
