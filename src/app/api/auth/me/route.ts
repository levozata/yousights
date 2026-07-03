import { NextResponse } from "next/server";
import { getCurrentWorkspace } from "@/lib/auth";

export async function GET() {
  const ctx = await getCurrentWorkspace();
  if (!ctx) return NextResponse.json({ user: null, workspace: null });
  return NextResponse.json({
    user: { id: ctx.user.id, email: ctx.user.email, name: ctx.user.name },
    workspace: { id: ctx.workspace.id, name: ctx.workspace.name },
  });
}
