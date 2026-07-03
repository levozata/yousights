import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";
import { expandBriefToPersonaDraft } from "@/lib/ai/persona-draft";

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;

  const body = await req.json().catch(() => null);
  const brief = body?.brief?.trim();
  if (!brief) return jsonError("brief is required");

  const draft = await expandBriefToPersonaDraft(brief);
  return NextResponse.json(draft);
}
