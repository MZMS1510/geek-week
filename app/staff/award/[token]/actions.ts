"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  token: z.string().regex(/^[A-Z2-9]{10}$/),
  activationId: z.string().min(1),
});

export async function awardPointsAction(formData: FormData) {
  const session = await requireRole("STAFF");

  const raw = {
    token: String(formData.get("token") ?? "").toUpperCase(),
    activationId: (formData.get("activationId") as string) || "",
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    redirect(`/staff/award/${raw.token}?error=invalid`);
  }
  const data = parsed.data;

  const participant = await prisma.user.findUnique({
    where: { qrToken: data.token },
    select: { id: true },
  });
  if (!participant) redirect(`/staff/award/${data.token}?error=notfound`);

  const activation = await prisma.activation.findUnique({
    where: { id: data.activationId },
    select: { id: true, isActive: true, defaultPoints: true },
  });
  if (!activation?.isActive) {
    redirect(`/staff/award/${data.token}?error=invalid`);
  }

  await prisma.pointAward.create({
    data: {
      participantId: participant.id,
      awarderId: session.user.id,
      activationId: activation.id,
      points: activation.defaultPoints,
    },
  });

  revalidatePath("/staff");
  revalidatePath("/me");
  revalidatePath("/admin");
  revalidatePath("/admin/awards");
  revalidatePath("/admin/ranking");
  redirect(`/staff?awarded=${data.token}`);
}
