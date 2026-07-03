import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";

export async function GET() {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;

  const segments = await db.segment.findMany({
    where: { workspaceId: ctx.workspace.id },
    include: { _count: { select: { personas: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(segments);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  const definition = body?.definition?.trim();
  if (!name || !definition) return jsonError("name and definition are required");

  const segment = await db.segment.create({
    data: {
      workspaceId: ctx.workspace.id,
      name,
      definition,
      quotas: body.quotas ?? null,
      tags: body.tags ?? [],
    },
  });
  return NextResponse.json(segment);
}
