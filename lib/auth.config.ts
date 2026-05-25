import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN ?? "sou.inteli.edu.br";

export const authConfig = {
  pages: { signIn: "/signin", error: "/signin" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      const email = (user.email ?? profile?.email ?? "").toLowerCase();
      if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        return `/signin?error=domain`;
      }
      return true;
    },
    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const PROTECTED = ["/me", "/staff", "/admin", "/ranking"];
      const needs = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
      if (!needs) return true;
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
