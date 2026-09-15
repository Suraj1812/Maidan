# Maidan

**Apna Maidan. Apni Takkar.**

Maidan is a real, end-to-end college competition platform: squads, challenges, evidence uploads, public voting, disputes, moderation, real-time notifications, and leaderboards computed entirely from live database activity — no fixtures, no fake numbers.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, shadcn/ui, and Supabase (Auth, Postgres, Storage, Realtime).

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the migrations in `supabase/migrations/` **in order** (`0001` → `0005`). Each file is idempotent-ish but must run once, in sequence.
   - `0001_init.sql` — tables, enums, RLS policies, seed categories & badges
   - `0002_functions.sql` — transactional RPCs (accept invite, accept/finalize challenge, resolve dispute)
   - `0003_storage.sql` — `evidence` and `avatars` storage buckets + policies
   - `0004_views.sql` — leaderboard views (squad/college/city/player), all real-data-driven
   - `0005_rate_limit.sql` — centralized rate limiting table + `check_rate_limit()`
3. In **Project Settings → API**, copy your Project URL and `anon` public key.
4. (Optional) To promote a user to moderator/admin so they can access `/moderation`, run:
   ```sql
   update profiles set role = 'moderator' where username = 'your_username';
   ```

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase values:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 4. Deploy to Vercel

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add the same three environment variables in the Vercel project settings — set `NEXT_PUBLIC_SITE_URL` to your production URL (e.g. `https://your-app.vercel.app`).
4. In Supabase → **Authentication → URL Configuration**, add your production URL and `https://your-app.vercel.app/auth/callback` to the allowed redirect URLs.
5. Deploy.

## What's real vs. what's still manual

- **Real**: auth, RLS-protected data access, squad/challenge/evidence/vote/dispute flows, leaderboards (SQL views over live tables), notifications (Postgres rows + Realtime push), rate limiting (DB-backed, works across serverless instances).
- **Manual for now**: challenge finalization is lazy (triggered when someone opens a challenge page past its voting deadline) rather than on a cron — wire up a Supabase scheduled function calling `finalize_challenge(challenge_id)` if you want it to happen without a visit. Promoting moderators is a manual SQL step (see above) rather than an admin UI.
- **Honest empty states everywhere**: no seeded users, squads, matches, or testimonials. Every number on the landing page and leaderboards is a live `count`/`sum` from Postgres and will read zero until real people use the product.

## Project structure

- `src/app/(auth)` — login/signup
- `src/app/(app)` — authenticated app (dashboard, squads, challenges, leaderboard, notifications, moderation)
- `src/app/u/[username]` — public profile pages
- `src/lib/data.ts` — read queries (server-only, degrade to empty on error)
- `src/lib/actions/` — server actions (mutations, validated with Zod, rate-limited)
- `supabase/migrations/` — full schema, RLS, RPCs, storage policies, views
