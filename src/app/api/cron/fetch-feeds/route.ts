import { NextRequest, NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/services/rss-parser.service";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const results = await fetchAllFeeds();

    const totalParsed = results.reduce((s, r) => s + r.itemsParsed, 0);
    const totalNew = results.reduce((s, r) => s + r.itemsNew, 0);
    const totalDuplicates = results.reduce(
      (s, r) => s + r.itemsSkippedDuplicate,
      0,
    );
    const feedErrors = results.filter((r) => r.feedError);

    console.log(
      `[Cron] Feed fetch completed: ${totalNew} new items, ${totalDuplicates} duplicates, ${feedErrors.length} errors`,
    );

    return NextResponse.json({
      success: true,
      summary: {
        totalParsed,
        totalNew,
        totalDuplicates,
        feedsWithErrors: feedErrors.length,
      },
      feedResults: results.map((r) => ({
        feedId: r.feedId,
        feedLabel: r.feedLabel,
        itemsParsed: r.itemsParsed,
        itemsNew: r.itemsNew,
        itemsSkippedDuplicate: r.itemsSkippedDuplicate,
        error: r.feedError,
      })),
    });
  } catch (error) {
    console.error("[Cron] Feed fetch failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feeds" },
      { status: 500 },
    );
  }
}
