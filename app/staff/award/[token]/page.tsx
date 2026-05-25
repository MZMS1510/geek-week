import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AwardForm } from "@/components/award-form";
import { getUserScore } from "@/lib/scores";
import { awardPointsAction } from "./actions";

const TOKEN_RE = /^[A-Z2-9]{10}$/;

export const dynamic = "force-dynamic";

export default async function AwardPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { error?: string };
}) {
  const token = params.token.toUpperCase();
  if (!TOKEN_RE.test(token)) notFound();

  const [participant, activations] = await Promise.all([
    prisma.user.findUnique({
      where: { qrToken: token },
      select: { id: true, name: true, email: true, role: true },
    }),
    prisma.activation.findMany({
      where: { isActive: true },
      orderBy: [{ day: "asc" }, { defaultPoints: "desc" }],
      select: { id: true, name: true, day: true, defaultPoints: true },
    }),
  ]);

  if (!participant) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>QR não encontrado</CardTitle>
          <CardDescription>
            Token <code>{token}</code> não corresponde a nenhum participante.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/staff/scan">Escanear novamente</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const score = await getUserScore(participant.id);
  const errorMessage =
    searchParams.error === "invalid"
      ? "Dados inválidos."
      : searchParams.error === "zero"
        ? "Pontos não podem ser zero."
        : searchParams.error === "notfound"
          ? "Participante não encontrado."
          : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{participant.name ?? participant.email}</CardTitle>
              <CardDescription>{participant.email}</CardDescription>
            </div>
            <Badge variant="secondary">{score} pts</Badge>
          </div>
        </CardHeader>
      </Card>

      {errorMessage && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Atribuir pontos</CardTitle>
          <CardDescription>
            Escolha uma ativação ou deixe em branco e digite pontos avulsos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AwardForm
            token={token}
            activations={activations}
            action={awardPointsAction}
          />
        </CardContent>
      </Card>
    </div>
  );
}
