/**
 * Recipe Search Algorithm
 * Implements ingredient matching, filtering, and ranking logic
 */

// Import types and the logger
import { Recipe, DetailedRecipe, SortOption, CuisineType, DietaryFilter } from "@/types/recipe";
import logger from './debug'; // Import the logger

/**
 * Clean and normalize ingredient name for matching
 */
function cleanIngredient(ingredient: string): string {
  return ingredient
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "") // Keep alphanumeric and spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/\b(a|an|the)\b/g, "") // Remove articles
    .trim();
}

/**
 * Calculate ingredient match percentage
 */
export function calculateMatchPercentage(
  userIngredients: string[],
  recipeIngredients: { name: string }[]
): { percentage: number; available: string[]; missing: string[] } {
  const cleanedUserIngredients = userIngredients.map(cleanIngredient).filter(ing => ing); // Clean and remove empty user ingredients
  const cleanedRecipeIngredients = recipeIngredients.map((ing) => cleanIngredient(ing.name)).filter(ing => ing); // Clean and remove empty recipe ingredients

  const available: string[] = [];
  const missing: string[] = [];

  // Edge case: No recipe ingredients means 0% match
  if (cleanedRecipeIngredients.length === 0) {
     return { percentage: 0, available: [], missing: [] };
  }

  // Edge case: No user ingredients means 0% match
  if (cleanedUserIngredients.length === 0) {
      return { percentage: 0, available: [], missing: recipeIngredients.map(ing => ing.name) };
  }


  cleanedRecipeIngredients.forEach((recipeIng, index) => {
    // Find if any user ingredient matches the current recipe ingredient
    const isAvailable = cleanedUserIngredients.some((userIng) => {
      // Logic for matching: exact, or one contains the other (handles plurals somewhat)
      const match = recipeIng === userIng ||
             recipeIng.includes(userIng) ||
             userIng.includes(recipeIng);

      // ADDED DEBUG LOG: See the comparison details in the terminal
      logger.debug('RecipeSearch:Matching', `Comparing Recipe:'${recipeIng}' vs User:'${userIng}' -> Match: ${match}`);

      return match;
    });

    // Add original ingredient name to the correct list
    if (isAvailable) {
      available.push(recipeIngredients[index].name);
    } else {
      missing.push(recipeIngredients[index].name);
    }
  });

  const percentage = Math.round((available.length / cleanedRecipeIngredients.length) * 100);

  // Log the final calculation for this recipe
  logger.debug('RecipeSearch:Percentage', `Calculated Match: ${percentage}% (Available: ${available.length}, Missing: ${missing.length}, Total Recipe: ${cleanedRecipeIngredients.length}) for ingredients: [${cleanedUserIngredients.join(', ')}]`);


  return { percentage, available, missing };
}

/**
 * Apply dietary filters to recipe
 */
function matchesDietaryFilters(recipe: DetailedRecipe, filters: DietaryFilter[]): boolean {
  if (!filters || filters.length === 0) return true; // No filters to apply
  if (!recipe.dietaryTags || !Array.isArray(recipe.dietaryTags) || recipe.dietaryTags.length === 0) return false; // Recipe has no tags, can't match filters

  const recipeTags = recipe.dietaryTags.map((tag: string) => tag.toLowerCase().trim());
  // Check if *every* filter provided is present in the recipe's tags
  return filters.every((filter) => recipeTags.includes(filter.toLowerCase().trim()));
}

/**
 * Apply cuisine filter
 */
function matchesCuisine(recipe: DetailedRecipe, cuisine?: CuisineType): boolean {
  if (!cuisine || cuisine === "all") return true; // No filter or 'all' means match
  return recipe.cuisine.toLowerCase() === cuisine.toLowerCase();
}

/**
 * Sort recipes by specified option
 */
