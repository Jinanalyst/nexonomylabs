import { Container, MarketFilter, PageHeading } from "@/components/ui/Layout";
import { EmptyState } from "@/components/ui/Layout";
import NewsList from "@/components/NewsList";
import { getNews } from "@/lib/data/queries";
import { MARKET_LABELS, MarketCategory } from "@/lib/types";

const PAGE_SIZE = 9;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ market?: string }>;
}) {
  const { market } = await searchParams;
  const validMarket = (market && market in MARKET_LABELS ? market : undefined) as
    | MarketCategory
    | undefined;
  const news = await getNews({ market: validMarket, limit: PAGE_SIZE });

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
        <NewsList
          key={validMarket ?? "all"}
          initial={news}
          market={validMarket}
          initialHasMore={news.length === PAGE_SIZE}
        />
      )}
    </Container>
  );
}
