"use client";

import { useState, useTransition } from "react";
import { NewsCard } from "@/components/Cards";
import { loadMoreNews } from "@/app/actions";
import { MarketCategory, NewsItem } from "@/lib/types";

const PAGE_SIZE = 9;

export default function NewsList({
  initial,
  market,
  initialHasMore,
}: {
  initial: NewsItem[];
  market?: MarketCategory;
  initialHasMore: boolean;
}) {
  const [items, setItems] = useState(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function loadMore() {
    start(async () => {
      try {
        const next = await loadMoreNews(market, items.length, PAGE_SIZE);
        setItems((prev) => [...prev, ...next]);
        setHasMore(next.length === PAGE_SIZE);
        setError(null);
      } catch {
        setError("Couldn't load more news. Try again.");
      }
    });
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((n) => (
          <NewsCard key={n.id} item={n} />
        ))}
      </div>

      {error && <p className="mt-4 text-center text-sm text-bear">{error}</p>}

      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={pending}
            className="rounded-lg border border-line px-6 py-2.5 text-sm font-semibold transition hover:border-accent/50 disabled:opacity-50"
          >
            {pending ? "Loading…" : "Load more news"}
          </button>
        </div>
      ) : (
        items.length > 0 && (
          <p className="mt-8 text-center text-sm text-muted">
            You&apos;ve reached the end — that&apos;s all the news in this market.
          </p>
        )
      )}
    </div>
  );
}
