import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/auth";

type Quote = { personaName: string; excerpt: string };
type Theme = { title: string; summary: string; quotes: Quote[] };
type Divergence = Theme & { sideA: string; sideB: string };
type Distribution = { label: string; sentiment: string; personaNames: string[] };

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await params;

  const run = await db.run.findFirst({
    where: { id, study: { workspaceId: ctx.workspace.id } },
    include: {
      study: { include: { stimulus: true } },
      participants: { include: { persona: true, session: { include: { messages: true } } } },
      insight: true,
    },
  });
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const lines: string[] = [];
  lines.push(`# ${run.study.researchQuestion}`);
  lines.push("");
  lines.push(`*${run.study.type.replace(/_/g, " ")} · ${run.mode} · ${run.participants.length} persona(s)*`);
  lines.push("");
  lines.push(
    "> Directional signal from simulated personas, meant to sharpen where to focus real research — " +
      "not a replacement for it.",
  );
  lines.push("");

  if (run.insight) {
    const insight = run.insight;
    lines.push(`## Recommendation: ${insight.recommendation}`);
    lines.push("");
    lines.push(insight.recommendationNote);
    lines.push("");
    lines.push(`**Confidence:** ${insight.confidenceNote}`);
    lines.push("");

    lines.push("## Distribution");
    for (const d of insight.distribution as unknown as Distribution[]) {
      lines.push(`- **${d.label}** (${d.sentiment}): ${d.personaNames.join(", ")}`);
    }
    lines.push("");

    lines.push("## Themes");
    for (const t of insight.themes as unknown as Theme[]) {
      lines.push(`### ${t.title}`);
      lines.push(t.summary);
      for (const q of t.quotes) lines.push(`> "${q.excerpt}" — ${q.personaName}`);
      lines.push("");
    }

    const divergences = insight.divergences as unknown as Divergence[];
    if (divergences.length) {
      lines.push("## Divergences");
      for (const d of divergences) {
        lines.push(`### ${d.title}`);
        lines.push(d.summary);
        lines.push(`- ${d.sideA}`);
        lines.push(`- ${d.sideB}`);
        for (const q of d.quotes) lines.push(`> "${q.excerpt}" — ${q.personaName}`);
        lines.push("");
      }
    }

    const unexpected = insight.unexpectedAngles as unknown as Theme[];
    if (unexpected.length) {
      lines.push("## Unexpected angles");
      for (const u of unexpected) {
        lines.push(`### ${u.title}`);
        lines.push(u.summary);
        for (const q of u.quotes) lines.push(`> "${q.excerpt}" — ${q.personaName}`);
        lines.push("");
      }
    }
  }

  lines.push("## Transcripts");
  for (const p of run.participants) {
    lines.push(`### ${p.persona.name}${p.persona.tagline ? ` — ${p.persona.tagline}` : ""}`);
    for (const m of p.session?.messages ?? []) {
      lines.push(`**${m.role}:** ${m.content}`);
      lines.push("");
    }
  }

  const markdown = lines.join("\n");
  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="run-${id}.md"`,
    },
  });
}
