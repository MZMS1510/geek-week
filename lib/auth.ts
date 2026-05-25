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

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    qrToken: string;
  }
}

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
      // `user` is only present on the first call after sign-in.
      if (user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, role: true, qrToken: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.qrToken = dbUser.qrToken;
        }
        return token;
      }
      // Refresh role/qrToken from DB on each request (cheap, supports promotion mid-session).
      if (token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, qrToken: true },
        });
        if (fresh) {
          token.role = fresh.role;
          token.qrToken = fresh.qrToken;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.qrToken = token.qrToken;
      }
      return session;
    },
  },
});
