import { NextResponse } from "next/server";
import { getUnprocessedNewsItems } from "@/lib/services/news-items.service";

export async function GET() {
  try {
    const items = await getUnprocessedNewsItems();

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error("Failed to fetch news items:", error);
    return NextResponse.json(
      { error: "Ophalen van nieuwsitems mislukt" },
      { status: 500 }
    );
  }
}
