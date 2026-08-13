import Link from "next/link";
import { Container, MarketFilter, PageHeading, EmptyState } from "@/components/ui/Layout";
import { AnalysisCard } from "@/components/Cards";
import { getAnalyses } from "@/lib/data/queries";
import { MARKET_LABELS, MarketCategory } from "@/lib/types";

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ market?: string; sort?: string }>;
}) {
  const { market, sort } = await searchParams;
  const validMarket = (market && market in MARKET_LABELS ? market : undefined) as
    | MarketCategory
    | undefined;
  const analyses = await getAnalyses({
    market: validMarket,
    sort: sort === "popular" ? "popular" : "new",
  });

  return (
    <Container>
      <PageHeading
        title="Market Analysis"
        subtitle="Member-written theses with a clear stance. Publish yours and build a track record."
        action={
          <Link href="/analysis/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
            Write analysis
          </Link>
        }
      />
      <MarketFilter basePath="/analysis" active={validMarket} />
      {analyses.length === 0 ? (
        <EmptyState title="No analysis here yet" hint="Be the first to publish a thesis in this market." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analyses.map((a) => (
            <AnalysisCard key={a.id} item={a} />
          ))}
        </div>
      )}
    </Container>
  );
}
