import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";

const COOKIE_NAME = "yousights_session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me");

type SessionPayload = { userId: string; workspaceId: string };

export async function createSession(userId: string, workspaceId: string) {
  const token = await new SignJWT({ userId, workspaceId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Returns the current workspace + user, or null if signed out. Every
 *  server component / API route that touches workspace data goes through
 *  this so multi-tenancy stays enforced in one place. */
export async function getCurrentWorkspace() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.userId }, include: { workspace: true } });
  if (!user) return null;
  return { user, workspace: user.workspace };
}

/** Signs in by email, creating the user + a fresh workspace on first sight. */
export async function signInOrRegister(email: string, name: string) {
  const normalizedEmail = email.trim().toLowerCase();
  let user = await db.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    const workspace = await db.workspace.create({
      data: { name: name ? `${name}'s Workspace` : "My Workspace" },
    });
    user = await db.user.create({
      data: { email: normalizedEmail, name, workspaceId: workspace.id, role: "admin" },
    });
  }

  await createSession(user.id, user.workspaceId);
  return user;
}
