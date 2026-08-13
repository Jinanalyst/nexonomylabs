import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeading, EmptyState } from "@/components/ui/Layout";
import { PostCard } from "@/components/Cards";
import { getCommunityPosts } from "@/lib/data/queries";
import { MARKET_LABELS, MarketCategory } from "@/lib/types";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!(category in MARKET_LABELS)) notFound();
  const market = category as MarketCategory;
  const posts = await getCommunityPosts({ market });

  return (
    <Container>
      <PageHeading
        title={`${MARKET_LABELS[market]} board`}
        subtitle="Discussion for this market."
        action={
          <Link href="/community/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
            New post
          </Link>
        }
      />
      <Link href="/community" className="mb-4 inline-block text-sm text-muted hover:text-fg">← All boards</Link>
      {posts.length === 0 ? (
        <EmptyState title="No posts here yet" hint="Start the first discussion in this board." />
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <PostCard key={p.id} item={p} />
          ))}
        </div>
      )}
    </Container>
  );
}
