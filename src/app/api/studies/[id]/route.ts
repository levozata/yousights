import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;
  const { id } = await params;

  const study = await db.study.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: {
      stimulus: true,
      runs: {
        orderBy: { createdAt: "desc" },
        include: {
          participants: { include: { persona: { select: { id: true, name: true, tagline: true } } } },
          insight: true,
        },
      },
    },
  });
  if (!study) return jsonError("Not found", 404);
  return NextResponse.json(study);
}
