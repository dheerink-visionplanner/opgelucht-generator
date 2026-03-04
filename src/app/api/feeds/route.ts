import { NextResponse } from "next/server";
import { getAllFeeds } from "@/lib/services/feed-management.service";

export async function GET() {
  try {
    const feedList = await getAllFeeds();
    return NextResponse.json({ feeds: feedList });
  } catch (error) {
    console.error("Failed to retrieve feeds:", error);
    return NextResponse.json(
      { error: "Failed to retrieve feeds" },
      { status: 500 }
    );
  }
}
