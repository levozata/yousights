import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";
import { runFollowUp } from "@/lib/ai/panel";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;
  const { id: sessionId } = await params;

  const session = await db.session.findFirst({
    where: { id: sessionId, studyParticipant: { run: { study: { workspaceId: ctx.workspace.id } } } },
  });
  if (!session) return jsonError("Not found", 404);

  const body = await req.json().catch(() => null);
  const text = body?.text?.trim();
  if (!text) return jsonError("text is required");

  const reply = await runFollowUp(sessionId, text);
  return NextResponse.json({ reply });
}
