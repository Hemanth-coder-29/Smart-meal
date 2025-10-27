// smartmeal-app/app/api/recipes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/debug";
import { findRecipeById, generateIdSuggestions, logIdValidation } from "@/lib/recipeIdUtils";
import type { DetailedRecipe } from "@/types/recipe";
import { promises as fs } from 'fs';
import path from 'path';

// Define the context type explicitly
interface ApiContext {
    params: { id: string } | Promise<{ id: string }>; // Acknowledge it might be a Promise
}

export async function GET(
  request: NextRequest,
  context: ApiContext // Use the potentially Promise-like context
) {
  const startTime = Date.now();
  const requestId = `req_${Math.random().toString(36).substring(7)}`;
  let rawId: string | undefined; // Declare rawId outside try block

  try {
    // --- TRY AWAITING PARAMS ---
    // Attempt to resolve context.params if it's a Promise
    const resolvedParams = await context.params;
    rawId = resolvedParams.id; // Access id from the resolved object
    // --- END AWAIT ---

    // Log request entry
    logger.info('API:RecipeDetail', 'Request received', {
      rawId, // Log the ID after potential await
      requestId,
    });

    // Add an early check for undefined/empty rawId
    if (!rawId) {
      logger.error('API:RecipeDetail', 'Recipe ID is missing or invalid after resolving params.', { resolvedParams, contextParams: context.params, requestId });
      return NextResponse.json(
        {
          error: "Invalid request: Recipe ID parameter is missing.",
          code: "RECIPE_ID_MISSING",
          statusCode: 400,
          timestamp: new Date().toISOString(),
          requestId,
        },
        { status: 400 }
      );
    }

    // --- The rest of the function remains the same ---

    // Load recipes from JSON file
    logger.debug('API:RecipeDetail', 'Loading recipes from file');
    const recipesPath = path.join(process.cwd(), "public", "data", "recipes.json");

    let recipes: DetailedRecipe[];
    try {
      const fileContent = await fs.readFile(recipesPath, "utf8");
      recipes = JSON.parse(fileContent);
      logger.debug('API:RecipeDetail', 'Recipes loaded successfully', { totalRecipes: recipes.length, requestId });
    } catch (fileError) {
      logger.error('API:RecipeDetail', 'Failed to read or parse recipes file', { /* ... error logging ... */ });
      return NextResponse.json( /*... file error response ...*/ { status: 500 });
    }

    // Use fuzzy matching to find recipe
    const { recipe, matchType, normalizedRequestedId, matchedId } = findRecipeById(
      recipes,
      rawId // Use the awaited ID
    );

    // Log ID validation details
    const sampleIds = recipes.slice(0, 5).map(r => r?.id || 'invalid_id').filter(id => id !== 'invalid_id');
    logIdValidation(rawId, normalizedRequestedId, !!recipe, sampleIds);

    // Handle case where recipe is not found
    if (!recipe) {
      const suggestions = generateIdSuggestions(recipes, rawId, 3);
      logger.warn('API:RecipeDetail', 'Recipe not found', { /* ... logging ... */ });
      const processingTime = Date.now() - startTime;
      return NextResponse.json( /*... 404 response ...*/ { status: 404 });
    }

    // --- Success Case ---
    const processingTime = Date.now() - startTime;
    // ... (Success logging and response logic - remains the same) ...
     if (matchType !== 'exact') {
       logger.warn('API:RecipeDetail', `Non-exact match used: ${matchType}`, { /*...*/ });
     } else {
       logger.success('API:RecipeDetail', 'Recipe found (exact match)', { /*...*/ });
     }
     return NextResponse.json({ recipe, /*...*/ }); // Default status is 200

  } catch (error) { // General catch block
    const processingTime = Date.now() - startTime;
    logger.error('API:RecipeDetail', 'Unexpected error in GET handler', {
        rawIdAttempted: rawId, // Log whatever ID we got (or undefined)
        error: error instanceof Error ? error.message : String(error),
        processingTime: `${processingTime}ms`,
        requestId,
      }, error instanceof Error ? error : undefined);

    return NextResponse.json( /*... 500 error response ...*/ { status: 500 });
  }
}