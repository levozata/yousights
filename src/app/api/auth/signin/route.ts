import { NextRequest, NextResponse } from "next/server";
import { signInOrRegister } from "@/lib/auth";
import { jsonError } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.trim();
  const name = body?.name?.trim() ?? "";

  if (!email || !email.includes("@")) {
    return jsonError("A valid email is required");
  }

  const user = await signInOrRegister(email, name);
  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}
