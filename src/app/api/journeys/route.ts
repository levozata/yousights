import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";

export async function GET() {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;

  const journeys = await db.journey.findMany({
    where: { workspaceId: ctx.workspace.id },
    include: { _count: { select: { sessions: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(journeys);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  const stages = body?.stages;
  if (!name) return jsonError("name is required");
  if (!Array.isArray(stages) || stages.length === 0) return jsonError("stages must be a non-empty array");

  const journey = await db.journey.create({
    data: {
      workspaceId: ctx.workspace.id,
      name,
      stages,
      scaffoldSource: body.scaffoldSource ?? "custom",
    },
  });
  return NextResponse.json(journey);
}
