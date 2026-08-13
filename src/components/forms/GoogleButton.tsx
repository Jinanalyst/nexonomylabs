"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";

export default function GoogleButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setPending(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setPending(false);
    }
    // On success the browser navigates to Google — nothing further to do here.
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-line bg-surface py-2.5 text-sm font-semibold transition hover:border-accent/50 disabled:opacity-50"
      >
        <svg width="17" height="17" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.66z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.09A12 12 0 0 0 12 24z"/>
          <path fill="#FBBC05" d="M5.31 14.32A7.2 7.2 0 0 1 4.93 12c0-.8.14-1.58.38-2.32V6.59H1.3A12 12 0 0 0 0 12c0 1.94.46 3.77 1.3 5.41z"/>
          <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.3 6.59l4.01 3.09C6.25 6.85 8.89 4.75 12 4.75z"/>
        </svg>
        {pending ? "Redirecting…" : "Continue with Google"}
      </button>
      {error && <p className="mt-1.5 text-xs text-bear">{error}</p>}
    </div>
  );
}
