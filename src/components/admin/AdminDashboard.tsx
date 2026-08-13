"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreateNews,
  adminDeleteComment,
  adminDeleteNews,
  adminDeletePost,
} from "@/app/actions";
import {
  Comment,
  CommunityPost,
  MARKET_LABELS,
  MarketCategory,
  NewsItem,
  Profile,
} from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/utils";
import { MarketBadge } from "@/components/ui/Badges";
import Avatar from "@/components/ui/Avatar";

const TABS = ["News", "Posts", "Comments", "Users"] as const;
type Tab = (typeof TABS)[number];

const inputCls =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent/60";
const MARKET_OPTS = Object.entries(MARKET_LABELS) as [MarketCategory, string][];

export default function AdminDashboard({
  configured,
  news,
  posts,
  comments,
  users,
}: {
  configured: boolean;
  news: NewsItem[];
  posts: CommunityPost[];
  comments: Comment[];
  users: Profile[];
}) {
  const [tab, setTab] = useState<Tab>("News");
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t ? "bg-accent text-white" : "border border-line text-muted hover:text-fg"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "News" && <NewsAdmin configured={configured} news={news} />}
      {tab === "Posts" && <PostsAdmin configured={configured} posts={posts} />}
      {tab === "Comments" && <CommentsAdmin configured={configured} comments={comments} />}
      {tab === "Users" && <UsersAdmin users={users} />}
    </div>
  );
}

function NewsAdmin({ configured, news }: { configured: boolean; news: NewsItem[] }) {
  const [state, formAction, pending] = useActionState(adminCreateNews, {});
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="card p-5">
        <h3 className="mb-4 font-semibold">Publish news</h3>
        <form action={formAction} className="space-y-3">
          <input name="title" required placeholder="Headline" className={inputCls} />
          <textarea name="summary" required rows={2} placeholder="Summary" className={inputCls} />
          <textarea name="content" rows={3} placeholder="Full content (optional)" className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <input name="source" placeholder="Source (e.g. Reuters)" className={inputCls} />
            <select name="market" defaultValue="us-stocks" className={inputCls}>
              {MARKET_OPTS.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <input name="source_url" placeholder="Original link (https://…)" className={inputCls} />
          <input name="image_url" placeholder="Image URL (optional)" className={inputCls} />
          {state?.error && <p className="text-sm text-bear">{state.error}</p>}
          {state?.ok && <p className="text-sm text-bull">Published.</p>}
          <button disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {pending ? "Publishing…" : "Publish"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">All news ({news.length})</h3>
        <div className="space-y-2">
          {news.map((n) => (
            <Row
              key={n.id}
              configured={configured}
              onDelete={() => adminDeleteNews(n.id)}
              href={`/news/${n.id}`}
              badge={<MarketBadge market={n.market} />}
              title={n.title}
              meta={`${n.source} · ${formatDate(n.published_at)}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PostsAdmin({ configured, posts }: { configured: boolean; posts: CommunityPost[] }) {
  return (
    <div>
      <h3 className="mb-3 font-semibold">Community posts ({posts.length})</h3>
      <div className="space-y-2">
        {posts.map((p) => (
          <Row
            key={p.id}
            configured={configured}
            onDelete={() => adminDeletePost(p.id)}
            href={`/community/post/${p.id}`}
            badge={<MarketBadge market={p.market} />}
            title={p.title}
            meta={`@${p.author?.username ?? "user"} · ${timeAgo(p.created_at)}`}
          />
        ))}
      </div>
    </div>
  );
}

function CommentsAdmin({ configured, comments }: { configured: boolean; comments: Comment[] }) {
  return (
    <div>
      <h3 className="mb-3 font-semibold">Recent comments ({comments.length})</h3>
      <div className="space-y-2">
        {comments.map((c) => (
          <Row
            key={c.id}
            configured={configured}
            onDelete={() => adminDeleteComment(c.id)}
            badge={<span className="rounded bg-panel px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted">{c.parent_type}</span>}
            title={c.body}
            meta={`@${c.author?.username ?? "user"} · ${timeAgo(c.created_at)}`}
          />
        ))}
      </div>
    </div>
  );
}

function UsersAdmin({ users }: { users: Profile[] }) {
  return (
    <div>
      <h3 className="mb-3 font-semibold">Members ({users.length})</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {users.map((u) => (
          <Link key={u.id} href={`/profile/${u.username}`} className="card hover-card flex items-center gap-3 p-3">
            <Avatar name={u.display_name} src={u.avatar_url} size={36} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{u.display_name}</span>
              <span className="block truncate text-xs text-muted">@{u.username}</span>
            </span>
            {u.role === "admin" && <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent">Admin</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Row({
  configured,
  onDelete,
  href,
  badge,
  title,
  meta,
}: {
  configured: boolean;
  onDelete: () => Promise<{ error?: string; ok?: boolean }>;
  href?: string;
  badge: React.ReactNode;
  title: string;
  meta: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [gone, setGone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (gone) return null;

  function del() {
    start(async () => {
      const res = await onDelete();
      if (res.error) setErr(res.error);
      else {
        setGone(true);
        if (configured) router.refresh();
      }
    });
  }

  return (
    <div className="card flex items-center gap-3 p-3">
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">{badge}<span className="text-xs text-muted">{meta}</span></div>
        {href ? (
          <Link href={href} className="line-clamp-1 text-sm font-medium hover:text-accent">{title}</Link>
        ) : (
          <p className="line-clamp-1 text-sm font-medium">{title}</p>
        )}
        {err && <p className="text-xs text-bear">{err}</p>}
      </div>
      <button onClick={del} disabled={pending} className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-bear hover:border-bear/40 disabled:opacity-50">
        {pending ? "…" : "Delete"}
      </button>
    </div>
  );
}
