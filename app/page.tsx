import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    if (session.user.role === "ADMIN") redirect("/admin");
    if (session.user.role === "STAFF") redirect("/staff");
    redirect("/me");
  }

  return (
    <main className="container flex min-h-dvh flex-col items-center justify-center gap-8 py-12 text-center">
      <Image src="/logo.png" alt="Semana Geek" width={120} height={120} priority />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Semana Geek 2026</h1>
        <p className="text-muted-foreground">
          GameLab Inteli — 25 a 29 de maio
        </p>
      </div>
      <ul className="grid w-full max-w-md gap-3 text-left text-sm">
        <li className="rounded-lg border border-border bg-card p-3">
          <span className="font-semibold">Seg 25/05</span> — GameTourney (arcade)
        </li>
        <li className="rounded-lg border border-border bg-card p-3">
          <span className="font-semibold">Ter 26/05</span> — GameClubs (atividades das ligas)
        </li>
        <li className="rounded-lg border border-border bg-card p-3">
          <span className="font-semibold">Qua 27/05</span> — GameDubs (talk + quiz)
        </li>
        <li className="rounded-lg border border-border bg-card p-3">
          <span className="font-semibold">Sex 29/05</span> — Cosplay Tourney + Final Game
        </li>
      </ul>
      <Button asChild size="lg" className="w-full max-w-md">
        <Link href="/signin">Entrar com Inteli</Link>
      </Button>
    </main>
  );
}
