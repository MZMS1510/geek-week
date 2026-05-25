import { PrismaClient, EventDay } from "@prisma/client";

const prisma = new PrismaClient();

const ACTIVATIONS: Array<{
  name: string;
  day: EventDay;
  defaultPoints: number;
  description?: string;
}> = [
  { name: "GameTourney — Win", day: "MONDAY", defaultPoints: 50, description: "Won a match at an arcade booth" },
  { name: "GameTourney — Played", day: "MONDAY", defaultPoints: 20, description: "Played a match (win or lose)" },
  { name: "GameClubs — Activation", day: "TUESDAY", defaultPoints: 30, description: "Completed a league activation" },
  { name: "GameDubs — Quiz 1st", day: "WEDNESDAY", defaultPoints: 100 },
  { name: "GameDubs — Quiz 2nd", day: "WEDNESDAY", defaultPoints: 60 },
  { name: "GameDubs — Quiz 3rd", day: "WEDNESDAY", defaultPoints: 40 },
  { name: "GameDubs — Quiz participation", day: "WEDNESDAY", defaultPoints: 15 },
  { name: "Cosplay — 1st place", day: "FRIDAY", defaultPoints: 200 },
  { name: "Cosplay — 2nd place", day: "FRIDAY", defaultPoints: 120 },
  { name: "Cosplay — 3rd place", day: "FRIDAY", defaultPoints: 80 },
  { name: "Final Game — Winner", day: "FRIDAY", defaultPoints: 150 },
  { name: "Final Game — Played", day: "FRIDAY", defaultPoints: 30 },
];

async function main() {
  for (const a of ACTIVATIONS) {
    const existing = await prisma.activation.findFirst({
      where: { name: a.name, day: a.day },
    });
    if (existing) continue;
    await prisma.activation.create({ data: a });
  }

  await prisma.appSetting.upsert({
    where: { key: "rankingPublic" },
    update: {},
    create: { key: "rankingPublic", value: "false" },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
