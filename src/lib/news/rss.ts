import { MarketCategory } from "@/lib/types";
import type { FetchedArticle } from "./finnhub";

// ---------------------------------------------------------------------------
// Keyless RSS ingestion for the markets Finnhub's free tier doesn't cover:
// Korea stocks, bonds and commodities. No signup or API key required.
// ---------------------------------------------------------------------------

interface RssSource {
  url: string;
  market: MarketCategory;
  source: string;
}

const RSS_SOURCES: RssSource[] = [
  { url: "https://www.hankyung.com/feed/finance", market: "korea-stocks", source: "한국경제" },
  { url: "https://www.investing.com/rss/bonds.rss", market: "bonds", source: "Investing.com" },
  {
    url: "https://www.investing.com/rss/commodities.rss",
    market: "commodities",
    source: "Investing.com",
  },
];

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&(#39|apos);/g, "'");
}

function extractTag(block: string, tag: string): string | null {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (!m) return null;
  const raw = m[1].trim();
  const cdata = raw.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return decodeEntities((cdata ? cdata[1] : raw).trim());
}

function parseItems(xml: string): { title: string; link: string; pubDate: string | null }[] {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  return blocks
    .map((block) => ({
      title: extractTag(block, "title"),
      link: extractTag(block, "link"),
      pubDate: extractTag(block, "pubDate"),
    }))
    .filter((i): i is { title: string; link: string; pubDate: string | null } => !!i.title && !!i.link);
}

async function fetchFeed(src: RssSource): Promise<FetchedArticle[]> {
  try {
    const res = await fetch(src.url, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NexonomyLabsBot/1.0)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseItems(xml)
      .slice(0, 12)
      .map((item) => {
        const published = item.pubDate ? new Date(item.pubDate) : new Date();
        return {
          title: item.title,
          summary: item.title,
          image_url: null,
          source: src.source,
          source_url: item.link,
          market: src.market,
          published_at: Number.isNaN(published.getTime())
            ? new Date().toISOString()
            : published.toISOString(),
        };
      });
  } catch {
    return [];
  }
}

export async function fetchRssNews(): Promise<FetchedArticle[]> {
  const results = await Promise.all(RSS_SOURCES.map(fetchFeed));
  return results.flat();
}
