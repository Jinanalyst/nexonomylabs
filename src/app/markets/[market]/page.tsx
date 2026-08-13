import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, SectionHeader, EmptyState } from "@/components/ui/Layout";
import { AnalysisCard, NewsCard, PostCard } from "@/components/Cards";
import {
  getAnalyses,
  getCommunityPosts,
  getMarket,
  getMarkets,
  getNews,
} from "@/lib/data/queries";
import { MarketCategory } from "@/lib/types";
import { formatNumber, formatPct } from "@/lib/utils";

export default async function MarketPage({
  params,
}: {
  params: Promise<{ market: string }>;
}) {
  const { market: slug } = await params;
  const market = await getMarket(slug);
  if (!market) notFound();
  const cat = slug as MarketCategory;

  const [news, analyses, posts, allMarkets] = await Promise.all([
    getNews({ market: cat, limit: 6 }),
    getAnalyses({ market: cat, limit: 4 }),
    getCommunityPosts({ market: cat, limit: 5 }),
    getMarkets(),
  ]);
  const up = market.index_change >= 0;
  const others = allMarkets.filter((m) => m.slug !== "general");

  return (
    <>
      <section className="border-b border-line bg-panel/40">
        <Container className="py-8">
          <div className="mb-4 flex flex-wrap gap-2">
            {others.map((m) => (
              <Link
                key={m.slug}
                href={`/markets/${m.slug}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  m.slug === slug
                    ? "border-accent bg-accent text-white"
                    : "border-line text-muted hover:text-fg"
                }`}
              >
                {m.name}
              </Link>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{market.name}</h1>
          <p className="mt-2 max-w-2xl text-muted">{market.description}</p>
          {market.index_value > 0 && (
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-sm text-muted">{market.index_symbol}</span>
              <span className="tnum text-2xl font-semibold">{formatNumber(market.index_value)}</span>
              <span className="tnum text-sm font-medium" style={{ color: up ? "var(--bull)" : "var(--bear)" }}>{formatPct(market.index_change)}</span>
            </div>
          )}
        </Container>
      </section>

      <Container className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <div>
            <SectionHeader title="News" href={`/news?market=${slug}`} />
            {news.length === 0 ? (
              <EmptyState title="No news yet" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {news.map((n) => (
                  <NewsCard key={n.id} item={n} />
                ))}
              </div>
            )}
          </div>
          <div>
            <SectionHeader title="Analysis" href={`/analysis?market=${slug}`} />
            {analyses.length === 0 ? (
              <EmptyState title="No analysis yet" hint="Publish the first thesis for this market." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {analyses.map((a) => (
                  <AnalysisCard key={a.id} item={a} />
                ))}
              </div>
            )}
          </div>
        </div>
        <aside>
          <SectionHeader title="Discussions" href={`/community/${slug}`} />
          {posts.length === 0 ? (
            <EmptyState title="No discussions yet" />
          ) : (
            <div className="space-y-3">
              {posts.map((p) => (
                <PostCard key={p.id} item={p} />
              ))}
            </div>
          )}
        </aside>
      </Container>
    </>
  );
}
