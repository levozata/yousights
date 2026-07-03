import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;
  const { id } = await params;

  const run = await db.run.findFirst({
    where: { id, study: { workspaceId: ctx.workspace.id } },
    include: {
      study: { include: { stimulus: true } },
      participants: {
        include: {
          persona: { select: { id: true, name: true, tagline: true, groundingStrength: true } },
          session: { include: { messages: { orderBy: { createdAt: "asc" } } } },
        },
      },
      insight: true,
    },
  });
  if (!run) return jsonError("Not found", 404);
  return NextResponse.json(run);
}
