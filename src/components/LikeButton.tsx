"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleLike } from "@/app/actions";
import { cn, formatNumber } from "@/lib/utils";

export default function LikeButton({
  targetType,
  targetId,
  initialCount,
  initialLiked = false,
  configured,
  signedIn,
  size = "md",
}: {
  targetType: "analysis" | "community" | "comment";
  targetId: string;
  initialCount: number;
  initialLiked?: boolean;
  configured: boolean;
  signedIn: boolean;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, start] = useTransition();

  function onClick() {
    if (configured && !signedIn) {
      router.push("/login");
      return;
    }
    // Optimistic toggle (works in demo mode and when connected).
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    if (configured) {
      start(async () => {
        const res = await toggleLike(targetType, targetId);
        if (res.error) {
          // revert
          setLiked(!next);
          setCount((c) => c + (next ? -1 : 1));
        }
      });
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border transition",
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
        liked
          ? "border-bull/40 text-bull bg-bull/10"
          : "border-line text-muted hover:text-fg hover:border-accent/40",
      )}
    >
      <svg width={size === "sm" ? 13 : 15} height={size === "sm" ? 13 : 15} viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-6 0v4H5l-2 9h14l2-9z" /></svg>
      <span className="tnum font-medium">{formatNumber(count)}</span>
    </button>
  );
}
