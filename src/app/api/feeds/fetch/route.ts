import { NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/services/rss-parser.service";

export async function POST() {
  try {
    const results = await fetchAllFeeds();

    const totalParsed = results.reduce((s, r) => s + r.itemsParsed, 0);
    const totalNew = results.reduce((s, r) => s + r.itemsNew, 0);
    const totalDuplicates = results.reduce(
      (s, r) => s + r.itemsSkippedDuplicate,
      0,
    );
    const feedErrors = results.filter((r) => r.feedError);

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
    console.error("Feed fetch failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}
