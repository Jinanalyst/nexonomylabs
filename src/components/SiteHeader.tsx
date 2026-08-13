"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import ThemeToggle from "@/components/ThemeToggle";
import { signOut } from "@/app/actions";

const NAV = [
  { href: "/news", label: "News" },
  { href: "/analysis", label: "Analysis" },
  { href: "/community", label: "Community" },
  { href: "/markets/us-stocks", label: "Markets", match: "/markets" },
  { href: "/feed", label: "Feed" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-teal text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l5-6 4 4 5-8" /><path d="M17 7h4v4" /></svg>
      </span>
      <span className="font-semibold tracking-tight text-[15px]">
        Nexonomy<span className="text-muted"> Labs</span>
      </span>
    </Link>
  );
}

export default function SiteHeader({
  profile,
}: {
  profile: Profile | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  const active = (href: string, match?: string) =>
    pathname === href || (match ? pathname.startsWith(match) : false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Logo />

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition",
                active(n.href, n.match)
                  ? "text-fg bg-panel"
                  : "text-muted hover:text-fg hover:bg-panel/60",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden sm:block">
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 w-44 lg:w-60 focus-within:border-accent/60 transition">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search markets, users…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:ml-2">
          <ThemeToggle />

          {profile ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-line py-1 pl-1 pr-2 hover:border-accent/50 transition"
              >
                <Avatar name={profile.display_name} src={profile.avatar_url} size={28} />
                <span className="hidden text-sm font-medium lg:block">
                  {profile.username}
                </span>
              </button>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                  <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
                    <Link href={`/profile/${profile.username}`} className="block px-4 py-2.5 text-sm hover:bg-panel" onClick={() => setUserMenu(false)}>My profile</Link>
                    <Link href="/analysis/new" className="block px-4 py-2.5 text-sm hover:bg-panel" onClick={() => setUserMenu(false)}>Write analysis</Link>
                    {profile.role === "admin" && (
                      <Link href="/admin" className="block px-4 py-2.5 text-sm hover:bg-panel" onClick={() => setUserMenu(false)}>Admin</Link>
                    )}
                    <form action={signOut} className="border-t border-line">
                      <button className="block w-full px-4 py-2.5 text-left text-sm text-bear hover:bg-panel">Sign out</button>
                    </form>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:text-fg sm:block">Log in</Link>
              <Link href="/signup" className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 transition">Sign up</Link>
            </div>
          )}

          <button
            onClick={() => setMenu((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted md:hidden"
            aria-label="Menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>
      </div>

      {menu && (
        <div className="border-t border-line bg-surface md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-2">
            <form onSubmit={submitSearch} className="mb-2 flex items-center gap-2 rounded-lg border border-line bg-bg px-2.5 py-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full bg-transparent text-sm outline-none" />
            </form>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setMenu(false)} className="block rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-panel hover:text-fg">{n.label}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
