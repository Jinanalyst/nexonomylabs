import { redirect } from "next/navigation";
import { Container, PageHeading } from "@/components/ui/Layout";
import { AnalysisForm } from "@/components/forms/ContentForms";
import { getNews } from "@/lib/data/queries";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function NewAnalysisPage() {
  const configured = isSupabaseConfigured();
  const viewer = await getCurrentProfile();
  // When connected, require sign-in to reach the editor.
  if (configured && !viewer) redirect("/login");

  const news = await getNews({ limit: 30 });

  return (
    <Container className="max-w-3xl">
      <PageHeading
        title="Write an analysis"
        subtitle="Make it falsifiable — state your view, your reasoning, and what would change your mind."
      />
      <div className="card p-6">
        <AnalysisForm configured={configured} news={news} />
      </div>
    </Container>
  );
}
