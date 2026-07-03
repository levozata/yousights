import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";
import { extractPersonaDraftFromSource } from "@/lib/ai/persona-draft";

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;

  const body = await req.json().catch(() => null);
  const sourceText = body?.sourceText?.trim();
  const sourceTitle = body?.sourceTitle?.trim() || "Untitled source";
  if (!sourceText) return jsonError("sourceText is required");

  const draft = await extractPersonaDraftFromSource(sourceText, sourceTitle);
  return NextResponse.json(draft);
}
