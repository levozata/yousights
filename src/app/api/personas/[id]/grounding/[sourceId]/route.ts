import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";
import { deleteGroundingSource } from "@/lib/ai/ingest";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; sourceId: string }> },
) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;
  const { id, sourceId } = await params;

  const persona = await db.persona.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!persona) return jsonError("Not found", 404);

  const source = await db.groundingSource.findFirst({ where: { id: sourceId, personaId: id } });
  if (!source) return jsonError("Not found", 404);

  await deleteGroundingSource(sourceId);
  return NextResponse.json({ ok: true });
}
