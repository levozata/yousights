import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { isLiveMode } from "@/lib/ai/config";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getCurrentWorkspace();
  if (!ctx) redirect("/sign-in");

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <Nav workspaceName={ctx.workspace.name} />
      {!isLiveMode() && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 px-4 py-1.5 text-center text-xs text-amber-800 dark:text-amber-300">
          Demo mode — no ANTHROPIC_API_KEY configured. Persona responses and synthesis are placeholders.
        </div>
      )}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
