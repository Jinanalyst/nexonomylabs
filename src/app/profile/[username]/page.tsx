import { notFound } from "next/navigation";
import { Container, SectionHeader, EmptyState } from "@/components/ui/Layout";
import { AnalysisCard, PostCard } from "@/components/Cards";
import Avatar from "@/components/ui/Avatar";
import FollowButton from "@/components/FollowButton";
import {
  getAnalyses,
  getCommunityPosts,
  getFollowState,
  getProfileByUsername,
} from "@/lib/data/queries";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate, formatNumber } from "@/lib/utils";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const [analyses, posts, follow, viewer] = await Promise.all([
    getAnalyses({ authorId: profile.id }),
    getCommunityPosts({ authorId: profile.id }),
    getFollowState(profile.id),
    getCurrentProfile(),
  ]);
  const configured = isSupabaseConfigured();
  const isSelf = viewer?.id === profile.id;

  return (
    <Container className="max-w-5xl">
      <div className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-accent/25 via-teal/20 to-transparent" />
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="-mt-14 rounded-full border-4 border-surface">
              <Avatar name={profile.display_name} src={profile.avatar_url} size={80} />
            </div>
            <div>
              <h1 className="text-xl font-bold">{profile.display_name}</h1>
              <p className="text-sm text-muted">@{profile.username}</p>
              {profile.role === "admin" && (
                <span className="mt-1 inline-block rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent">Admin</span>
              )}
            </div>
          </div>
          <FollowButton
            profileId={profile.id}
            initialFollowing={follow.isFollowing}
            configured={configured}
            signedIn={!!viewer}
            isSelf={isSelf}
          />
        </div>
        <div className="flex flex-wrap gap-6 border-t border-line px-6 py-4 text-sm">
          {profile.bio && <p className="w-full text-muted">{profile.bio}</p>}
          <Stat label="Followers" value={follow.followers} />
          <Stat label="Following" value={follow.following} />
          <Stat label="Analysis" value={analyses.length} />
          <Stat label="Posts" value={posts.length} />
          <span className="text-muted">Joined {formatDate(profile.created_at)}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeader title={`Analysis (${analyses.length})`} />
          {analyses.length === 0 ? (
            <EmptyState title="No analysis yet" />
          ) : (
            <div className="space-y-3">
              {analyses.map((a) => (
                <AnalysisCard key={a.id} item={a} />
              ))}
            </div>
          )}
        </div>
        <div>
          <SectionHeader title={`Community posts (${posts.length})`} />
          {posts.length === 0 ? (
            <EmptyState title="No posts yet" />
          ) : (
            <div className="space-y-3">
              {posts.map((p) => (
                <PostCard key={p.id} item={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="tnum font-semibold">{formatNumber(value)}</span>
      <span className="text-muted">{label}</span>
    </span>
  );
}
