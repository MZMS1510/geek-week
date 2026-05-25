"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function deleteAwardAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.pointAward.delete({ where: { id } });

  revalidatePath("/admin/awards");
  revalidatePath("/admin/ranking");
  revalidatePath("/admin");
  revalidatePath("/me");
  revalidatePath("/ranking");
  revalidatePath("/staff");
}
