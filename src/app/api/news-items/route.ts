import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsItems } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const items = await db
      .select()
      .from(newsItems)
      .orderBy(desc(newsItems.createdAt));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to fetch news items:", error);
    return NextResponse.json(
      { error: "Ophalen van nieuwsitems mislukt" },
      { status: 500 }
    );
  }
}
