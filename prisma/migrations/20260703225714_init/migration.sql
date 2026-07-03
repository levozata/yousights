-- CreateEnum
CREATE TYPE "PersonaOrigin" AS ENUM ('BRIEF', 'GROUNDED', 'WEB_ENRICHED', 'PACK');

-- CreateEnum
CREATE TYPE "GroundingSourceType" AS ENUM ('TRANSCRIPT', 'CRM_NOTE', 'REVIEW', 'SUPPORT_TICKET', 'SURVEY_VERBATIM', 'SALES_CALL', 'WEB_RESEARCH', 'OTHER');

-- CreateEnum
CREATE TYPE "StimulusType" AS ENUM ('TEXT', 'URL', 'IMAGE', 'PDF', 'FIGMA', 'PROTOTYPE');

-- CreateEnum
CREATE TYPE "StudyType" AS ENUM ('UX_WALKTHROUGH', 'CONCEPT_TEST', 'PRODUCT_VALIDATION', 'MESSAGE_TEST', 'SEGMENTATION');

-- CreateEnum
CREATE TYPE "PromptPattern" AS ENUM ('EXPLAIN_AND_EVALUATE', 'COMPARE_AND_JUSTIFY', 'OBJECTION_SURFACE', 'STANDARD');

-- CreateEnum
CREATE TYPE "ConfidenceMode" AS ENUM ('STATED_PREFERENCE', 'PREDICTED_BEHAVIOUR');

-- CreateEnum
CREATE TYPE "RunMode" AS ENUM ('SOLO', 'PANEL');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('PENDING', 'STREAMING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('SYSTEM', 'RESEARCHER', 'PERSONA');

-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('SHIP', 'KILL', 'REFINE');

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'eu',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Persona" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "origin" "PersonaOrigin" NOT NULL DEFAULT 'BRIEF',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT,
    "demographics" JSONB,
    "context" TEXT,
    "beliefs" TEXT,
    "priorAttempts" TEXT,
    "skepticismSources" TEXT,
    "decisionProcess" TEXT,
    "consults" TEXT,
    "dealbreakers" TEXT,
    "bigFive" JSONB,
    "values" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "motivations" TEXT,
    "decisionBehaviour" TEXT,
    "groundingStrength" INTEGER NOT NULL DEFAULT 0,
    "segmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroundingSource" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "type" "GroundingSourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "fileName" TEXT,
    "citationUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroundingSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroundingChunk" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroundingChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaFieldProvenance" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "sourceId" TEXT,
    "sourceLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonaFieldProvenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "quotas" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stimulus" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "StimulusType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "url" TEXT,
    "fileName" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stimulus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Study" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "StudyType" NOT NULL,
    "researchQuestion" TEXT NOT NULL,
    "promptPattern" "PromptPattern" NOT NULL DEFAULT 'STANDARD',
    "confidenceMode" "ConfidenceMode" NOT NULL DEFAULT 'STATED_PREFERENCE',
    "stimulusId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Study_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "mode" "RunMode" NOT NULL,
    "panelPreset" TEXT,
    "status" "RunStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyParticipant" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,

    CONSTRAINT "StudyParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "studyParticipantId" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "isFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "distribution" JSONB NOT NULL,
    "themes" JSONB NOT NULL,
    "divergences" JSONB NOT NULL,
    "unexpectedAngles" JSONB NOT NULL,
    "recommendation" "Recommendation" NOT NULL,
    "recommendationNote" TEXT NOT NULL,
    "confidenceNote" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Journey" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stages" JSONB NOT NULL,
    "scaffoldSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneySession" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyStageResponse" (
    "id" TEXT NOT NULL,
    "journeySessionId" TEXT NOT NULL,
    "stageKey" TEXT NOT NULL,
    "action" TEXT,
    "thought" TEXT,
    "emotionValence" INTEGER,
    "emotionIntensity" INTEGER,
    "painPoint" TEXT,
    "opportunity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyStageResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadedPack" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "loadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoadedPack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Persona_workspaceId_idx" ON "Persona"("workspaceId");

-- CreateIndex
CREATE INDEX "Persona_segmentId_idx" ON "Persona"("segmentId");

-- CreateIndex
CREATE INDEX "GroundingSource_personaId_idx" ON "GroundingSource"("personaId");

-- CreateIndex
CREATE INDEX "GroundingChunk_personaId_idx" ON "GroundingChunk"("personaId");

-- CreateIndex
CREATE INDEX "GroundingChunk_sourceId_idx" ON "GroundingChunk"("sourceId");

-- CreateIndex
CREATE INDEX "PersonaFieldProvenance_personaId_idx" ON "PersonaFieldProvenance"("personaId");

-- CreateIndex
CREATE INDEX "Segment_workspaceId_idx" ON "Segment"("workspaceId");

-- CreateIndex
CREATE INDEX "Stimulus_workspaceId_idx" ON "Stimulus"("workspaceId");

-- CreateIndex
CREATE INDEX "Study_workspaceId_idx" ON "Study"("workspaceId");

-- CreateIndex
CREATE INDEX "Run_studyId_idx" ON "Run"("studyId");

-- CreateIndex
CREATE INDEX "StudyParticipant_runId_idx" ON "StudyParticipant"("runId");

-- CreateIndex
CREATE INDEX "StudyParticipant_personaId_idx" ON "StudyParticipant"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_studyParticipantId_key" ON "Session"("studyParticipantId");

-- CreateIndex
CREATE INDEX "Message_sessionId_idx" ON "Message"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Insight_runId_key" ON "Insight"("runId");

-- CreateIndex
CREATE INDEX "Journey_workspaceId_idx" ON "Journey"("workspaceId");

-- CreateIndex
CREATE INDEX "JourneySession_journeyId_idx" ON "JourneySession"("journeyId");

-- CreateIndex
CREATE INDEX "JourneySession_personaId_idx" ON "JourneySession"("personaId");

-- CreateIndex
CREATE INDEX "JourneyStageResponse_journeySessionId_idx" ON "JourneyStageResponse"("journeySessionId");

-- CreateIndex
CREATE UNIQUE INDEX "LoadedPack_workspaceId_slug_key" ON "LoadedPack"("workspaceId", "slug");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroundingSource" ADD CONSTRAINT "GroundingSource_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroundingChunk" ADD CONSTRAINT "GroundingChunk_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "GroundingSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonaFieldProvenance" ADD CONSTRAINT "PersonaFieldProvenance_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stimulus" ADD CONSTRAINT "Stimulus_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Study" ADD CONSTRAINT "Study_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Study" ADD CONSTRAINT "Study_stimulusId_fkey" FOREIGN KEY ("stimulusId") REFERENCES "Stimulus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyParticipant" ADD CONSTRAINT "StudyParticipant_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyParticipant" ADD CONSTRAINT "StudyParticipant_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_studyParticipantId_fkey" FOREIGN KEY ("studyParticipantId") REFERENCES "StudyParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneySession" ADD CONSTRAINT "JourneySession_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneySession" ADD CONSTRAINT "JourneySession_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyStageResponse" ADD CONSTRAINT "JourneyStageResponse_journeySessionId_fkey" FOREIGN KEY ("journeySessionId") REFERENCES "JourneySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoadedPack" ADD CONSTRAINT "LoadedPack_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
