"use client";

import { useActionState } from "react";
import { createAnalysis, createPost } from "@/app/actions";
import {
  MARKET_LABELS,
  MarketCategory,
  NewsItem,
  SENTIMENT_LABELS,
  Sentiment,
} from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent/60";

const MARKET_OPTS = Object.entries(MARKET_LABELS) as [MarketCategory, string][];

export function AnalysisForm({
  configured,
  news,
  defaultMarket = "general",
}: {
  configured: boolean;
  news: NewsItem[];
  defaultMarket?: MarketCategory;
}) {
  const [state, formAction, pending] = useActionState(createAnalysis, {});
  const sentiments = Object.entries(SENTIMENT_LABELS) as [Sentiment, string][];

  return (
    <form action={formAction} className="space-y-4">
      {!configured && <DemoNote />}
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Title</label>
        <input name="title" required placeholder="Your thesis in one line" className={inputCls} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Market</label>
          <select name="market" defaultValue={defaultMarket} className={inputCls}>
            {MARKET_OPTS.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Stance</label>
          <select name="sentiment" defaultValue="neutral" className={inputCls}>
            {sentiments.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Related news (optional)</label>
        <select name="related_news_id" defaultValue="" className={inputCls}>
          <option value="">— None —</option>
          {news.map((n) => (
            <option key={n.id} value={n.id}>{n.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Analysis</label>
        <textarea name="body" required rows={12} placeholder="Lay out your argument. What's your view, why, and what would prove you wrong?" className={`${inputCls} resize-y`} />
      </div>

      {state?.error && <p className="text-sm text-bear">{state.error}</p>}
      <button type="submit" disabled={pending} className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
        {pending ? "Publishing…" : "Publish analysis"}
      </button>
    </form>
  );
}

export function PostForm({
  configured,
  defaultMarket = "general",
}: {
  configured: boolean;
  defaultMarket?: MarketCategory;
}) {
  const [state, formAction, pending] = useActionState(createPost, {});
  return (
    <form action={formAction} className="space-y-4">
      {!configured && <DemoNote />}
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Title</label>
        <input name="title" required placeholder="What do you want to discuss?" className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Category</label>
        <select name="market" defaultValue={defaultMarket} className={inputCls}>
          {MARKET_OPTS.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Body</label>
        <textarea name="body" required rows={8} placeholder="Add context, a question, or your take…" className={`${inputCls} resize-y`} />
      </div>
      {state?.error && <p className="text-sm text-bear">{state.error}</p>}
      <button type="submit" disabled={pending} className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
        {pending ? "Posting…" : "Create post"}
      </button>
    </form>
  );
}

function DemoNote() {
  return (
    <div className="rounded-lg border border-neutral/30 bg-neutral/10 px-3 py-2 text-xs text-neutral">
      Demo mode: connect Supabase to save posts. The form is fully wired and will
      work once credentials are added.
    </div>
  );
}
