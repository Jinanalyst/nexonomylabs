import Link from "next/link";
import { Container, PageHeading, SectionHeader, EmptyState } from "@/components/ui/Layout";
import { AnalysisCard, PostCard } from "@/components/Cards";
import { getFeed } from "@/lib/data/queries";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function FeedPage() {
  const configured = isSupabaseConfigured();
  const viewer = await getCurrentProfile();

  if (configured && !viewer) {
    return (
      <Container className="max-w-xl">
        <PageHeading title="Your Feed" />
        <div className="card p-8 text-center">
          <p className="text-muted">Log in to see the latest from experts you follow.</p>
          <Link href="/login" className="mt-4 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white">Log in</Link>
        </div>
      </Container>
    );
  }

  const { analyses, posts } = await getFeed(viewer?.id ?? "demo");

  return (
    <Container>
      <PageHeading
        title="Your Feed"
        subtitle={configured ? "Latest analysis and posts from people you follow." : "Demo feed — showing the community's latest. Connect Supabase to personalize by who you follow."}
      />
      {analyses.length === 0 && posts.length === 0 ? (
        <EmptyState title="Your feed is empty" hint="Follow a few experts to populate your feed." />
      ) : (
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader title="Analysis" />
            <div className="space-y-3">
              {analyses.map((a) => (
                <AnalysisCard key={a.id} item={a} />
              ))}
            </div>
          </div>
          <div>
            <SectionHeader title="Discussions" />
            <div className="space-y-3">
              {posts.map((p) => (
                <PostCard key={p.id} item={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
