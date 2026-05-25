import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "./auth";

const ROLE_RANK: Record<Role, number> = {
  PARTICIPANT: 0,
  STAFF: 1,
  ADMIN: 2,
};

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  return session;
}

export async function requireRole(min: Role) {
  const session = await requireSession();
  if (ROLE_RANK[session.user.role] < ROLE_RANK[min]) {
    redirect("/me");
  }
  return session;
}

export function hasRole(role: Role, min: Role) {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}
