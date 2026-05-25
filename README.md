# Semana Geek 2026

Score app for **Semana Geek 2026** — GameLab Inteli. Mobile-first Next.js app where Inteli students (Google `@sou.inteli.edu.br`) sign in, get a personal QR code, and earn points across the week's activations:

- **Seg 25/05** — GameTourney (arcade)
- **Ter 26/05** — GameClubs (atividades das ligas)
- **Qua 27/05** — GameDubs (talk + quiz)
- **Sex 29/05** — Cosplay Tourney + Final Game

There are three roles:

- **PARTICIPANT** — sees their own score, QR, and history. No ranking until reveal.
- **STAFF** — scans participant QRs to award points (pre-seeded activations or free-form override).
- **ADMIN** — full access to users, activations, ranking, and audit log; toggles when the ranking goes public.

## Stack

- Next.js 14 (App Router, TypeScript, Server Actions)
- Postgres + Prisma
- NextAuth (Auth.js v5) — Google provider, domain-gated
- Tailwind + shadcn-style UI
- `qrcode` (server-rendered QR) + `html5-qrcode` (in-app camera scanner)

## Setup

```bash
# 1. Install deps
npm install

# 2. Copy env template and fill in
cp .env.example .env
# - DATABASE_URL: your Postgres connection string
# - AUTH_SECRET: openssl rand -base64 32
# - AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET: from Google Cloud Console
#     Authorized redirect URI: {AUTH_URL}/api/auth/callback/google
# - ADMIN_EMAILS: comma-separated emails that should be ADMIN on first login

# 3. Initialize the database
npx prisma migrate dev --name init
npx prisma db seed

# 4. Run dev server
npm run dev
```

Open http://localhost:3000 and sign in with an `@sou.inteli.edu.br` account.

## Deploying to Vercel

1. Push to a Git repo and import into Vercel.
2. Add a Postgres database (Vercel Postgres / Neon / Supabase) and copy `DATABASE_URL` into the project's env vars.
3. Add all variables from `.env.example`.
4. In Google Cloud Console, add `https://YOUR-DOMAIN/api/auth/callback/google` as an authorized redirect URI.
5. After first deploy, run migrations against the prod DB:
   ```bash
   DATABASE_URL=... npx prisma migrate deploy
   DATABASE_URL=... npx prisma db seed
   ```

## Roles

- The first admin is whoever's email is listed in `ADMIN_EMAILS` — they're promoted automatically the first time they sign in.
- That admin can promote anyone else to STAFF or ADMIN at `/admin/users`.

## Reveal flow

- The `rankingPublic` setting starts `false`.
- Admin flips it on the dashboard (`/admin`) when ready (e.g. Friday evening).
- Until then, `/ranking` shows a "será revelado" message to non-admins.

## Routes

| Path                          | Who           |
|-------------------------------|---------------|
| `/`                           | landing / redirect by role |
| `/signin`                     | Google sign-in |
| `/me`                         | participant home (score, QR, history) |
| `/ranking`                    | public ranking (gated) |
| `/staff`                      | staff home + scan CTA |
| `/staff/scan`                 | camera scanner |
| `/staff/award/[token]`        | award form for a participant |
| `/admin`                      | dashboard + reveal toggle |
| `/admin/users`                | role management |
| `/admin/activations`          | CRUD activations |
| `/admin/ranking`              | full ranking (always) |
| `/admin/awards`               | audit log |

## Notes

- QR tokens use a 10-char alphabet (`A–Z` minus ambiguous chars + `2–9`) — safe for low-end cameras.
- Deleting an activation with awards attached soft-disables it instead of hard-deleting, to preserve the audit trail.
- Admins can't demote themselves to avoid accidental lockouts.
