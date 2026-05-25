import NextAuth, { type DefaultSession } from "next-auth";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role } from "@prisma/client";
import { prisma } from "./prisma";
import { generateQrToken } from "./qr";
import { authConfig } from "./auth.config";

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      qrToken: string;
    } & DefaultSession["user"];
  }
}

type AppToken = {
  id?: string;
  role?: Role;
  qrToken?: string;
  [key: string]: unknown;
};

const baseAdapter = PrismaAdapter(prisma);

const adapter: Adapter = {
  ...baseAdapter,
  // Override createUser so we can satisfy the required `qrToken` column
  // (Prisma's default adapter doesn't know about our custom fields) and
  // auto-promote known admins.
  async createUser(data) {
    const email = (data.email ?? "").toLowerCase();
    const role: Role = ADMIN_EMAILS.has(email) ? "ADMIN" : "PARTICIPANT";
    const created = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        image: data.image,
        emailVerified: data.emailVerified,
        qrToken: generateQrToken(),
        role,
      },
    });
    return created as unknown as AdapterUser;
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      const t = token as AppToken;
      // `user` is only present on the first call after sign-in.
      if (user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, role: true, qrToken: true },
        });
        if (dbUser) {
          t.id = dbUser.id;
          t.role = dbUser.role;
          t.qrToken = dbUser.qrToken;
        }
        return t;
      }
      // Refresh role/qrToken from DB on each request (cheap, supports promotion mid-session).
      if (t.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: t.id },
          select: { role: true, qrToken: true },
        });
        if (fresh) {
          t.role = fresh.role;
          t.qrToken = fresh.qrToken;
        }
      }
      return t;
    },
    async session({ session, token }) {
      const t = token as AppToken;
      if (t.id && t.role && t.qrToken) {
        session.user.id = t.id;
        session.user.role = t.role;
        session.user.qrToken = t.qrToken;
      }
      return session;
    },
  },
});
