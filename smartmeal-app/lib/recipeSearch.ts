/**
 * Recipe Search Algorithm
 * Implements ingredient matching, filtering, and ranking logic
 */

import { Recipe, DetailedRecipe, SortOption, CuisineType, DietaryFilter } from "@/types/recipe";

/**
 * Clean and normalize ingredient name for matching
 */
function cleanIngredient(ingredient: string): string {
  return ingredient
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\b(a|an|the)\b/g, "")
    .trim();
}

/**
 * Calculate ingredient match percentage
 */
export function calculateMatchPercentage(
  userIngredients: string[],
  recipeIngredients: { name: string }[]
): { percentage: number; available: string[]; missing: string[] } {
  const cleanedUserIngredients = userIngredients.map(cleanIngredient);
  const cleanedRecipeIngredients = recipeIngredients.map((ing) => cleanIngredient(ing.name));

  const available: string[] = [];
  const missing: string[] = [];

  cleanedRecipeIngredients.forEach((recipeIng, index) => {
    const isAvailable = cleanedUserIngredients.some((userIng) => {
  // Exact match or substring (broader ingredient contains narrower)
  return recipeIng === userIng || 
         recipeIng.includes(userIng) || 
         userIng.includes(recipeIng);
});


    if (isAvailable) {
      available.push(recipeIngredients[index].name);
    } else {
      missing.push(recipeIngredients[index].name);
    }
  });

  const percentage =
    recipeIngredients.length > 0
      ? Math.round((available.length / recipeIngredients.length) * 100)
      : 0;

  return { percentage, available, missing };
}

/**
 * Apply dietary filters to recipe
 */
function matchesDietaryFilters(recipe: DetailedRecipe, filters: DietaryFilter[]): boolean {
  if (!filters || filters.length === 0) return true;
  if (!recipe.dietaryTags || !Array.isArray(recipe.dietaryTags)) return false;
  const recipeTags = recipe.dietaryTags.map((tag: string) => tag.toLowerCase().trim());
  return filters.every((filter) => recipeTags.includes(filter.toLowerCase().trim()));
}


/**
 * Apply cuisine filter
 */
function matchesCuisine(recipe: DetailedRecipe, cuisine: CuisineType): boolean {
  if (cuisine === "all") return true;
  return recipe.cuisine.toLowerCase() === cuisine.toLowerCase();
}

/**
 * Sort recipes by specified option
 */
function sortRecipes(recipes: Recipe[], sortBy: SortOption): Recipe[] {
  const sorted = [...recipes];

  switch (sortBy) {
    case "bestMatch":
      // Already sorted by match percentage (descending)
      return sorted.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

    case "quickest":
      return sorted.sort((a, b) => a.totalTime - b.totalTime);

    case "easiest":
      const difficultyScore = { Easy: 1, Medium: 2, Hard: 3 };
      return sorted.sort(
        (a, b) => difficultyScore[a.difficulty] - difficultyScore[b.difficulty]
      );

    default:
      return sorted;
  }
}

export interface SearchParams {
  ingredients: string[];
  cuisine?: CuisineType;
  dietaryFilters?: DietaryFilter[];
  sortBy?: SortOption;
  minMatchPercentage?: number;
}

export interface SearchResult {
  recipes: Recipe[];
  totalMatches: number;
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
    cuisine = "all",
    dietaryFilters = [],
    sortBy = "bestMatch",
    minMatchPercentage = 15,
  } = params;

  // Step 1: Calculate match percentages
  let matchedRecipes = allRecipes.map((recipe) => {
    const { percentage, available, missing } = calculateMatchPercentage(
      ingredients,
      recipe.ingredients
    );

    const recipeWithMatch: Recipe = {
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
      availableIngredients: available,
      missingIngredients: missing,
    };

    return recipeWithMatch;
  });

  // Step 2: Filter by minimum match percentage
  matchedRecipes = matchedRecipes.filter(
    (recipe) => (recipe.matchPercentage || 0) >= minMatchPercentage
  );

  // Step 3: Apply cuisine filter
  const detailedRecipesMap = new Map(allRecipes.map((r) => [r.id, r]));
  matchedRecipes = matchedRecipes.filter((recipe) => {
    const detailed = detailedRecipesMap.get(recipe.id);
    return detailed ? matchesCuisine(detailed, cuisine) : false;
  });

  // Step 4: Apply dietary filters
  if (dietaryFilters.length > 0) {
    matchedRecipes = matchedRecipes.filter((recipe) => {
      const detailed = detailedRecipesMap.get(recipe.id);
      return detailed ? matchesDietaryFilters(detailed, dietaryFilters) : false;
    });
  }

  // Step 5: Sort results
  const sortedRecipes = sortRecipes(matchedRecipes, sortBy);

  return {
    recipes: sortedRecipes,
    totalMatches: sortedRecipes.length,
  };
}

/**
 * Get recipe recommendations based on a recipe
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
    const sharedTags = recipe.dietaryTags.filter((tag) =>
      currentRecipe.dietaryTags.includes(tag)
    );
    score += sharedTags.length * 10;

    return {
      recipe,
      score,
    };
  });

  // Sort by score and return top matches
  scored.sort((a, b) => b.score - a.score);

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
  }));
}

/**
 * Load all recipes from JSON data
 */
export async function loadAllRecipes(): Promise<DetailedRecipe[]> {
  try {
    const response = await fetch("/data/recipes.json");
    if (!response.ok) {
      throw new Error("Failed to load recipes");
    }
    const recipes = await response.json();
    return recipes as DetailedRecipe[];
  } catch (error) {
    console.error("Error loading recipes:", error);
    return [];
  }
}
