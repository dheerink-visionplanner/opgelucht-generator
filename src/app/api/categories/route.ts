import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/services/categories.service";

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
