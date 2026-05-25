import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getRankingPublic } from "@/lib/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toggleRankingPublicAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [users, participants, staff, awards, points, rankingPublic] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "PARTICIPANT" } }),
    prisma.user.count({ where: { role: { in: ["STAFF", "ADMIN"] } } }),
    prisma.pointAward.count(),
    prisma.pointAward.aggregate({ _sum: { points: true } }),
    getRankingPublic(),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Usuários" value={users} />
        <Stat label="Participantes" value={participants} />
        <Stat label="Staff/Admin" value={staff} />
        <Stat label="Pontos distribuídos" value={points._sum.points ?? 0} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Revelar ranking</CardTitle>
              <CardDescription>
                Quando ligado, participantes e staff podem ver o ranking público em <code>/ranking</code>.
              </CardDescription>
            </div>
            <Badge variant={rankingPublic ? "success" : "warn"}>
              {rankingPublic ? "Público" : "Oculto"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form action={toggleRankingPublicAction}>
            <input type="hidden" name="value" value={(!rankingPublic).toString()} />
            <Button type="submit" variant={rankingPublic ? "outline" : "default"}>
              {rankingPublic ? "Ocultar ranking" : "Revelar ranking agora"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atalhos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link href="/admin/ranking">Ver ranking</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/users">Gerenciar usuários</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/activations">Editar ativações</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/awards">Auditoria</Link></Button>
          <Button asChild variant="outline"><Link href="/staff">Modo staff</Link></Button>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">{awards} atribuições registradas.</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
