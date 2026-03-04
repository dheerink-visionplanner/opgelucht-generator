import { NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/services/rss-parser.service";

export async function POST() {
  try {
    const results = await fetchAllFeeds();

    const totalNew = results.reduce((sum, r) => sum + r.items.length, 0);
    const errors = results.filter((r) => r.error);

    return NextResponse.json({
      success: true,
      totalNewItems: totalNew,
      feedResults: results.map((r) => ({
        feedId: r.feedId,
        feedLabel: r.feedLabel,
        itemCount: r.items.length,
        error: r.error,
      })),
      errors: errors.length,
    });
  } catch (error) {
    console.error("Feed fetch failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}
