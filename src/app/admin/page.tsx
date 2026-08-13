import { redirect } from "next/navigation";
import { Container, PageHeading } from "@/components/ui/Layout";
import AdminDashboard from "@/components/admin/AdminDashboard";
import {
  getAllProfiles,
  getCommunityPosts,
  getNews,
  getRecentComments,
} from "@/lib/data/queries";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminPage() {
  const configured = isSupabaseConfigured();
  const viewer = await getCurrentProfile();

  // When connected, only admins may enter. In demo mode, show a read-only preview.
  if (configured && viewer?.role !== "admin") redirect("/");

  const [news, posts, comments, users] = await Promise.all([
    getNews({ limit: 50 }),
    getCommunityPosts({ limit: 50 }),
    getRecentComments(40),
    getAllProfiles(),
  ]);

  return (
    <Container>
      <PageHeading
        title="Admin"
        subtitle={configured ? "Manage news, posts, comments and members." : "Demo preview — connect Supabase and sign in as an admin to enable actions."}
      />
      <AdminDashboard
        configured={configured}
        news={news}
        posts={posts}
        comments={comments}
        users={users}
      />
    </Container>
  );
}
