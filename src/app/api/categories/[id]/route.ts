import { NextResponse } from "next/server";
import {
  getCategoryById,
  getCategoryArticleCount,
  deleteCategory,
} from "@/lib/services/categories.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Ongeldig ID" }, { status: 400 });
  }

  try {
    const category = await getCategoryById(id);

    if (!category) {
      return NextResponse.json(
        { error: "Categorie niet gevonden" },
        { status: 404 }
      );
    }

    const articleCount = await getCategoryArticleCount(id);
    return NextResponse.json({ ...category, articleCount });
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return NextResponse.json(
      { error: "Ophalen mislukt" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Ongeldig ID" }, { status: 400 });
  }

  try {
    await deleteCategory(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "Categorie niet gevonden") {
      return NextResponse.json(
        { error: "Categorie niet gevonden" },
        { status: 404 }
      );
    }
    console.error("Failed to delete category:", error);
    return NextResponse.json(
      { error: "Verwijderen mislukt" },
      { status: 500 }
    );
  }
}
