import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Layout";
import { MarketBadge } from "@/components/ui/Badges";
import Avatar from "@/components/ui/Avatar";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import { getComments, getCommunityPost } from "@/lib/data/queries";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate } from "@/lib/utils";

export default async function PostDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getCommunityPost(id);
  if (!post) notFound();

  const [comments, viewer] = await Promise.all([
    getComments("community", post.id),
    getCurrentProfile(),
  ]);
  const configured = isSupabaseConfigured();
  const author = post.author;

  return (
    <Container className="max-w-3xl">
      <Link href={`/community/${post.market}`} className="text-sm text-muted hover:text-fg">← Board</Link>

      <div className="mt-4 flex items-center gap-3">
        <MarketBadge market={post.market} href={`/community/${post.market}`} />
        <span className="text-sm text-muted">{formatDate(post.created_at)}</span>
      </div>
      <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight">{post.title}</h1>

      {author && (
        <Link href={`/profile/${author.username}`} className="mt-4 inline-flex items-center gap-3">
          <Avatar name={author.display_name} src={author.avatar_url} size={36} />
          <span>
            <span className="block text-sm font-semibold">{author.display_name}</span>
            <span className="block text-xs text-muted">@{author.username}</span>
          </span>
        </Link>
      )}

      <div className="prose-body mt-5 text-[15px]">{post.body}</div>

      <div className="mt-6 flex items-center gap-3 border-y border-line py-3">
        <LikeButton
          targetType="community"
          targetId={post.id}
          initialCount={post.likes_count ?? 0}
          configured={configured}
          signedIn={!!viewer}
        />
      </div>

      <CommentSection
        parentType="community"
        parentId={post.id}
        initial={comments}
        configured={configured}
        viewer={viewer}
      />
    </Container>
  );
}