function sortRecipes(recipes: Recipe[], sortBy: SortOption): Recipe[] {
  const sorted = [...recipes]; // Create a copy to avoid mutating original

  switch (sortBy) {
    case "bestMatch":
      // Sort primarily by match percentage (desc), then maybe by total time (asc) as a tie-breaker
      return sorted.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0) || a.totalTime - b.totalTime);

    case "quickest":
      // Sort by total time (asc), then maybe by match percentage (desc) as a tie-breaker
      return sorted.sort((a, b) => a.totalTime - b.totalTime || (b.matchPercentage || 0) - (a.matchPercentage || 0));

    case "easiest":
      // Sort by difficulty (Easy=1, Medium=2, Hard=3), then maybe by time (asc)
      const difficultyScore = { Easy: 1, Medium: 2, Hard: 3 };
      return sorted.sort(
        (a, b) => difficultyScore[a.difficulty] - difficultyScore[b.difficulty] || a.totalTime - b.totalTime
      );

    default:
      // Default to sorting by best match if sortBy is invalid
      logger.warn('RecipeSearch:Sort', `Unknown sort option '${sortBy}', defaulting to 'bestMatch'.`);
      return sorted.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
  }
}

// --- Interfaces (kept as they were) ---
export interface SearchParams {
  ingredients: string[];
  cuisine?: CuisineType;
  dietaryFilters?: DietaryFilter[];
  sortBy?: SortOption;
  minMatchPercentage?: number;
}

export interface SearchResult {
  recipes: Recipe[];
  totalMatches: number; // Use this for the count *after* all filtering
}

/**
 * Search recipes based on ingredients and filters
 */
export async function searchRecipes(
  allRecipes: DetailedRecipe[],
  params: SearchParams
): Promise<SearchResult> {
  const {
    ingredients,
    cuisine = "all", // Default to 'all' if undefined
    dietaryFilters = [], // Default to empty array
    sortBy = "bestMatch", // Default sort
    minMatchPercentage = 1, // Default minimum match
  } = params;

  logger.info('RecipeSearch:Start', 'Starting recipe search', { ingredients: ingredients.length, cuisine, dietaryFilters: dietaryFilters.length, sortBy, minMatchPercentage });


  // Step 1: Calculate match percentages for all recipes
  let recipesWithMatch = allRecipes.map((recipe) => {
    // Ensure ingredients exist before calculating
     const recipeIngredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
     const { percentage, available, missing } = calculateMatchPercentage(
       ingredients,
       recipeIngredients // Use the validated ingredients
     );

    // Create the simpler Recipe object for results
    const resultRecipe: Recipe = {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      matchPercentage: percentage,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.totalTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      mealType: recipe.mealType,
      cuisine: recipe.cuisine,
      availableIngredients: available, // Include these for potential UI display
      missingIngredients: missing,   // Include these
    };
    return resultRecipe;
  });

  logger.debug('RecipeSearch:MatchCalc', `Calculated match percentages for ${recipesWithMatch.length} recipes.`);


  // Step 2: Filter by minimum match percentage
  let filteredRecipes = recipesWithMatch.filter(
    (recipe) => (recipe.matchPercentage || 0) >= minMatchPercentage
  );
  logger.debug('RecipeSearch:FilterMatch', `Filtered by minMatch (${minMatchPercentage}%): ${filteredRecipes.length} recipes remaining.`);


  // Keep a map of detailed recipes for efficient filtering lookups
  const detailedRecipesMap = new Map(allRecipes.map((r) => [r.id, r]));

  // Step 3: Apply cuisine filter
  if (cuisine && cuisine !== "all") {
      filteredRecipes = filteredRecipes.filter((recipe) => {
          const detailed = detailedRecipesMap.get(recipe.id);
          return detailed ? matchesCuisine(detailed, cuisine) : false;
      });
      logger.debug('RecipeSearch:FilterCuisine', `Filtered by cuisine (${cuisine}): ${filteredRecipes.length} recipes remaining.`);
  }

  // Step 4: Apply dietary filters
  if (dietaryFilters.length > 0) {
    filteredRecipes = filteredRecipes.filter((recipe) => {
      const detailed = detailedRecipesMap.get(recipe.id);
      return detailed ? matchesDietaryFilters(detailed, dietaryFilters) : false;
    });
    logger.debug('RecipeSearch:FilterDietary', `Filtered by dietary (${dietaryFilters.join(', ')}): ${filteredRecipes.length} recipes remaining.`);

  }

  // Step 5: Sort results
  const sortedRecipes = sortRecipes(filteredRecipes, sortBy);
  logger.debug('RecipeSearch:Sort', `Sorted ${sortedRecipes.length} recipes by '${sortBy}'.`);


  logger.info('RecipeSearch:End', `Search finished. Found ${sortedRecipes.length} recipes matching criteria.`);


  return {
    recipes: sortedRecipes, // The final list of recipes
    totalMatches: sortedRecipes.length, // The count after all filters
  };
}

