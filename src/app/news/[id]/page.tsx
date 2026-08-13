import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Layout";
import { MarketBadge } from "@/components/ui/Badges";
import { AnalysisCard } from "@/components/Cards";
import CommentSection from "@/components/CommentSection";
import {
  getAnalyses,
  getComments,
  getNews,
  getNewsById,
} from "@/lib/data/queries";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate, formatNumber } from "@/lib/utils";

export default async function NewsDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await getNewsById(id);
  if (!news) notFound();

  const [comments, related, more, viewer] = await Promise.all([
    getComments("news", news.id),
    getAnalyses({ market: news.market, limit: 2 }),
    getNews({ market: news.market, limit: 4 }),
    getCurrentProfile(),
  ]);
  const configured = isSupabaseConfigured();
  const moreNews = more.filter((n) => n.id !== news.id).slice(0, 3);

  return (
    <Container className="grid gap-10 lg:grid-cols-3">
      <article className="lg:col-span-2">
        <Link href="/news" className="text-sm text-muted hover:text-fg">← All news</Link>
        <div className="mt-4 flex items-center gap-3">
          <MarketBadge market={news.market} href={`/markets/${news.market}`} />
          <span className="text-sm text-muted">{formatDate(news.published_at)}</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight">{news.title}</h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-muted">
          <span className="font-medium text-fg">{news.source}</span>
          <span>·</span>
          <span>{formatNumber(news.views)} views</span>
        </div>

        {news.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={news.image_url} alt="" className="mt-6 aspect-[16/9] w-full rounded-xl object-cover" />
        )}

        <p className="mt-6 text-lg leading-relaxed text-fg">{news.summary}</p>
        {news.content && <div className="prose-body mt-4 text-[15px]">{news.content}</div>}

        <a
          href={news.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-accent/50 transition"
        >
          Read full story at {news.source}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17 17 7M7 7h10v10" /></svg>
        </a>

        <CommentSection
          parentType="news"
          parentId={news.id}
          initial={comments}
          configured={configured}
          viewer={viewer}
        />
      </article>

      <aside className="space-y-8">
        {related.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Related analysis</h3>
            <div className="space-y-3">
              {related.map((a) => (
                <AnalysisCard key={a.id} item={a} />
              ))}
            </div>
          </div>
        )}
        {moreNews.length > 0 && (
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">More in this market</h3>
            <div className="space-y-3">
              {moreNews.map((n) => (
                <Link key={n.id} href={`/news/${n.id}`} className="block text-sm font-medium leading-snug hover:text-accent">{n.title}</Link>
              ))}
            </div>
          </div>
        )}
      </aside>
    </Container>
  );
}
