import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth";

export default async function Home() {
  const ctx = await getCurrentWorkspace();
  redirect(ctx ? "/personas" : "/sign-in");
}
