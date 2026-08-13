import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { isNewsApiConfigured } from "@/lib/news/finnhub";
import { ingestNewsInto } from "@/lib/news/ingest";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

// Scheduled news refresh. vercel.json triggers this hourly via Vercel Cron
// (which auto-authenticates with the x-vercel-cron header); an external
// scheduler can also call it with `Authorization: Bearer <CRON_SECRET>`.
// The admin "Fetch latest news" button calls the same underlying logic for
// on-demand refreshes.
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = await getServerSupabase();
  if (!sb) {
    return NextResponse.json({ inserted: 0, skipped: "Supabase not configured" });
  }
  if (!isNewsApiConfigured()) {
    return NextResponse.json({ inserted: 0, skipped: "FINNHUB_API_KEY not set" });
  }

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
