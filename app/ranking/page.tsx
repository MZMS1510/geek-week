import { requireSession } from "@/lib/authz";
import { getRanking } from "@/lib/scores";
import { getRankingPublic } from "@/lib/settings";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RankingTable } from "@/components/ranking-table";

export const dynamic = "force-dynamic";

export default async function PublicRankingPage() {
  const session = await requireSession();
  const isAdmin = session.user.role === "ADMIN";
  const isPublic = await getRankingPublic();

  return (
    <div>
      <Topbar />
      <main className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Ranking</CardTitle>
            <CardDescription>
              {isPublic
                ? "Pontuação acumulada na Semana Geek 2026."
                : "O ranking ainda não foi liberado."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPublic || isAdmin ? (
              <RankingTable rows={await getRanking(200)} />
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">
                O ranking será revelado pela organização quando o evento terminar. Continue acumulando pontos!
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
