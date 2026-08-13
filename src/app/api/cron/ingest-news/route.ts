import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { isNewsApiConfigured } from "@/lib/news/finnhub";
import { ingestNewsInto } from "@/lib/news/ingest";

// Scheduled news refresh. Point a cron trigger (Vercel Cron, GitHub Actions,
// any external scheduler) at this URL to keep news current automatically —
// the admin "Fetch latest news" button calls the same underlying logic for
// on-demand refreshes. Protected by CRON_SECRET so it can't be triggered by
// anyone who finds the URL.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
