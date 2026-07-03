"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/personas", label: "Personas" },
  { href: "/studies", label: "Studies" },
  { href: "/journeys", label: "Journeys" },
  { href: "/packs", label: "Sector packs" },
];

export function Nav({ workspaceName }: { workspaceName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/personas" className="font-semibold tracking-tight">
            Yousights
          </Link>
          <nav className="flex gap-1">
            {LINKS.map((l) => {
              const active = pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span>{workspaceName}</span>
          <button onClick={signOut} className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
