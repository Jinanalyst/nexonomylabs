import { redirect } from "next/navigation";
import { Container, PageHeading } from "@/components/ui/Layout";
import { PostForm } from "@/components/forms/ContentForms";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function NewPostPage() {
  const configured = isSupabaseConfigured();
  const viewer = await getCurrentProfile();
  if (configured && !viewer) redirect("/login");

  return (
    <Container className="max-w-2xl">
      <PageHeading title="New post" subtitle="Pick a board and start a discussion." />
      <div className="card p-6">
        <PostForm configured={configured} />
      </div>
    </Container>
  );
}
