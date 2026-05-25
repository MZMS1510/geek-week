import { prisma } from "./prisma";

export async function getUserScore(userId: string): Promise<number> {
  const agg = await prisma.pointAward.aggregate({
    where: { participantId: userId },
    _sum: { points: true },
  });
  return agg._sum.points ?? 0;
}

export type RankingRow = {
  rank: number;
  user: { id: string; name: string | null; email: string; image: string | null };
  points: number;
};

export async function getRanking(limit = 100): Promise<RankingRow[]> {
  const participants = await prisma.user.findMany({
    where: { role: "PARTICIPANT" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      receivedAwards: { select: { points: true } },
    },
  });

  return participants
    .map((p) => ({
      user: { id: p.id, name: p.name, email: p.email, image: p.image },
      points: p.receivedAwards.reduce((s, a) => s + a.points, 0),
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map((row, i) => ({ rank: i + 1, ...row }));
}
