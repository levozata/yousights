import { NextResponse } from "next/server";
import { getCurrentWorkspace } from "@/lib/auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Resolves the caller's workspace or throws a 401 NextResponse (via a thrown
 *  value the route handler should catch — kept as a plain helper rather than
 *  middleware so each route stays a single readable function). */
export async function requireWorkspace() {
  const ctx = await getCurrentWorkspace();
  if (!ctx) {
    throw NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return ctx;
}

export function isNextResponse(x: unknown): x is NextResponse {
  return x instanceof NextResponse;
}
