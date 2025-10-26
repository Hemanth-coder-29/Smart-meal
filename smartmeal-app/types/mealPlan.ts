/**
 * Meal Plan Type Definitions
 */

import { Nutrition } from "./recipe";

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type MealType = "breakfast" | "lunch" | "dinner";

export interface MealSlot {
  recipeId: string | null;
  recipeName: string | null;
  recipeImage?: string | null;
  calories: number | null;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  } | null;
}

export interface DayMeals {
  breakfast: MealSlot;
  lunch: MealSlot;
  dinner: MealSlot;
}

export interface MealPlan {
  weekStarting: string; // ISO date
  meals: {
    monday: DayMeals;
    tuesday: DayMeals;
    wednesday: DayMeals;
    thursday: DayMeals;
    friday: DayMeals;
    saturday: DayMeals;
    sunday: DayMeals;
  };
  lastUpdated: string; // ISO timestamp
}

export interface DailyNutritionSummary {
  day: DayOfWeek;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  status: "Under Goal" | "On Target" | "Over Goal";
}
