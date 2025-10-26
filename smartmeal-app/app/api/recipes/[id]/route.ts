import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/debug";
import { findRecipeById, generateIdSuggestions, logIdValidation } from "@/lib/recipeIdUtils";
import type { DetailedRecipe } from "@/types/recipe";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const startTime = Date.now();
  const requestId = `req_${Math.random().toString(36).substring(7)}`;
  
  try {
    const { id: rawId } = context.params;
    
    // Log request entry
    logger.info('API:RecipeDetail', 'Request received', {
      rawId,
      requestId,
    });

    // Load recipes from JSON file
    logger.debug('API:RecipeDetail', 'Loading recipes from file');
    const fs = require("fs");
    const path = require("path");
    const recipesPath = path.join(process.cwd(), "public", "data", "recipes.json");
    
    let recipes: DetailedRecipe[];
    try {
      recipes = JSON.parse(fs.readFileSync(recipesPath, "utf8"));
      logger.debug('API:RecipeDetail', 'Recipes loaded successfully', {
        totalRecipes: recipes.length,
        requestId,
      });
    } catch (fileError) {
      logger.error('API:RecipeDetail', 'Failed to read recipes file', {
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
      rawId
    );

    // Log ID validation details
    const sampleIds = recipes.slice(0, 5).map(r => r.id);
    logIdValidation(rawId, normalizedRequestedId, !!recipe, sampleIds);

    if (!recipe) {
      // Generate suggestions for similar IDs
      const suggestions = generateIdSuggestions(recipes, rawId, 3);
      
      logger.warn('API:RecipeDetail', 'Recipe not found', {
        requestedId: rawId,
        normalizedId: normalizedRequestedId,
        totalRecipes: recipes.length,
        suggestionsCount: suggestions.length,
        requestId,
      });

      const processingTime = Date.now() - startTime;
      
      return NextResponse.json(
        { 
          error: "Recipe not found. It may have been removed or the link is incorrect.",
          code: "RECIPE_NOT_FOUND_INVALID_ID",
          statusCode: 404,
          details: {
            requestedId: rawId,
            normalizedId: normalizedRequestedId,
            suggestions: suggestions.map(s => ({
              id: s.id,
              title: s.title,
              similarity: parseFloat((s.similarity * 100).toFixed(1)),
              reason: s.reason,
            })),
          },
          timestamp: new Date().toISOString(),
          requestId,
          meta: {
            processingTime: `${processingTime}ms`,
          },
        },
        { status: 404 }
      );
    }

    const processingTime = Date.now() - startTime;
    
    // Log successful match
    if (matchType !== 'exact') {
      logger.warn('API:RecipeDetail', `Non-exact match used: ${matchType}`, {
        requestedId: rawId,
        matchedId,
        matchType,
        recipeTitle: recipe.title,
        requestId,
      });
    } else {
      logger.success('API:RecipeDetail', 'Recipe found (exact match)', {
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        processingTime: `${processingTime}ms`,
        requestId,
      });
    }

    return NextResponse.json({
      recipe,
      timestamp: new Date().toISOString(),
      meta: {
        processingTime: `${processingTime}ms`,
        matchType,
        requestId,
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('API:RecipeDetail', 'Request failed', {
      error: error instanceof Error ? error.message : String(error),
      processingTime: `${processingTime}ms`,
      requestId,
    }, error instanceof Error ? error : undefined);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch recipe. Please try again.",
        code: "RECIPE_DETAIL_ERROR",
        statusCode: 500,
        timestamp: new Date().toISOString(),
        requestId,
      },
      { status: 500 }
    );
  }
}
