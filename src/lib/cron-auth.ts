// Shared cron-request auth, matching the pattern used across other
// Nexonomy/ChainLabs projects: accept either Vercel's own `x-vercel-cron`
// header (automatically sent on requests Vercel's scheduler makes, so it
// can't be spoofed by outside callers) or a manually configured
// CRON_SECRET bearer token (for external schedulers — GitHub Actions,
// cron-job.org, etc).

const AUTH_SCHEME = "Bearer";

function getCronSecret(): string {
  return process.env.CRON_SECRET?.trim() ?? "";
}

function getBearerToken(authHeader: string | null): string {
  if (!authHeader) return "";
  const [scheme, ...tokenParts] = authHeader.trim().split(/\s+/);
  if (scheme.toLowerCase() !== AUTH_SCHEME.toLowerCase()) return "";
  return tokenParts.join(" ").trim();
}

export function isAuthorizedCronRequest(headers: Headers): boolean {
  if (headers.has("x-vercel-cron")) return true;

  const expectedSecret = getCronSecret();
  if (!expectedSecret) return false;

  return getBearerToken(headers.get("authorization")) === expectedSecret;
}
