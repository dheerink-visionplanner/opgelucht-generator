import { NextRequest, NextResponse } from "next/server";
import {
  updateFeed,
} from "@/lib/services/feed-management.service";
import { updateFeedInputSchema } from "@/lib/types/feed.types";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idString } = await params;
  const id = parseInt(idString, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Ongeldig ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  const result = updateFeedInputSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? "Validatiefout" },
      { status: 400 }
    );
  }

  try {
    const updated = await updateFeed(id, result.data);
    return NextResponse.json({ feed: updated });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Feed niet gevonden") {
        return NextResponse.json(
          { error: "Feed niet gevonden" },
          { status: 404 }
        );
      }
      if (error.message === "Deze URL bestaat al") {
        return NextResponse.json(
          { error: "Deze URL bestaat al" },
          { status: 409 }
        );
      }
    }
    console.error("Failed to update feed:", error);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
}
