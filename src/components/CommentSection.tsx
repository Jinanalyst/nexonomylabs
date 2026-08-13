"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Comment, CommentParentType, Profile } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { addComment } from "@/app/actions";
import Avatar from "@/components/ui/Avatar";
import LikeButton from "@/components/LikeButton";

interface Props {
  parentType: CommentParentType;
  parentId: string;
  initial: Comment[];
  configured: boolean;
  viewer: Profile | null;
}

function countAll(list: Comment[]): number {
  return list.reduce((n, c) => n + 1 + countAll(c.replies ?? []), 0);
}

export default function CommentSection({
  parentType,
  parentId,
  initial,
  configured,
  viewer,
}: Props) {
  const [comments, setComments] = useState<Comment[]>(initial);
  const signedIn = !!viewer;
  const total = countAll(comments);

  // Demo author used when Supabase isn't connected.
  const demoAuthor: Profile = viewer ?? {
    id: "you",
    username: "you",
    display_name: "You",
    avatar_url: null,
    bio: null,
    role: "user",
    created_at: new Date().toISOString(),
  };

  function addLocal(body: string, replyTo: string | null) {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      parent_type: parentType,
      parent_id: parentId,
      author_id: demoAuthor.id,
      body,
      reply_to: replyTo,
      created_at: new Date().toISOString(),
      author: demoAuthor,
      likes_count: 0,
      replies: [],
    };
    setComments((prev) => {
      if (!replyTo) return [...prev, newComment];
      return prev.map((c) =>
        c.id === replyTo ? { ...c, replies: [...(c.replies ?? []), newComment] } : c,
      );
    });
  }

  return (
    <section id="comments" className="mt-8">
      <h2 className="mb-4 text-lg font-semibold">
        Discussion <span className="text-muted">({total})</span>
      </h2>

      <Composer
        configured={configured}
        signedIn={signedIn}
        onSubmit={async (body) => {
          if (configured && signedIn) {
            const res = await addComment(parentType, parentId, body, null);
            return res.error ?? null;
          }
          addLocal(body, null);
          return null;
        }}
      />

      <div className="mt-6 space-y-5">
        {comments.length === 0 ? (
          <p className="text-sm text-muted">No comments yet. Start the discussion.</p>
        ) : (
          comments.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              configured={configured}
              signedIn={signedIn}
              onReply={async (body) => {
                if (configured && signedIn) {
                  const res = await addComment(parentType, parentId, body, c.id);
                  return res.error ?? null;
                }
                addLocal(body, c.id);
                return null;
              }}
            />
          ))
        )}
      </div>
    </section>
  );
}

function CommentNode({
  comment,
  configured,
  signedIn,
  onReply,
}: {
  comment: Comment;
  configured: boolean;
  signedIn: boolean;
  onReply: (body: string) => Promise<string | null>;
}) {
  const [replying, setReplying] = useState(false);
  const author = comment.author;
  return (
    <div className="flex gap-3">
      <Link href={author ? `/profile/${author.username}` : "#"}>
        <Avatar name={author?.display_name ?? "User"} src={author?.avatar_url} size={34} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="rounded-xl border border-line bg-surface px-3.5 py-2.5">
          <div className="mb-1 flex items-center gap-2 text-xs">
            <Link href={author ? `/profile/${author.username}` : "#"} className="font-semibold hover:text-accent">
              @{author?.username ?? "user"}
            </Link>
            <span className="text-muted">· {timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.body}</p>
        </div>
        <div className="mt-1.5 flex items-center gap-3 pl-1">
          <LikeButton
            targetType="comment"
            targetId={comment.id}
            initialCount={comment.likes_count ?? 0}
            configured={configured}
            signedIn={signedIn}
            size="sm"
          />
          <button
            onClick={() => setReplying((v) => !v)}
            className="text-xs font-medium text-muted hover:text-fg"
          >
            Reply
          </button>
        </div>

        {replying && (
          <div className="mt-3">
            <Composer
              configured={configured}
              signedIn={signedIn}
              small
              onSubmit={async (body) => {
                const err = await onReply(body);
                if (!err) setReplying(false);
                return err;
              }}
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l border-line pl-4">
            {comment.replies.map((r) => (
              <CommentNode
                key={r.id}
                comment={r}
                configured={configured}
                signedIn={signedIn}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Composer({
  configured,
  signedIn,
  onSubmit,
  small,
}: {
  configured: boolean;
  signedIn: boolean;
  onSubmit: (body: string) => Promise<string | null>;
  small?: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (configured && !signedIn) {
    return (
      <div className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
        <button onClick={() => router.push("/login")} className="font-semibold text-accent hover:underline">
          Log in
        </button>{" "}
        to join the discussion.
      </div>
    );
  }

  function submit() {
    if (!body.trim()) return;
    start(async () => {
      const err = await onSubmit(body.trim());
      if (err) setError(err);
      else {
        setBody("");
        setError(null);
        if (configured) router.refresh();
      }
    });
  }

  return (
    <div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={small ? 2 : 3}
        placeholder="Share your view…"
        className="w-full resize-none rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent/60"
      />
      {error && <p className="mt-1 text-xs text-bear">{error}</p>}
      <div className="mt-2 flex items-center justify-between">
        {!configured && (
          <span className="text-xs text-muted">Demo — visible until you reload.</span>
        )}
        <button
          onClick={submit}
          disabled={pending || !body.trim()}
          className="ml-auto rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Posting…" : "Comment"}
        </button>
      </div>
    </div>
  );
}
