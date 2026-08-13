"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleFollow } from "@/app/actions";
import { cn } from "@/lib/utils";

export default function FollowButton({
  profileId,
  initialFollowing,
  configured,
  signedIn,
  isSelf,
}: {
  profileId: string;
  initialFollowing: boolean;
  configured: boolean;
  signedIn: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, start] = useTransition();

  if (isSelf) {
    return (
      <span className="rounded-lg border border-line px-4 py-1.5 text-sm text-muted">
        Your profile
      </span>
    );
  }

  function onClick() {
    if (configured && !signedIn) {
      router.push("/login");
      return;
    }
    const next = !following;
    setFollowing(next);
    if (configured) {
      start(async () => {
        const res = await toggleFollow(profileId);
        if (res.error) setFollowing(!next);
      });
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={cn(
        "rounded-lg px-4 py-1.5 text-sm font-semibold transition",
        following
          ? "border border-line text-muted hover:border-bear/40 hover:text-bear"
          : "bg-accent text-white hover:opacity-90",
      )}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
