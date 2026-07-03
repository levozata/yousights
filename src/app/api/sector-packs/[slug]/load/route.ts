import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";
import { loadSectorPack } from "@/lib/sector-packs/loader";
import { getSectorPack } from "@/lib/sector-packs/data";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;
  const { slug } = await params;

  if (!getSectorPack(slug)) return jsonError("Unknown sector pack", 404);

  const result = await loadSectorPack(ctx.workspace.id, slug);
  return NextResponse.json(result);
}
