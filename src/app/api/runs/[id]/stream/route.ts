import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/auth";
import { executeRun } from "@/lib/ai/panel";

export const dynamic = "force-dynamic";

function sseEvent(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * Server-sent events endpoint that drives a run to completion, emitting a
 * `persona_done` event as each persona agent finishes (progressive reveal,
 * §11) rather than blocking on the whole panel. GET-only so a plain
 * EventSource can consume it with cookie auth.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCurrentWorkspace();
  const { id: runId } = await params;

  if (!ctx) {
    return new Response(sseEvent("error", { message: "Not signed in" }), {
      status: 401,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const run = await db.run.findFirst({ where: { id: runId, study: { workspaceId: ctx.workspace.id } } });
  if (!run) {
    return new Response(sseEvent("error", { message: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: unknown) => controller.enqueue(encoder.encode(sseEvent(event, data)));

      if (run.status !== "PENDING") {
        send("already_processed", { status: run.status });
        controller.close();
        return;
      }

      try {
        await executeRun(runId, (sessionId) => send("persona_done", { sessionId }));
        const insight = await db.insight.findUnique({ where: { runId } });
        send("complete", { insight });
      } catch (err) {
        send("error", { message: err instanceof Error ? err.message : "Run failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
