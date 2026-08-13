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
Stocks, Bonds and Commodities have no equivalent free, image-bearing source
today, so those stay curated via seed data or the manual "Publish news" form
in Admin.

## 🛠 Tech

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS v4
· Supabase (Postgres + Auth + RLS) · `@supabase/ssr`.

## 🚀 Deploy

Deploy to Vercel and set `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables. That's it.

---

_Educational content only — not investment advice._
