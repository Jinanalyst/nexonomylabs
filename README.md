# Nexonomy Labs

> Where individual investors become verified experts.

A financial‑market **community platform** — read the news, publish your market
thesis, debate with a serious community. Built with **Next.js (App Router) +
Supabase + Tailwind CSS**, with a Bloomberg/TradingView‑style professional UI
and full **dark / light** support.

<p align="center"><em>Advancing the digital frontier.</em></p>

---

## ✨ Features

| Area | What you get |
|------|--------------|
| **News** | Market news classified by asset class (US / Korea / Macro / Bonds / FX / Commodities / Crypto) with source, image, original link and views. |
| **News comments** | Threaded discussion on every article — replies, likes, timestamps. |
| **Market Analysis** | Members publish theses with a **Bullish / Bearish / Neutral** stance, market tag, related news and discussion. |
| **Community** | Boards per market. Create posts, reply, like. |
| **Profiles & Follow** | Avatars, bio, authored analysis & posts, follower/following counts, and a personalized **Feed** of who you follow. |
| **Markets** | `/markets/us-stocks`, `/markets/crypto`, … each aggregating news + analysis + discussion. |
| **Search** | Across news, analysis, community and members. |
| **Admin** | Publish/delete news, moderate posts, comments and members. |
| **Auth** | Email sign‑up / login via Supabase, with Row‑Level‑Security throughout. |

## 🧪 Demo mode (no setup required)

The app runs out of the box **without any credentials** — it serves rich seed
data so every page is browsable and comments/likes work locally. A yellow banner
indicates demo mode. Connect Supabase (below) to enable real auth and
persistence.

```bash
npm install
npm run dev
# → http://localhost:3000
```

## 🔌 Connect Supabase (real auth + persistence)

1. Create a project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL Editor** and run, in order:
   - `supabase/schema.sql` — tables, triggers, RLS policies.
   - `supabase/seed.sql` — demo experts, news, analyses, posts, comments.
3. Copy your API keys from **Project Settings → API** into `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```
4. Restart `npm run dev`. The demo banner disappears and sign‑in, comments,
   analysis, posts and follows all persist.

**Seeded demo logins** (all password `nexonomy123`): `maya@nexonomy.demo`
(admin), `junho@`, `elena@`, `tom@`, `carla@nexonomy.demo`.

> To make your own account an admin, run in SQL:
> `update profiles set role='admin' where username='YOUR_USERNAME';`

## 🗄️ Data model

`profiles · markets · news · analysis · community_posts · comments · likes ·
follows · notifications`

- **Comments** and **likes** use a single polymorphic table each
  (`parent_type` / `target_type`) covering news, analysis and community —
  simpler than three near‑identical tables while offering identical behavior.
- Denormalized `comments_count` / `likes_count` are kept in sync by triggers.
- A `handle_new_user` trigger auto‑creates a profile on sign‑up.
- **RLS**: everything is publicly readable; users may only write their own
  content; admins can moderate anything.

## 📈 Live market data

The market ticker (S&P 500, KOSPI, US 2Y/10Y yields, DXY, Gold, BTC) shows
**real current prices**, fetched server-side from Yahoo Finance's public chart
endpoint (`src/lib/markets/live.ts`) — no API key needed, refreshed roughly
every 60 seconds. This is Yahoo's unofficial, undocumented endpoint, widely
used for this purpose but not an officially supported API; if it ever gets
rate-limited or blocked from a given host, each market silently falls back to
its last known value in the `markets` table rather than breaking the UI.

## 📰 Live news (Finnhub)

News starts as clean seed data, but the app can pull **real articles with
images** from [Finnhub](https://finnhub.io)'s free news API:

1. Get a free API key at [finnhub.io/register](https://finnhub.io/register)
   (no credit card).
2. Add it to `.env.local`: `FINNHUB_API_KEY=your-key`.
3. Restart the dev server, sign in as an admin, go to **/admin → News**, and
   click **Fetch latest news**. New articles (title, summary, real image,
   source, original link) are inserted straight into the `news` table —
   duplicates are skipped by matching on the original article URL.

Finnhub's free tier only categorizes **general → Macro**, **forex → FX**,
**crypto → Crypto**, and **mergers / major US tickers → US Stocks**. Korea
Stocks, Bonds and Commodities have no equivalent free, image-bearing API, so
those three are instead filled in from keyless RSS feeds (한국경제 증권,
Investing.com bonds/commodities — see `src/lib/news/rss.ts`), no signup
required. Between Finnhub and RSS, every market category now refreshes
automatically.

### Automated refresh

News does **not** refresh itself just by running `npm run dev` — a scheduler
needs to periodically call the ingestion endpoint, since that requires an
always-on host. The endpoint itself already exists at
`/api/cron/ingest-news` and does exactly what the admin button does.

**On Vercel** (recommended): `vercel.json` already declares a daily cron
(`0 0 * * *`, matching the Hobby/free plan's once-per-day limit) hitting that
route. Add `CRON_SECRET` **and `SUPABASE_SERVICE_ROLE_KEY`** as environment
variables in your Vercel project — Vercel automatically sends `CRON_SECRET`
as a Bearer token when it calls the route, so nobody else can trigger it. The
service role key is required too: the cron request has no logged-in admin
session, so without it the insert is rejected by the `admin write news` RLS
policy. Pro plans allow more frequent schedules — check your plan's current
limits in the Vercel dashboard, as these change over time.

**Anywhere else**: point any scheduler (GitHub Actions on a cron trigger,
a cron job on your own server, cron-job.org, etc.) at
`GET https://your-domain.com/api/cron/ingest-news` with header
`Authorization: Bearer <CRON_SECRET>`, on whatever interval you like.

The news list page itself also supports **pagination** — it loads 9 articles
at a time with a "Load more" button that appends older articles in place
(no page navigation, so you never lose your scroll position or get redirected
away from what you were reading).

## 🛠 Tech

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS v4
· Supabase (Postgres + Auth + RLS) · `@supabase/ssr`.

## 🚀 Deploy

Deploy to Vercel and set `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables. That's it.

---

_Educational content only — not investment advice._
