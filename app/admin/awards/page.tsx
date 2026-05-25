import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/utils";
import { deleteAwardAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AwardsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();

  const awards = await prisma.pointAward.findMany({
    where: q
      ? {
          OR: [
            { participant: { email: { contains: q, mode: "insensitive" } } },
            { participant: { name: { contains: q, mode: "insensitive" } } },
            { awarder: { email: { contains: q, mode: "insensitive" } } },
            { note: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      participant: { select: { name: true, email: true } },
      awarder: { select: { name: true, email: true } },
      activation: { select: { name: true } },
    },
    take: 300,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auditoria de pontos</CardTitle>
        <CardDescription>Últimas 300 atribuições.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex gap-2">
          <Input name="q" defaultValue={q} placeholder="filtrar por participante / staff / nota" />
          <Button type="submit" variant="secondary">Filtrar</Button>
        </form>
        <div className="divide-y divide-border">
          {awards.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {a.participant.name ?? a.participant.email}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {a.activation?.name ?? "Pontos avulsos"} · por {a.awarder.name ?? a.awarder.email} · {formatRelative(a.createdAt)}
                </div>
                {a.note && <div className="mt-1 text-xs italic text-muted-foreground">"{a.note}"</div>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={a.points >= 0 ? "success" : "warn"}>
                  {a.points >= 0 ? "+" : ""}{a.points}
                </Badge>
                <form action={deleteAwardAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <Button
                    type="submit"
                    size="sm"
                    variant="destructive"
                    title="Remover esta atribuição"
                  >
                    Remover
                  </Button>
                </form>
              </div>
            </div>
          ))}
          {awards.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum resultado.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
