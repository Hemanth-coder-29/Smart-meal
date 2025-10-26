import { NextRequest, NextResponse } from "next/server";
import { searchRecipes } from "@/lib/recipeSearch";
import type { DetailedRecipe } from "@/types/recipe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, filters } = body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: "Ingredients array is required" },
        { status: 400 }
      );
    }

    // Load recipes from JSON file
    const fs = require("fs");
    const path = require("path");
    const recipesPath = path.join(process.cwd(), "public", "data", "recipes.json");
    const allRecipes: DetailedRecipe[] = JSON.parse(fs.readFileSync(recipesPath, "utf8"));

    const results = await searchRecipes(allRecipes, {
      ingredients,
      cuisine: filters?.cuisine,
      dietaryFilters: filters?.dietaryFilters || [],
      sortBy: filters?.sortBy || "bestMatch",
      minMatchPercentage: filters?.minMatchPercentage || 30,
    });

    return NextResponse.json({
      recipes: results.recipes,
      count: results.totalMatches,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search recipes" },
      { status: 500 }
    );
  }
}
