import Link from "next/link";
import { Container, SectionHeader } from "@/components/ui/Layout";
import { AnalysisCard, NewsCard, NewsRow, PostCard } from "@/components/Cards";
import {
  getAnalyses,
  getCommunityPosts,
  getMarkets,
  getNews,
  getPopularNews,
} from "@/lib/data/queries";
import { formatNumber, formatPct } from "@/lib/utils";

export default async function HomePage() {
  const [markets, latestNews, popularNews, latestAnalysis, popularAnalysis, posts] =
    await Promise.all([
      getMarkets(),
      getNews({ limit: 6 }),
      getPopularNews(5),
      getAnalyses({ limit: 4 }),
      getAnalyses({ sort: "popular", limit: 3 }),
      getCommunityPosts({ sort: "popular", limit: 5 }),
    ]);

  const indices = markets.filter((m) => m.slug !== "general");

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-gradient-to-b from-panel/50 to-transparent">
        <Container className="py-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-bull" /> Advancing the digital frontier
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Where individual investors become{" "}
              <span className="bg-gradient-to-r from-accent to-teal bg-clip-text text-transparent">verified experts</span>.
            </h1>
            <p className="mt-4 text-lg text-muted">
              Read the markets, publish your thesis, and debate with a serious
              community. Prediction, verification, and reputation — in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/signup" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition">Join the community</Link>
              <Link href="/analysis" className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold hover:border-accent/50 transition">Explore analysis</Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Market indices */}
      <Container className="py-8">
        <SectionHeader title="Markets" href="/markets/us-stocks" linkLabel="All markets" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {indices.map((m) => {
            const up = m.index_change >= 0;
            return (
              <Link key={m.slug} href={`/markets/${m.slug}`} className="card hover-card p-3.5">
                <div className="text-xs font-medium text-muted">{m.index_symbol}</div>
                <div className="tnum mt-1 text-base font-semibold">{formatNumber(m.index_value)}</div>
                <div className="tnum text-xs font-medium" style={{ color: up ? "var(--bull)" : "var(--bear)" }}>{formatPct(m.index_change)}</div>
              </Link>
            );
          })}
        </div>
      </Container>

      {/* Main grid */}
      <Container className="grid gap-8 pt-0 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <div>
            <SectionHeader title="Latest news" href="/news" />
            <div className="grid gap-4 sm:grid-cols-2">
              {latestNews.map((n) => (
                <NewsCard key={n.id} item={n} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="Latest analysis" href="/analysis" />
            <div className="grid gap-4 sm:grid-cols-2">
              {latestAnalysis.map((a) => (
                <AnalysisCard key={a.id} item={a} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div className="card p-4">
            <SectionHeader title="Popular news" href="/news" />
            <div>
              {popularNews.map((n) => (
                <NewsRow key={n.id} item={n} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="Top analysis" href="/analysis" />
            <div className="space-y-3">
              {popularAnalysis.map((a) => (
                <AnalysisCard key={a.id} item={a} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="Hot discussions" href="/community" />
            <div className="space-y-3">
              {posts.map((p) => (
                <PostCard key={p.id} item={p} />
              ))}
            </div>
          </div>
        </aside>
      </Container>
    </>
  );
}
