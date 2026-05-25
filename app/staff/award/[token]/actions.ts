"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  token: z.string().regex(/^[A-Z2-9]{10}$/),
  activationId: z.string().min(1).optional(),
  points: z.coerce.number().int().min(-1000).max(1000),
  note: z.string().max(280).optional(),
});

export async function awardPointsAction(formData: FormData) {
  const session = await requireRole("STAFF");

  const raw = {
    token: String(formData.get("token") ?? "").toUpperCase(),
    activationId: (formData.get("activationId") as string) || undefined,
    points: formData.get("points"),
    note: (formData.get("note") as string) || undefined,
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    redirect(`/staff/award/${raw.token}?error=invalid`);
  }
  const data = parsed.data;
  if (data.points === 0) {
    redirect(`/staff/award/${data.token}?error=zero`);
  }

  const participant = await prisma.user.findUnique({
    where: { qrToken: data.token },
    select: { id: true },
  });
  if (!participant) redirect(`/staff/award/${data.token}?error=notfound`);

  let activationId: string | undefined;
  if (data.activationId) {
    const act = await prisma.activation.findUnique({
      where: { id: data.activationId },
      select: { id: true, isActive: true },
    });
    if (act?.isActive) activationId = act.id;
  }

  await prisma.pointAward.create({
    data: {
      participantId: participant.id,
      awarderId: session.user.id,
      activationId,
      points: data.points,
      note: data.note?.trim() || null,
    },
  });

  revalidatePath("/staff");
  revalidatePath("/me");
  revalidatePath("/admin");
  revalidatePath("/admin/awards");
  revalidatePath("/admin/ranking");
  redirect(`/staff?awarded=${data.token}`);
}
