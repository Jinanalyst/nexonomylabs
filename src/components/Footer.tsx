import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-accent to-teal text-white">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l5-6 4 4 5-8" /><path d="M17 7h4v4" /></svg>
              </span>
              <span className="font-semibold tracking-tight">Nexonomy Labs</span>
            </div>
            <p className="mt-3 text-sm text-muted">
              Where individual investors become verified experts. Read the news,
              publish your thesis, and debate the markets with a serious community.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterCol title="Explore" links={[["News", "/news"], ["Analysis", "/analysis"], ["Community", "/community"], ["Feed", "/feed"]]} />
            <FooterCol title="Markets" links={[["US Stocks", "/markets/us-stocks"], ["Korea", "/markets/korea-stocks"], ["Macro", "/markets/macro"], ["Crypto", "/markets/crypto"]]} />
            <FooterCol title="Account" links={[["Log in", "/login"], ["Sign up", "/signup"], ["Search", "/search"]]} />
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Nexonomy Labs. Educational content only — not investment advice.</p>
          <p>Advancing the digital frontier.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">{title}</h4>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-muted hover:text-fg transition">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
