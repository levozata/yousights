import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;
  const { id } = await params;

  const journey = await db.journey.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: {
      sessions: {
        include: {
          persona: { select: { id: true, name: true, tagline: true, groundingStrength: true } },
          stageResponses: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });
  if (!journey) return jsonError("Not found", 404);
  return NextResponse.json(journey);
}
