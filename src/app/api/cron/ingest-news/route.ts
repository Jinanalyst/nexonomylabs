import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServiceSupabase } from "@/lib/supabase/server";
import { ingestNewsInto } from "@/lib/news/ingest";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

// Scheduled news refresh. vercel.json triggers this daily via Vercel Cron
// (which auto-authenticates with the x-vercel-cron header); an external
// scheduler can also call it with `Authorization: Bearer <CRON_SECRET>`.
// The admin "Fetch latest news" button calls the same underlying logic for
// on-demand refreshes.
//
// Uses the service-role client (not the cookie-bound one) because this
// route runs with no user session, so the `admin write news` RLS policy —
// which checks auth.uid() — can never pass otherwise.
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getServiceSupabase();
  if (!sb) {
    return NextResponse.json({
      inserted: 0,
      skipped: "Supabase not configured or SUPABASE_SERVICE_ROLE_KEY missing",
    });
  }
  // No isNewsApiConfigured() gate here: the RSS sources in ingestNewsInto
  // need no key and should still run even when FINNHUB_API_KEY is unset.

  try {
    const inserted = await ingestNewsInto(sb);
    if (inserted > 0) {
      revalidatePath("/news");
      revalidatePath("/admin");
      revalidatePath("/");
    }
    return NextResponse.json({ inserted });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ingestion failed" },
      { status: 500 },
    );
  }
}
