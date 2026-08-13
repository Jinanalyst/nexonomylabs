import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Layout";
import { MarketBadge, SentimentBadge } from "@/components/ui/Badges";
import Avatar from "@/components/ui/Avatar";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import {
  getAnalysisById,
  getComments,
  getNewsById,
} from "@/lib/data/queries";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate } from "@/lib/utils";

export default async function AnalysisDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const analysis = await getAnalysisById(id);
  if (!analysis) notFound();

  const [comments, relatedNews, viewer] = await Promise.all([
    getComments("analysis", analysis.id),
    analysis.related_news_id ? getNewsById(analysis.related_news_id) : Promise.resolve(null),
    getCurrentProfile(),
  ]);
  const configured = isSupabaseConfigured();
  const author = analysis.author;

  return (
    <Container className="max-w-3xl">
      <Link href="/analysis" className="text-sm text-muted hover:text-fg">← All analysis</Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SentimentBadge sentiment={analysis.sentiment} />
        <MarketBadge market={analysis.market} href={`/markets/${analysis.market}`} />
        <span className="ml-auto text-sm text-muted">{formatDate(analysis.created_at)}</span>
      </div>

      <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight">{analysis.title}</h1>

      {author && (
        <Link href={`/profile/${author.username}`} className="mt-4 inline-flex items-center gap-3">
          <Avatar name={author.display_name} src={author.avatar_url} size={40} />
          <span>
            <span className="block text-sm font-semibold">{author.display_name}</span>
            <span className="block text-xs text-muted">@{author.username}</span>
          </span>
        </Link>
      )}

      <div className="prose-body mt-6 text-[15px]">{analysis.body}</div>

      {relatedNews && (
        <Link href={`/news/${relatedNews.id}`} className="mt-6 flex items-center gap-3 rounded-xl border border-line bg-surface p-3 hover:border-accent/50 transition">
          {relatedNews.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={relatedNews.image_url} alt="" className="h-14 w-20 rounded-lg object-cover" />
          )}
          <span>
            <span className="block text-xs font-medium uppercase tracking-wide text-muted">Related news</span>
            <span className="block text-sm font-medium leading-snug">{relatedNews.title}</span>
          </span>
        </Link>
      )}

      <div className="mt-6 flex items-center gap-3 border-y border-line py-3">
        <LikeButton
          targetType="analysis"
          targetId={analysis.id}
          initialCount={analysis.likes_count ?? 0}
          configured={configured}
          signedIn={!!viewer}
        />
        <a href="#comments" className="text-sm text-muted hover:text-fg">Jump to discussion</a>
      </div>

      <CommentSection
        parentType="analysis"
        parentId={analysis.id}
        initial={comments}
        configured={configured}
        viewer={viewer}
      />
    </Container>
  );
}
