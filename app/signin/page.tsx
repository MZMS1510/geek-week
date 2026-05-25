import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN ?? "sou.inteli.edu.br";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { from?: string; error?: string };
}) {
  const session = await auth();
  if (session?.user) redirect(searchParams.from ?? "/");

  const errorMessage =
    searchParams.error === "domain"
      ? `Only @${ALLOWED_DOMAIN} accounts can sign in.`
      : searchParams.error
        ? "Sign-in failed. Try again."
        : null;

  return (
    <main className="container flex min-h-dvh flex-col items-center justify-center gap-6 py-12 text-center">
      <Image src="/logo.png" alt="Semana Geek" width={96} height={96} priority />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Semana Geek 2026</h1>
        <p className="text-sm text-muted-foreground">
          Acesso apenas para contas <code>@{ALLOWED_DOMAIN}</code>.
        </p>
      </div>
      {errorMessage && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      )}
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: searchParams.from ?? "/" });
        }}
        className="w-full max-w-sm"
      >
        <Button type="submit" size="lg" className="w-full">
          Continuar com Google
        </Button>
      </form>
    </main>
  );
}
