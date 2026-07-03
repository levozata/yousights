import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";
import type { StimulusType } from "@/generated/prisma/client";

export async function GET() {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;

  const stimuli = await db.stimulus.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(stimuli);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;

  const body = await req.json().catch(() => null);
  const title = body?.title?.trim();
  const type = (body?.type as StimulusType) ?? "TEXT";
  if (!title) return jsonError("title is required");
  if (!body.content && !body.url) return jsonError("content or url is required");

  const stimulus = await db.stimulus.create({
    data: {
      workspaceId: ctx.workspace.id,
      type,
      title,
      content: body.content ?? null,
      url: body.url ?? null,
      fileName: body.fileName ?? null,
      metadata: body.metadata ?? null,
    },
  });
  return NextResponse.json(stimulus);
}
