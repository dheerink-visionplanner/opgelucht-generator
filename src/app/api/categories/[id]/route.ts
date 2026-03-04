import { NextResponse } from "next/server";
import { updateCategory } from "@/lib/services/categories.service";
import { updateCategoryInputSchema } from "@/lib/types/category.types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Ongeldig id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const parsed = updateCategoryInputSchema.safeParse(body);
  if (!parsed.success) {
    const error = parsed.error.errors[0]?.message ?? "Validatiefout";
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const category = await updateCategory(id, parsed.data);
    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Categorie bestaat al") {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.message === "Categorie niet gevonden") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    console.error("Failed to update category:", error);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
}
