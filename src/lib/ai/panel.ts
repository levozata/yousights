import { db } from "@/lib/db";
import { buildStudyOpeningPrompt } from "./study-prompts";
import { generatePersonaReply } from "./simulate";
import { runSynthesis } from "./synthesis";

/**
 * Fans a study's opening prompt out to every participant persona in
 * parallel (§8 panel orchestration), persisting each session's transcript
 * as responses complete, then — for multi-persona runs — invokes the
 * synthesis agent across the resulting transcripts (§7).
 *
 * Persona agents are isolated from each other (no cross-talk) per §8.
 */
export async function executeRun(runId: string, onPersonaDone?: (sessionId: string) => void): Promise<void> {
  const run = await db.run.update({
    where: { id: runId },
    data: { status: "STREAMING" },
    include: {
      study: { include: { stimulus: true } },
      participants: { include: { persona: true, session: true } },
    },
  });

  const opening = buildStudyOpeningPrompt(run.study);

  await Promise.all(
    run.participants.map(async (participant) => {
      const session =
        participant.session ??
        (await db.session.create({ data: { studyParticipantId: participant.id, status: "STREAMING" } }));

      await db.message.create({
        data: { sessionId: session.id, role: "RESEARCHER", content: opening },
      });

      try {
        const reply = await generatePersonaReply(participant.persona, [{ role: "user", content: opening }]);
        await db.message.create({
          data: { sessionId: session.id, role: "PERSONA", content: reply },
        });
        await db.session.update({ where: { id: session.id }, data: { status: "COMPLETE" } });
      } catch (err) {
        console.error(`Persona turn failed for session ${session.id}:`, err);
        await db.session.update({ where: { id: session.id }, data: { status: "FAILED" } });
      }

      onPersonaDone?.(session.id);
    }),
  );

  await db.run.update({ where: { id: runId }, data: { status: "COMPLETE", completedAt: new Date() } });

  if (run.mode === "PANEL" && run.participants.length > 1) {
    await runSynthesis(runId);
  }
}

/** Appends a researcher follow-up to one persona's session and re-invokes
 *  only that persona's agent (§6 real-time follow-up loop). */
export async function runFollowUp(sessionId: string, followUpText: string): Promise<string> {
  const session = await db.session.findUniqueOrThrow({
    where: { id: sessionId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      studyParticipant: { include: { persona: true } },
    },
  });

  await db.message.create({
    data: { sessionId, role: "RESEARCHER", content: followUpText, isFollowUp: true },
  });

  const conversation = [
    ...session.messages.map((m) => ({
      role: (m.role === "PERSONA" ? "assistant" : "user") as "assistant" | "user",
      content: m.content,
    })),
    { role: "user" as const, content: followUpText },
  ];

  const reply = await generatePersonaReply(session.studyParticipant.persona, conversation);

  await db.message.create({
    data: { sessionId, role: "PERSONA", content: reply, isFollowUp: true },
  });

  return reply;
}
