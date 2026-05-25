import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export async function Topbar() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between gap-3">
        <Link href={role ? defaultHome(role) : "/"} className="flex items-center gap-2">
          <Image src="/logo.png" alt="Semana Geek" width={28} height={28} />
          <span className="font-semibold tracking-tight">Semana Geek</span>
        </Link>
        <div className="flex items-center gap-2">
          {role && role !== "PARTICIPANT" && (
            <Badge variant="secondary">{role.toLowerCase()}</Badge>
          )}
          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/signin" });
              }}
            >
              <Button variant="ghost" size="sm" type="submit">
                Sair
              </Button>
            </form>
          ) : (
            <Button asChild size="sm" variant="ghost">
              <Link href="/signin">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function defaultHome(role: string) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "STAFF":
      return "/staff";
    default:
      return "/me";
  }
}
