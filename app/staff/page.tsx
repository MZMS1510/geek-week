import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StaffHome() {
  const session = await requireSession();

  const since = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const myAwards = await prisma.pointAward.findMany({
    where: { awarderId: session.user.id, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    include: {
      participant: { select: { name: true, email: true } },
      activation: { select: { name: true } },
    },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dar pontos</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="w-full">
            <Link href="/staff/scan">Escanear QR do participante</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimas atribuições suas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myAwards.length === 0 && (
            <p className="text-sm text-muted-foreground">Nada nas últimas 12 horas.</p>
          )}
          {myAwards.map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {a.participant.name ?? a.participant.email}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {a.activation?.name ?? a.note ?? "Pontos avulsos"} · {formatRelative(a.createdAt)}
                </div>
              </div>
              <Badge variant="success" className="shrink-0">
                +{a.points}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
