import { NextResponse } from "next/server";
import { getAllCategories, createCategory } from "@/lib/services/categories.service";
import { createCategorySchema } from "@/lib/types/category.types";

export async function GET() {
  try {
    const data = await getAllCategories();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" },
        { status: 400 }
      );
    }

    const category = await createCategory(parsed.data);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("bestaat al")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("Failed to create category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
