import Link from "next/link";
import {
  MARKET_LABELS,
  MarketCategory,
  SENTIMENT_LABELS,
  Sentiment,
} from "@/lib/types";
import { marketColor } from "@/lib/utils";

export function MarketBadge({
  market,
  href,
}: {
  market: MarketCategory;
  href?: string;
}) {
  const color = marketColor(market);
  const inner = (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      />
      {MARKET_LABELS[market]}
    </span>
  );
  return href ? (
    <Link href={href} className="hover:opacity-80 transition">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const map: Record<Sentiment, { color: string; icon: string }> = {
    bullish: { color: "var(--bull)", icon: "▲" },
    bearish: { color: "var(--bear)", icon: "▼" },
    neutral: { color: "var(--neutral)", icon: "◆" },
  };
  const { color, icon } = map[sentiment];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
      }}
    >
      <span className="text-[9px]">{icon}</span>
      {SENTIMENT_LABELS[sentiment]}
    </span>
  );
}
