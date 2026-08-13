import Link from "next/link";
import { MARKET_LABELS, MarketCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 py-8", className)}>{children}</div>
  );
}

export function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionHeader({
  title,
  href,
  linkLabel = "View all",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {href && (
        <Link href={href} className="text-sm font-medium text-accent hover:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

const FILTER_MARKETS: MarketCategory[] = [
  "us-stocks",
  "korea-stocks",
  "macro",
  "bonds",
  "fx",
  "commodities",
  "crypto",
  "general",
];

export function MarketFilter({
  basePath,
  active,
}: {
  basePath: string;
  active?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <FilterChip href={basePath} label="All" isActive={!active} />
      {FILTER_MARKETS.map((m) => (
        <FilterChip
          key={m}
          href={`${basePath}?market=${m}`}
          label={MARKET_LABELS[m]}
          isActive={active === m}
        />
      ))}
    </div>
  );
}

function FilterChip({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
        isActive
          ? "border-accent bg-accent text-white"
          : "border-line text-muted hover:text-fg hover:border-accent/40",
      )}
    >
      {label}
    </Link>
  );
}

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="card grid place-items-center gap-1 px-6 py-16 text-center">
      <div className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-panel text-muted">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3h18v18H3z" opacity=".2" /><path d="M8 12h8M12 8v8" /></svg>
      </div>
      <p className="font-medium">{title}</p>
      {hint && <p className="text-sm text-muted">{hint}</p>}
    </div>
  );
}
