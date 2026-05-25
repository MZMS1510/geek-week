import { getRanking } from "@/lib/scores";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RankingTable } from "@/components/ranking-table";

export const dynamic = "force-dynamic";

export default async function AdminRankingPage() {
  const rows = await getRanking(200);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking completo</CardTitle>
        <CardDescription>
          Visível apenas para admins até que o ranking público seja revelado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RankingTable rows={rows} />
      </CardContent>
    </Card>
  );
}
