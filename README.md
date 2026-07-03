# Yousights

Synthetic user research platform: build grounded AI personas, then run concept
tests, UX walkthroughs, product validation, message tests, and journey maps
against them — directional signal in minutes, not a replacement for real
research.

This build implements the MVP + most of v1 from the product spec (persona
library with grounding + RAG, panels with cross-persona synthesis, journey
mapping, sector packs). See "What's implemented" below for the honest status
against the spec's phasing.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Postgres via Prisma (driver adapter: `@prisma/adapter-pg`)
- Anthropic API for persona simulation, panel synthesis, and extraction —
  model choice is swappable per role, see `src/lib/ai/config.ts`
- Voyage AI for grounding-source embeddings, with a dependency-free local
  lexical fallback so the app runs fully offline (`src/lib/ai/embeddings.ts`)

## Getting started

1. Have a Postgres database available and set `DATABASE_URL` (copy
   `.env.example` to `.env` and fill it in).
2. `npm install`
3. `npx prisma migrate dev` — creates the schema.
4. `npm run dev` — open http://localhost:3000.

Sign-in is a lightweight email-based session (no password) — the first sign-in
for an email creates a workspace. There's no external auth dependency.

### Running without an API key

Leave `ANTHROPIC_API_KEY` unset and the app runs in **demo mode**: every
persona response and synthesis result becomes a clearly-labelled placeholder
instead of a live model call, so the entire product loop (persona creation →
study → panel run → synthesis → journey walk) stays fully clickable with zero
external dependencies. A banner in the app header makes this state obvious.
Set `ANTHROPIC_API_KEY` (and optionally `VOYAGE_API_KEY` for real embeddings)
to get live simulations.

## What's implemented

**Persona Studio** — write-a-brief AI expansion, ground-from-data extraction
with per-field provenance, psychographic sliders (Big Five, values,
motivations, decision behaviour) that directly shape the simulation prompt,
grounding-source upload with chunking + embedding + RAG retrieval, and a
grounding-strength indicator shown everywhere a persona appears.

**Studies & panels** — study builder with a required one-sentence research
question, five study types (UX walkthrough, concept test, product validation,
message test, segmentation), four prompt patterns, stated-preference vs.
predicted-behaviour confidence framing, 1:1 depth and 5–50-persona panel runs
with progressive per-persona streaming (SSE), and real-time follow-up probing
per persona.

**Synthesis** — a synthesis agent (forced tool-use for structured output)
producing directional distribution, recurring themes, divergences, unexpected
angles, and a ship/kill/refine recommendation with an honest confidence note.
Every quote resolves back to its originating persona/session/message for
click-to-source traceability. Exports to Markdown.

**Journey mapping** — conversational stage-by-stage walks per persona
(action, thought, emotion valence/intensity, pain point, opportunity) and a
canvas view with an emotion-curve sparkline, comparable across personas.

**Sector packs** — four vertical starter libraries (e-commerce, banking,
fashion, CPG) as data + config (`src/lib/sector-packs/data.ts`): segments,
starter personas (ungrounded until calibrated — grounding strength stays
visible), study framings, and a journey scaffold. Loading a pack seeds a
workspace's library; adding a new vertical is a data change, not a code
change.

### Known simplifications vs. the full spec

- **Auth/teams** is intentionally minimal (email-only, one workspace per
  first sign-in) — no roles, invites, or SSO. The `Workspace`/`User` schema is
  shaped for multi-tenancy but the UI doesn't expose team management yet.
- **Stimulus ingestion** supports text and URL references; Figma/prototype/PDF
  ingestion (§5, §11) is schema-ready (`Stimulus.type`) but not wired to real
  file parsing.
- **Historical backtest / calibration against real research** (§9 v2) is not
  built — the grounding-strength heuristic and confidence framing are the
  trust mechanisms currently in place.
- **Embeddings** default to a local lexical (hashed bag-of-words) fallback
  when `VOYAGE_API_KEY` is unset — functional for retrieval, but weaker than a
  trained embedding model.
- **EU data residency** is a schema field (`Workspace.region`) rather than an
  enforced deployment topology.

## Project layout

- `prisma/schema.prisma` — full data model (§2): Workspace/User, Persona +
  GroundingSource/Chunk + provenance, Segment, Stimulus, Study/Run/
  StudyParticipant/Session/Message, Insight, Journey/JourneySession/
  JourneyStageResponse, LoadedPack.
- `src/lib/ai/` — the AI layer: client wrapper with demo-mode fallback
  (`client.ts`), persona system-prompt builder (`persona-prompt.ts`), RAG
  retrieval (`rag.ts`), panel orchestration (`panel.ts`), synthesis
  (`synthesis.ts`), journey stage probing (`journey.ts`), brief expansion /
  extraction (`persona-draft.ts`).
- `src/lib/sector-packs/` — pack data + loader.
- `src/app/api/` — route handlers (personas, studies, runs incl. SSE stream,
  sessions/follow-up, journeys, sector-packs, auth).
- `src/app/(app)/` — the authenticated UI: persona library/editor, study
  builder, run view, journey canvas, sector packs gallery.