/**
 * Get recipe recommendations based on a recipe (kept as is)
 */
export function getRecommendations(
  currentRecipe: DetailedRecipe,
  allRecipes: DetailedRecipe[],
  count: number = 3
): Recipe[] {
  // Filter out current recipe
  const candidates = allRecipes.filter((r) => r.id !== currentRecipe.id);

  // Score based on same cuisine and complementary meal type
  const scored = candidates.map((recipe) => {
    let score = 0;

    // Same cuisine bonus
    if (recipe.cuisine === currentRecipe.cuisine) {
      score += 50;
    }

    // Complementary meal type bonus
    if (currentRecipe.mealType === "Dinner") {
      if (recipe.mealType === "Snack") score += 30;
    } else if (currentRecipe.mealType === "Breakfast") {
      if (recipe.mealType === "Lunch" || recipe.mealType === "Snack") score += 20;
    }

    // Short prep time bonus for sides
    if (recipe.prepTime <= 15) {
      score += 20;
    }

    // Shared dietary tags bonus
     // Check if tags exist before filtering
     const currentTags = Array.isArray(currentRecipe.dietaryTags) ? currentRecipe.dietaryTags : [];
     const recipeTags = Array.isArray(recipe.dietaryTags) ? recipe.dietaryTags : [];
     const sharedTags = recipeTags.filter((tag) => currentTags.includes(tag));
     score += sharedTags.length * 10;


    return {
      recipe,
      score,
    };
  });

  // Sort by score and return top matches
  scored.sort((a, b) => b.score - a.score);

  // Map to the simpler Recipe type for return
  return scored.slice(0, count).map((item) => ({
    id: item.recipe.id,
    title: item.recipe.title,
    image: item.recipe.image,
    prepTime: item.recipe.prepTime,
    cookTime: item.recipe.cookTime,
    totalTime: item.recipe.totalTime,
    servings: item.recipe.servings,
    difficulty: item.recipe.difficulty,
    mealType: item.recipe.mealType,
    cuisine: item.recipe.cuisine,
     // Match percentage/ingredients aren't relevant for recommendations
  }));
}

/**
 * Load all recipes from JSON data (kept as is)
 */
export async function loadAllRecipes(): Promise<DetailedRecipe[]> {
  try {
    // Assuming fetch works correctly in your environment (e.g., client-side or properly configured server-side)
    const response = await fetch("/data/recipes.json");
    if (!response.ok) {
       logger.error('RecipeSearch:Load', `Failed to fetch recipes.json: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to load recipes: ${response.statusText}`);
    }
    const recipes = await response.json();
     logger.info('RecipeSearch:Load', `Successfully loaded ${recipes.length} recipes from JSON.`);
    return recipes as DetailedRecipe[];
  } catch (error) {
     logger.error('RecipeSearch:Load', 'Error loading or parsing recipes.json', {}, error instanceof Error ? error : undefined);
    return []; // Return empty array on error
  }
}