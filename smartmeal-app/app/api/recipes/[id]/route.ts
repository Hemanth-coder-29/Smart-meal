// smartmeal-app/app/api/recipes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/debug";
import { findRecipeById, generateIdSuggestions, logIdValidation } from "@/lib/recipeIdUtils";
import type { DetailedRecipe } from "@/types/recipe";
import { promises as fs } from 'fs';
import path from 'path';

// Define the context type explicitly
// --- THIS INTERFACE IS REMOVED ---

export async function GET(
  request: NextRequest,
  // --- THIS IS THE CORRECTED TYPE ---
  context: { params: { id: string } } 
) {
  const startTime = Date.now();
  const requestId = `req_${Math.random().toString(36).substring(7)}`;
  let rawId: string | undefined; // Declare rawId outside try block

  try {
    // --- THIS IS THE CORRECTED ASSIGNMENT ---
    rawId = context.params.id; // Access id directly
    // --- END CORRECTION ---

    // Log request entry
    logger.info('API:RecipeDetail', 'Request received', {
      rawId, // Log the ID
      requestId,
    });

    // Add an early check for undefined/empty rawId
    if (!rawId) {
      logger.error('API:RecipeDetail', 'Recipe ID is missing or invalid.', { contextParams: context.params, requestId });
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

    // Load recipes from JSON file
    logger.debug('API:RecipeDetail', 'Loading recipes from file');
    const recipesPath = path.join(process.cwd(), "public", "data", "recipes.json");

    let recipes: DetailedRecipe[];
    try {
      const fileContent = await fs.readFile(recipesPath, "utf8");
      recipes = JSON.parse(fileContent);
      logger.debug('API:RecipeDetail', 'Recipes loaded successfully', { totalRecipes: recipes.length, requestId });
    } catch (fileError) {
      logger.error('API:RecipeDetail', 'Failed to read or parse recipes file', { 
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

    // Use fuzzy matching to find recipe
    const { recipe, matchType, normalizedRequestedId, matchedId } = findRecipeById(
      recipes,
      rawId // Use the ID
    );

    // Log ID validation details
    const sampleIds = recipes.slice(0, 5).map(r => r?.id || 'invalid_id').filter(id => id !== 'invalid_id');
    logIdValidation(rawId, normalizedRequestedId, !!recipe, sampleIds);

    // Handle case where recipe is not found
    if (!recipe) {
      const suggestions = generateIdSuggestions(recipes, rawId, 3);
      const processingTime = Date.now() - startTime;
      logger.warn('API:RecipeDetail', 'Recipe not found', { 
        rawId, 
        normalizedId: normalizedRequestedId, 
        suggestionsCount: suggestions.length,
        processingTime: `${processingTime}ms`,
        requestId 
      });
      return NextResponse.json(
        { 
          error: "Recipe not found. It may have been removed or the link is incorrect.",
          code: "RECIPE_NOT_FOUND_INVALID_ID",
          statusCode: 404,
          details: {
            requestedId: rawId,
            normalizedId: normalizedRequestedId,
            suggestions: suggestions,
          },
          timestamp: new Date().toISOString(),
          requestId,
        }, 
        { status: 404 }
      );
    }

    // --- Success Case ---
    const processingTime = Date.now() - startTime;
     if (matchType !== 'exact') {
       logger.warn('API:RecipeDetail', `Non-exact match used: ${matchType}`, { 
         rawId, 
         matchedId: matchedId, 
         processingTime: `${processingTime}ms`,
         requestId 
        });
     } else {
       logger.success('API:RecipeDetail', 'Recipe found (exact match)', { 
         rawId, 
         recipeTitle: recipe.title,
         processingTime: `${processingTime}ms`,
         requestId
       });
     }
     return NextResponse.json({ 
        recipe,
        meta: {
            matchType,
            requestedId: rawId,
            matchedId,
            processingTime: `${processingTime}ms`,
            requestId
        }
    });

  } catch (error) { // General catch block
    const processingTime = Date.now() - startTime;
    logger.error('API:RecipeDetail', 'Unexpected error in GET handler', {
        rawIdAttempted: rawId, // Log whatever ID we got (or undefined)
        error: error instanceof Error ? error.message : String(error),
        processingTime: `${processingTime}ms`,
        requestId,
      }, error instanceof Error ? error : undefined);

    return NextResponse.json(
      { 
        error: "An unexpected server error occurred.",
        code: "RECIPE_DETAIL_ERROR",
        statusCode: 500,
        timestamp: new Date().toISOString(),
        requestId,
      }, 
      { status: 500 }
    );
  }
}