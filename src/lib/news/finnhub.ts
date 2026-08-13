import { MarketCategory } from "@/lib/types";

// ---------------------------------------------------------------------------
// Live news ingestion from Finnhub (free tier — https://finnhub.io).
// Only "general", "forex", "crypto" and "merger" categories exist on
// Finnhub's free news endpoint, plus per-symbol company news. That maps onto
// macro / fx / crypto / us-stocks. Korea stocks, bonds and commodities have
// no equivalent free, image-bearing source and stay curated via seed data
// and the Admin news form.
// ---------------------------------------------------------------------------

const FINNHUB_BASE = "https://finnhub.io/api/v1";

export interface FetchedArticle {
  title: string;
  summary: string;
  image_url: string | null;
  source: string;
  source_url: string;
  market: MarketCategory;
  published_at: string;
}

interface FinnhubNewsItem {
  datetime: number;
  headline: string;
  image: string;
  source: string;
  summary: string;
  url: string;
}

function apiKey(): string | null {
  const key = process.env.FINNHUB_API_KEY;
  return key && key.length > 5 ? key : null;
}

export function isNewsApiConfigured(): boolean {
  return apiKey() !== null;
}

function normalize(
  item: FinnhubNewsItem,
  market: MarketCategory,
): FetchedArticle | null {
  if (!item.headline || !item.url || !item.datetime) return null;
  return {
    title: item.headline.trim(),
    summary: (item.summary || item.headline).trim().slice(0, 400),
    image_url: item.image?.startsWith("http") ? item.image : null,
    source: item.source || "Finnhub",
    source_url: item.url,
    market,
    published_at: new Date(item.datetime * 1000).toISOString(),
  };
}

async function fetchJson(url: string): Promise<FinnhubNewsItem[]> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchCategory(
  category: string,
  market: MarketCategory,
): Promise<FetchedArticle[]> {
  const key = apiKey();
  if (!key) return [];
  const data = await fetchJson(
    `${FINNHUB_BASE}/news?category=${category}&token=${key}`,
  );
  return data
    .slice(0, 12)
    .map((item) => normalize(item, market))
    .filter((a): a is FetchedArticle => a !== null);
}

const US_TICKERS = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "TSLA", "META"];

async function fetchCompanyNews(symbol: string): Promise<FetchedArticle[]> {
  const key = apiKey();
  if (!key) return [];
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const data = await fetchJson(
    `${FINNHUB_BASE}/company-news?symbol=${symbol}&from=${fmt(from)}&to=${fmt(to)}&token=${key}`,
  );
  return data
    .slice(0, 4)
    .map((item) => normalize(item, "us-stocks"))
    .filter((a): a is FetchedArticle => a !== null);
}

export async function fetchLiveNews(): Promise<FetchedArticle[]> {
  const [general, forex, crypto, merger, ...companies] = await Promise.all([
    fetchCategory("general", "macro"),
    fetchCategory("forex", "fx"),
    fetchCategory("crypto", "crypto"),
    fetchCategory("merger", "us-stocks"),
    ...US_TICKERS.map(fetchCompanyNews),
  ]);

  const all = [...general, ...forex, ...crypto, ...merger, ...companies.flat()];

  const seen = new Set<string>();
  return all.filter((a) => {
    if (seen.has(a.source_url)) return false;
    seen.add(a.source_url);
    return true;
  });
}
