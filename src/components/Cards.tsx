import Link from "next/link";
import { Analysis, CommunityPost, NewsItem } from "@/lib/types";
import { formatNumber, timeAgo } from "@/lib/utils";
import { MarketBadge, SentimentBadge } from "@/components/ui/Badges";
import Avatar from "@/components/ui/Avatar";

function Meta({
  comments,
  likes,
}: {
  comments?: number;
  likes?: number;
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted">
      {likes !== undefined && (
        <span className="inline-flex items-center gap-1">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-6 0v4H5l-2 9h14l2-9z" /></svg>
          {formatNumber(likes)}
        </span>
      )}
      {comments !== undefined && (
        <span className="inline-flex items-center gap-1">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          {formatNumber(comments)}
        </span>
      )}
    </div>
  );
}

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link href={`/news/${item.id}`} className="card hover-card group flex flex-col overflow-hidden fadeup">
      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt=""
          className="aspect-[16/9] w-full object-cover opacity-90 transition group-hover:opacity-100"
        />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <MarketBadge market={item.market} />
          <span className="text-xs text-muted">{timeAgo(item.published_at)}</span>
        </div>
        <h3 className="font-semibold leading-snug group-hover:text-accent transition">{item.title}</h3>
        <p className="line-clamp-2 text-sm text-muted">{item.summary}</p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-xs font-medium text-muted">{item.source}</span>
          <Meta comments={item.comments_count} />
        </div>
      </div>
    </Link>
  );
}

export function NewsRow({ item }: { item: NewsItem }) {
  return (
    <Link href={`/news/${item.id}`} className="group flex gap-3 border-b border-line py-3 last:border-0">
      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
      )}
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <MarketBadge market={item.market} />
          <span className="text-xs text-muted">{timeAgo(item.published_at)}</span>
        </div>
        <h4 className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-accent transition">{item.title}</h4>
      </div>
    </Link>
  );
}

export function AnalysisCard({ item }: { item: Analysis }) {
  return (
    <Link href={`/analysis/${item.id}`} className="card hover-card group flex flex-col gap-3 p-4 fadeup">
      <div className="flex flex-wrap items-center gap-2">
        <SentimentBadge sentiment={item.sentiment} />
        <MarketBadge market={item.market} />
        <span className="ml-auto text-xs text-muted">{timeAgo(item.created_at)}</span>
      </div>
      <h3 className="font-semibold leading-snug group-hover:text-accent transition">{item.title}</h3>
      <p className="line-clamp-2 text-sm text-muted">{item.body}</p>
      <div className="mt-1 flex items-center justify-between">
        {item.author && (
          <div className="flex items-center gap-2">
            <Avatar name={item.author.display_name} src={item.author.avatar_url} size={24} />
            <span className="text-xs font-medium">@{item.author.username}</span>
          </div>
        )}
        <Meta likes={item.likes_count} comments={item.comments_count} />
      </div>
    </Link>
  );
}

export function PostCard({ item }: { item: CommunityPost }) {
  return (
    <Link href={`/community/post/${item.id}`} className="card hover-card group flex items-start gap-4 p-4 fadeup">
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <MarketBadge market={item.market} />
          <span className="text-xs text-muted">{timeAgo(item.created_at)}</span>
        </div>
        <h3 className="font-semibold leading-snug group-hover:text-accent transition">{item.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{item.body}</p>
        <div className="mt-2.5 flex items-center justify-between">
          {item.author && (
            <div className="flex items-center gap-2">
              <Avatar name={item.author.display_name} src={item.author.avatar_url} size={22} />
              <span className="text-xs font-medium">@{item.author.username}</span>
            </div>
          )}
          <Meta likes={item.likes_count} comments={item.comments_count} />
        </div>
      </div>
    </Link>
  );
}
