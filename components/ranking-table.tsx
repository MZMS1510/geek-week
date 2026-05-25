import type { RankingRow } from "@/lib/scores";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function RankingTable({ rows }: { rows: RankingRow[] }) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Ninguém pontuou ainda.</p>;
  }
  return (
    <ol className="divide-y divide-border">
      {rows.map((r) => (
        <li key={r.user.id} className="flex items-center gap-3 py-3">
          <div
            className={cn(
              "w-8 shrink-0 text-center text-lg font-bold tabular-nums",
              r.rank === 1 && "text-amber-400",
              r.rank === 2 && "text-slate-300",
              r.rank === 3 && "text-amber-700"
            )}
          >
            {r.rank}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{r.user.name ?? r.user.email}</div>
            <div className="truncate text-xs text-muted-foreground">{r.user.email}</div>
          </div>
          <Badge variant="success" className="shrink-0">{r.points} pts</Badge>
        </li>
      ))}
    </ol>
  );
}
