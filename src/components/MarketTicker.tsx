import Link from "next/link";
import { Market } from "@/lib/types";
import { formatNumber, formatPct } from "@/lib/utils";

export default function MarketTicker({ markets }: { markets: Market[] }) {
  const items = markets.filter((m) => m.slug !== "general");
  return (
    <div className="border-b border-line bg-surface/60">
      <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-2 thin-scroll">
        {items.map((m) => {
          const up = m.index_change >= 0;
          return (
            <Link
              key={m.slug}
              href={`/markets/${m.slug}`}
              className="flex shrink-0 items-center gap-2 text-xs hover:opacity-80"
            >
              <span className="font-semibold text-muted">{m.index_symbol}</span>
              <span className="tnum text-fg">{formatNumber(m.index_value)}</span>
              <span
                className="tnum font-medium"
                style={{ color: up ? "var(--bull)" : "var(--bear)" }}
              >
                {formatPct(m.index_change)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
