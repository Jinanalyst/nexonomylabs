import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Layout";
import AuthForm from "@/components/forms/AuthForm";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function LoginPage() {
  const viewer = await getCurrentProfile();
  if (viewer) redirect("/");
  return (
    <Container className="py-16">
      <AuthForm mode="login" configured={isSupabaseConfigured()} />
    </Container>
  );
}
