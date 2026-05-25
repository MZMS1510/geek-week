import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { QrDisplay } from "@/components/qr-display";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const session = await requireSession();

  const [user, awards] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { name: true, email: true, qrToken: true },
    }),
    prisma.pointAward.findMany({
      where: { participantId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        activation: { select: { name: true, day: true } },
        awarder: { select: { name: true, email: true } },
      },
      take: 50,
    }),
  ]);

  const total = awards.reduce((s, a) => s + a.points, 0);

  return (
    <div>
      <Topbar />
      <main className="container space-y-6 py-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground">Sua pontuação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold tracking-tight md:text-6xl">{total}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              {user.name ?? user.email}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seu QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <QrDisplay token={user.qrToken} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {awards.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Ainda nenhum ponto. Participe das ativações e mostre seu QR para a staff!
              </p>
            )}
            {awards.map((a) => (
              <div
                key={a.id}
                className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {a.activation?.name ?? a.note ?? "Pontos avulsos"}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {formatRelative(a.createdAt)} · por {a.awarder.name ?? a.awarder.email}
                  </div>
                  {a.activation?.name && a.note && (
                    <div className="mt-1 text-xs italic text-muted-foreground">"{a.note}"</div>
                  )}
                </div>
                <Badge variant="success" className="shrink-0">
                  +{a.points}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
