import Link from "next/link";
import { Container, PageHeading, SectionHeader } from "@/components/ui/Layout";
import { PostCard } from "@/components/Cards";
import { getCommunityPosts } from "@/lib/data/queries";
import { MARKET_LABELS, MarketCategory } from "@/lib/types";
import { marketColor } from "@/lib/utils";

const CATEGORIES: MarketCategory[] = [
  "us-stocks",
  "korea-stocks",
  "macro",
  "bonds",
  "fx",
  "commodities",
  "crypto",
  "general",
];

export default async function CommunityPage() {
  const [recent, popular] = await Promise.all([
    getCommunityPosts({ limit: 8 }),
    getCommunityPosts({ sort: "popular", limit: 5 }),
  ]);

  return (
    <Container>
      <PageHeading
        title="Community"
        subtitle="Boards by market. Ask questions, share ideas, and debate the tape."
        action={
          <Link href="/community/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
            New post
          </Link>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map((c) => (
          <Link key={c} href={`/community/${c}`} className="card hover-card p-4">
            <span className="mb-2 block h-1.5 w-8 rounded-full" style={{ background: marketColor(c) }} />
            <span className="text-sm font-semibold">{MARKET_LABELS[c]}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeader title="Recent posts" />
          <div className="space-y-3">
            {recent.map((p) => (
              <PostCard key={p.id} item={p} />
            ))}
          </div>
        </div>
        <aside>
          <SectionHeader title="Hot discussions" />
          <div className="space-y-3">
            {popular.map((p) => (
              <PostCard key={p.id} item={p} />
            ))}
          </div>
        </aside>
      </div>
    </Container>
  );
}
