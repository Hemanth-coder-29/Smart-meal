import { NextRequest, NextResponse } from "next/server";
import { searchRecipes } from "@/lib/recipeSearch";
import type { DetailedRecipe } from "@/types/recipe";
import logger from "@/lib/debug";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${Math.random().toString(36).substring(7)}`;
  const recipesPath = path.join(process.cwd(), "public", "data", "recipes.json");

  let allRecipes: DetailedRecipe[];
  try {
    const file = await fs.readFile(recipesPath, "utf8");
    allRecipes = JSON.parse(file);
    logger.debug('API:RecipeSearch', 'Recipes loaded successfully (async)', {
      totalRecipes: allRecipes.length,
      requestId,
    });
  } catch (fileError) {
    logger.error('API:RecipeSearch', 'Failed to read recipes file (async)', {
      path: recipesPath,
      error: fileError instanceof Error ? fileError.message : String(fileError),
      requestId,
    }, fileError instanceof Error ? fileError : undefined);
    return NextResponse.json(
      { 
        error: "We're having trouble loading recipes. Please try again in a moment.",
        code: "RECIPE_FILE_READ_ERROR",
        statusCode: 500,
        timestamp: new Date().toISOString(),
        requestId,
      },
      { status: 500 }
    );
  }

  try {
    // Log request entry
    logger.info('API:RecipeSearch', 'Request received', { requestId });
    
    const body = await request.json();
    const { ingredients, filters } = body;

    // Log request parameters
    logger.debug('API:RecipeSearch', 'Request parameters', {
      ingredients,
      filters,
      requestId,
    });

    // Validate ingredients
    if (!ingredients || !Array.isArray(ingredients)) {
      logger.warn('API:RecipeSearch', 'Validation failed: Invalid ingredients', {
        received: ingredients,
        expectedType: 'array',
        requestId,
      });
      return NextResponse.json(
        { 
          error: "Please enter at least one ingredient to search.",
          code: "RECIPE_SEARCH_INVALID_INPUT",
          statusCode: 400,
          timestamp: new Date().toISOString(),
          requestId,
        },
        { status: 400 }
      );
    }

    if (ingredients.length === 0) {
      logger.warn('API:RecipeSearch', 'Validation failed: Empty ingredients array', {
        requestId,
      });
      return NextResponse.json(
        { 
          error: "Please enter at least one ingredient to search.",
          code: "RECIPE_SEARCH_INVALID_INPUT",
          statusCode: 400,
          timestamp: new Date().toISOString(),
          requestId,
        },
        { status: 400 }
      );
    }

    // Execute search
    logger.debug('API:RecipeSearch', 'Executing search algorithm');
    const results = await searchRecipes(allRecipes, {
      ingredients,
      cuisine: filters?.cuisine,
      dietaryFilters: filters?.dietaryFilters || [],
      sortBy: filters?.sortBy || "bestMatch",
      minMatchPercentage: filters?.minMatchPercentage || 1,
    });

    // Log search results
    logger.debug('API:RecipeSearch', 'Search completed', {
      matchesFound: results.totalMatches,
      recipesReturned: results.recipes.length,
      requestId,
    });

    const processingTime = Date.now() - startTime;
    
    // Log successful response
    logger.success('API:RecipeSearch', 'Response sent', {
      status: 200,
      resultCount: results.totalMatches,
      processingTime: `${processingTime}ms`,
      requestId,
    });

    return NextResponse.json({
      recipes: results.recipes,
      count: results.totalMatches,
      timestamp: new Date().toISOString(),
      meta: {
        processingTime: `${processingTime}ms`,
        requestId,
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('API:RecipeSearch', 'Request failed', {
      error: error instanceof Error ? error.message : String(error),
      processingTime: `${processingTime}ms`,
      requestId,
    }, error instanceof Error ? error : undefined);
    
    return NextResponse.json(
      { 
        error: "Failed to search recipes. Please try again.",
        code: "RECIPE_SEARCH_ERROR",
        statusCode: 500,
        timestamp: new Date().toISOString(),
        requestId,
      },
      { status: 500 }
    );
  }
}