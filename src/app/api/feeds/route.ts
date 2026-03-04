import { NextResponse } from "next/server";
import { getAllFeeds, createFeed } from "@/lib/services/feed-management.service";
import { createFeedInputSchema } from "@/lib/types/feed.types";

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

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = createFeedInputSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Ongeldige invoer";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const feed = await createFeed(parsed.data);
    return NextResponse.json({ feed }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_URL") {
      return NextResponse.json(
        { error: "Deze URL bestaat al" },
        { status: 409 }
      );
    }
    console.error("Failed to create feed:", error);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
}
