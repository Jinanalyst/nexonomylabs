import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

// Handles the redirect back from Google (and any other OAuth provider) after
// the user approves sign-in, exchanging the auth code for a session cookie.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await getServerSupabase();
    if (supabase) await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
