import Link from "next/link";
import { Container, PageHeading, SectionHeader, EmptyState } from "@/components/ui/Layout";
import { AnalysisCard, NewsCard, PostCard } from "@/components/Cards";
import Avatar from "@/components/ui/Avatar";
import { search } from "@/lib/data/queries";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query
    ? await search(query)
    : { news: [], analyses: [], posts: [], users: [] };
  const total =
    results.news.length +
    results.analyses.length +
    results.posts.length +
    results.users.length;

  return (
    <Container>
      <PageHeading
        title={query ? `Results for “${query}”` : "Search"}
        subtitle={query ? `${total} result${total === 1 ? "" : "s"} across news, analysis, community and users.` : "Search news, analysis, discussions and members."}
      />

      {!query ? (
        <form action="/search" className="max-w-lg">
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 focus-within:border-accent/60">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            <input name="q" autoFocus placeholder="Try “inflation”, “nvidia”, “bitcoin”…" className="w-full bg-transparent text-sm outline-none" />
          </div>
        </form>
      ) : total === 0 ? (
        <EmptyState title="No results" hint="Try a different keyword." />
      ) : (
        <div className="space-y-10">
          {results.users.length > 0 && (
            <div>
              <SectionHeader title="Members" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.users.map((u) => (
                  <Link key={u.id} href={`/profile/${u.username}`} className="card hover-card flex items-center gap-3 p-3">
                    <Avatar name={u.display_name} src={u.avatar_url} size={40} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{u.display_name}</span>
                      <span className="block truncate text-xs text-muted">@{u.username}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {results.news.length > 0 && (
            <div>
              <SectionHeader title="News" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.news.map((n) => (
                  <NewsCard key={n.id} item={n} />
                ))}
              </div>
            </div>
          )}
          {results.analyses.length > 0 && (
            <div>
              <SectionHeader title="Analysis" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.analyses.map((a) => (
                  <AnalysisCard key={a.id} item={a} />
                ))}
              </div>
            </div>
          )}
          {results.posts.length > 0 && (
            <div>
              <SectionHeader title="Community" />
              <div className="space-y-3">
                {results.posts.map((p) => (
                  <PostCard key={p.id} item={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
