import type { getServerSupabase } from "@/lib/supabase/server";
import { fetchLiveNews } from "./finnhub";

type SupabaseClient = NonNullable<Awaited<ReturnType<typeof getServerSupabase>>>;

// Shared by the admin "Fetch latest news" button and the scheduled cron
// route, so both go through one code path. Fetches live articles, skips
// ones already stored (matched by original article URL), inserts the rest.
export async function ingestNewsInto(sb: SupabaseClient): Promise<number> {
  const articles = await fetchLiveNews();
  if (!articles.length) return 0;

  const { data: existing } = await sb.from("news").select("source_url");
  const existingUrls = new Set((existing ?? []).map((n) => n.source_url as string));
  const fresh = articles.filter((a) => !existingUrls.has(a.source_url));
  if (!fresh.length) return 0;

  const { error } = await sb.from("news").insert(
    fresh.map((a) => ({
      title: a.title,
      summary: a.summary,
      image_url: a.image_url,
      source: a.source,
      source_url: a.source_url,
      market: a.market,
      published_at: a.published_at,
    })),
  );
  if (error) throw new Error(error.message);
  return fresh.length;
}
