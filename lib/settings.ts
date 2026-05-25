import { prisma } from "./prisma";

export async function getRankingPublic(): Promise<boolean> {
  const row = await prisma.appSetting.findUnique({ where: { key: "rankingPublic" } });
  return row?.value === "true";
}

export async function setRankingPublic(value: boolean): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: "rankingPublic" },
    update: { value: value ? "true" : "false" },
    create: { key: "rankingPublic", value: value ? "true" : "false" },
  });
}
