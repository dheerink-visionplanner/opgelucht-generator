import { NextResponse } from "next/server";
import { deleteFeed } from "@/lib/services/feed-management.service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Ongeldig ID" }, { status: 400 });
  }

  try {
    await deleteFeed(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "Feed niet gevonden") {
      return NextResponse.json({ error: "Feed niet gevonden" }, { status: 404 });
    }
    console.error("Failed to delete feed:", error);
    return NextResponse.json({ error: "Verwijderen mislukt" }, { status: 500 });
  }
}
