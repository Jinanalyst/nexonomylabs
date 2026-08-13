"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp } from "@/app/actions";
import GoogleButton from "@/components/forms/GoogleButton";

const inputCls =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent/60";

export default function AuthForm({
  mode,
  configured,
}: {
  mode: "login" | "signup";
  configured: boolean;
}) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card p-7">
        <h1 className="text-xl font-semibold">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "login"
            ? "Log in to comment, publish analysis and follow experts."
            : "Join Nexonomy Labs — become a verified voice in the markets."}
        </p>

        {!configured && (
          <div className="mt-4 rounded-lg border border-neutral/30 bg-neutral/10 px-3 py-2 text-xs text-neutral">
            Demo mode: authentication is disabled until Supabase is connected. The
            form is fully wired and will work the moment you add credentials.
          </div>
        )}

        {configured && (
          <div className="mt-5">
            <GoogleButton />
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="text-xs text-muted">or</span>
              <div className="h-px flex-1 bg-line" />
            </div>
          </div>
        )}

        <form action={formAction} className={configured ? "space-y-3" : "mt-5 space-y-3"}>
          {mode === "signup" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Username</label>
                <input name="username" required placeholder="macro_maya" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Display name</label>
                <input name="display_name" placeholder="Maya Chen" className={inputCls} />
              </div>
            </>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Email</label>
            <input name="email" type="email" required placeholder="you@example.com" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Password</label>
            <input name="password" type="password" required minLength={6} placeholder="••••••••" className={inputCls} />
          </div>

          {state?.error && <p className="text-sm text-bear">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          {mode === "login" ? (
            <>Don&apos;t have an account? <Link href="/signup" className="font-semibold text-accent hover:underline">Sign up</Link></>
          ) : (
            <>Already a member? <Link href="/login" className="font-semibold text-accent hover:underline">Log in</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
