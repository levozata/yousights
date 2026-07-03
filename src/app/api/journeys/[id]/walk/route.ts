import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireWorkspace, isNextResponse, jsonError } from "@/lib/api-helpers";
import { runJourneyStage } from "@/lib/ai/journey";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspace().catch((r) => r);
  if (isNextResponse(ctx)) return ctx;
  const { id: journeyId } = await params;

  const journey = await db.journey.findFirst({ where: { id: journeyId, workspaceId: ctx.workspace.id } });
  if (!journey) return jsonError("Not found", 404);

  const body = await req.json().catch(() => null);
  const personaId = body?.personaId;
  const stageKey = body?.stageKey;
  const stagePrompt = body?.stagePrompt?.trim();
  if (!personaId || !stageKey || !stagePrompt) {
    return jsonError("personaId, stageKey, and stagePrompt are required");
  }

  const persona = await db.persona.findFirst({ where: { id: personaId, workspaceId: ctx.workspace.id } });
  if (!persona) return jsonError("Persona not found", 404);

  let journeySession = await db.journeySession.findFirst({
    where: { journeyId, personaId },
    include: { stageResponses: { orderBy: { createdAt: "asc" } } },
  });
  if (!journeySession) {
    journeySession = await db.journeySession.create({
      data: { journeyId, personaId },
      include: { stageResponses: { orderBy: { createdAt: "asc" } } },
    });
  }

  const stages = journey.stages as { key: string; label: string }[];
  const stageLabel = stages.find((s) => s.key === stageKey)?.label ?? stageKey;

  const priorStagesSummary = journeySession.stageResponses
    .map((r) => `- ${r.stageKey}: ${r.action} (felt ${r.emotionValence! >= 0 ? "positive" : "negative"})`)
    .join("\n");

  const result = await runJourneyStage(persona, stageLabel, stagePrompt, priorStagesSummary);

  const existingResponse = journeySession.stageResponses.find((r) => r.stageKey === stageKey);
  const stageResponse = existingResponse
    ? await db.journeyStageResponse.update({
        where: { id: existingResponse.id },
        data: {
          action: result.action,
          thought: result.thought,
          emotionValence: result.emotionValence,
          emotionIntensity: result.emotionIntensity,
          painPoint: result.painPoint,
          opportunity: result.opportunity,
        },
      })
    : await db.journeyStageResponse.create({
        data: {
          journeySessionId: journeySession.id,
          stageKey,
          action: result.action,
          thought: result.thought,
          emotionValence: result.emotionValence,
          emotionIntensity: result.emotionIntensity,
          painPoint: result.painPoint,
          opportunity: result.opportunity,
        },
      });

  return NextResponse.json({ narrative: result.narrative, stageResponse, journeySessionId: journeySession.id });
}
