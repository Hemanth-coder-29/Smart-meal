/**
 * User Profile Type Definitions
 */

export type ActivityLevel = "sedentary" | "lightly-active" | "moderately-active" | "very-active";

export type GoalType = "lose" | "maintain" | "gain";

export interface UserProfile {
  dailyCalorieGoal: number;
  proteinGoal: number; // grams
  carbGoal: number; // grams
  fatGoal: number; // grams
  dietaryRestrictions: string[]; // ["vegetarian", "gluten-free", etc.]
  activityLevel: ActivityLevel;
  goalType: GoalType;
  preferredCuisines: string[]; // ["indian", "italian", etc.]
}

export interface SearchQuery {
  query: string;
  filters: {
    cuisine?: string;
    dietaryFilters?: string[];
  };
  timestamp: string; // ISO timestamp
  resultCount: number;
}
