import { Container, MarketFilter, PageHeading } from "@/components/ui/Layout";
import { NewsCard } from "@/components/Cards";
import { EmptyState } from "@/components/ui/Layout";
import { getNews } from "@/lib/data/queries";
import { MARKET_LABELS, MarketCategory } from "@/lib/types";

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ market?: string }>;
}) {
  const { market } = await searchParams;
  const validMarket = (market && market in MARKET_LABELS ? market : undefined) as
    | MarketCategory
    | undefined;
  const news = await getNews({ market: validMarket });

  return (
    <Container>
      <PageHeading
        title="Financial News"
        subtitle="Curated market news, classified by asset class. Tap any story to read and discuss."
      />
      <MarketFilter basePath="/news" active={validMarket} />
      {news.length === 0 ? (
        <EmptyState title="No news in this market yet" hint="Try another market or check back soon." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <NewsCard key={n.id} item={n} />
          ))}
        </div>
      )}
    </Container>
  );
}
