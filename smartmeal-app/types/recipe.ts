/**
 * Recipe Type Definitions
 * Based on the Smart Meal design specification
 */

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  substitutions?: string[];
}

export interface Instruction {
  step: number;
  text: string;
  timerDuration?: number; // in seconds
}

export interface Nutrition {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  fiber: number; // grams
  sodium: number; // milligrams
  sugar: number; // grams
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  matchPercentage?: number;
  prepTime: number; // minutes
  cookTime: number; // minutes
  totalTime: number; // minutes
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  cuisine: string;
  availableIngredients?: string[];
  missingIngredients?: string[];
}

export interface DetailedRecipe extends Recipe {
  description: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  nutrition: Nutrition;
  dietaryTags: string[];
  videoId?: string | null;
}

export type SortOption = "bestMatch" | "quickest" | "easiest";

export type CuisineType = "indian" | "chinese" | "italian" | "mexican" | "thai" | "all";

export type DietaryFilter = "vegetarian" | "vegan" | "keto" | "gluten-free" | "low-carb";
