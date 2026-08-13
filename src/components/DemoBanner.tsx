export default function DemoBanner() {
  return (
    <div className="border-b border-neutral/30 bg-neutral/10">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-1.5 text-xs text-neutral">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
        <span>
          <strong className="font-semibold">Demo mode</strong> — browsing live seed data.
          Connect Supabase (see README) to enable sign-in, comments, follows and posting.
        </span>
      </div>
    </div>
  );
}
