import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Load recipe from JSON file
    const fs = require("fs");
    const path = require("path");
    const recipesPath = path.join(process.cwd(), "public", "data", "recipes.json");
    
    const recipes = JSON.parse(fs.readFileSync(recipesPath, "utf8"));
    const recipe = recipes.find((r: any) => r.id === id);

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      recipe,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Recipe API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 }
    );
  }
}
