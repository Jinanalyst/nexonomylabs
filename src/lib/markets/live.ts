import { MarketCategory } from "@/lib/types";

// ---------------------------------------------------------------------------
// Live index/yield/price data via Yahoo Finance's public (unofficial, no key
// required) chart endpoint. Used to override the static index_value /
// index_change on top of whatever `markets` rows come from Supabase or seed
// data, so the ticker always reflects real current prices. If a quote fails
// to fetch (network issue, endpoint blocked from this host, etc.) that
// market silently keeps its last known stored value — the ticker never
// breaks, it just goes stale until the next successful fetch.
// ---------------------------------------------------------------------------

const SYMBOLS: Partial<Record<MarketCategory, string>> = {
  "us-stocks": "%5EGSPC", // S&P 500
  "korea-stocks": "%5EKS11", // KOSPI
  macro: "2YY=F", // US 2-Year Treasury yield
  bonds: "%5ETNX", // US 10-Year Treasury yield
  fx: "DX-Y.NYB", // ICE US Dollar Index
  commodities: "GC=F", // Gold futures
  crypto: "BTC-USD",
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export interface LiveQuote {
  value: number;
  change: number; // percent
}

async function fetchQuote(symbol: string): Promise<LiveQuote | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        headers: { "User-Agent": UA },
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    const prevClose = meta?.chartPreviousClose ?? meta?.previousClose;
    if (typeof price !== "number" || typeof prevClose !== "number" || !prevClose)
      return null;
    return { value: price, change: ((price - prevClose) / prevClose) * 100 };
  } catch {
    return null;
  }
}

export async function fetchLiveMarketData(): Promise<
  Partial<Record<MarketCategory, LiveQuote>>
> {
  const entries = Object.entries(SYMBOLS) as [MarketCategory, string][];
  const results = await Promise.all(entries.map(([, symbol]) => fetchQuote(symbol)));
  const out: Partial<Record<MarketCategory, LiveQuote>> = {};
  entries.forEach(([market], i) => {
    const quote = results[i];
    if (quote) out[market] = quote;
  });
  return out;
}
