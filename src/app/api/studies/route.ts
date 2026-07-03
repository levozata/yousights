import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";
import type { PromptPattern, ConfidenceMode, StudyType } from "@/generated/prisma/client";

export async function GET() {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;

  const studies = await db.study.findMany({
    where: { workspaceId: ctx.workspace.id },
    include: { stimulus: true, runs: { select: { id: true, mode: true, status: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(studies);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;

  const body = await req.json().catch(() => null);
  const researchQuestion = body?.researchQuestion?.trim();
  const type = body?.type as StudyType;
  if (!researchQuestion) return jsonError("A single-sentence research question is required");
  if (!type) return jsonError("Study type is required");

  const study = await db.study.create({
    data: {
      workspaceId: ctx.workspace.id,
      type,
      researchQuestion,
      promptPattern: (body.promptPattern as PromptPattern) ?? "STANDARD",
      confidenceMode: (body.confidenceMode as ConfidenceMode) ?? "STATED_PREFERENCE",
      stimulusId: body.stimulusId ?? null,
    },
    include: { stimulus: true },
  });
  return NextResponse.json(study);
}
