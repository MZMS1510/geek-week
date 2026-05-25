"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { setRankingPublic } from "@/lib/settings";

export async function toggleRankingPublicAction(formData: FormData) {
  await requireRole("ADMIN");
  const next = formData.get("value") === "true";
  await setRankingPublic(next);
  revalidatePath("/admin");
  revalidatePath("/ranking");
}
