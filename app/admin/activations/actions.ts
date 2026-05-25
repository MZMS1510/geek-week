"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const upsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(80),
  description: z.string().max(280).optional(),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "FRIDAY"]),
  defaultPoints: z.coerce.number().int().min(-1000).max(1000),
  isActive: z.coerce.boolean().optional(),
});

export async function upsertActivationAction(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = upsertSchema.safeParse({
    id: (formData.get("id") as string) || undefined,
    name: formData.get("name"),
    description: (formData.get("description") as string) || undefined,
    day: formData.get("day"),
    defaultPoints: formData.get("defaultPoints"),
    isActive: formData.get("isActive") === "on" ? true : false,
  });
  if (!parsed.success) return;

  const { id, ...data } = parsed.data;
  if (id) {
    await prisma.activation.update({ where: { id }, data });
  } else {
    await prisma.activation.create({ data });
  }
  revalidatePath("/admin/activations");
  revalidatePath("/staff/award");
}

export async function toggleActivationAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const cur = await prisma.activation.findUnique({ where: { id }, select: { isActive: true } });
  if (!cur) return;
  await prisma.activation.update({ where: { id }, data: { isActive: !cur.isActive } });
  revalidatePath("/admin/activations");
}

export async function deleteActivationAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const usedCount = await prisma.pointAward.count({ where: { activationId: id } });
  if (usedCount > 0) {
    // Soft-disable instead of hard delete to preserve audit trail.
    await prisma.activation.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.activation.delete({ where: { id } });
  }
  revalidatePath("/admin/activations");
}
