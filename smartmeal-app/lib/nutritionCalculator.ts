/**
 * Nutrition Calculator Utilities
 * Aggregate nutrition data and calculate progress toward goals
 */

import { Nutrition } from "@/types/recipe";
import { NutritionGoals, NutritionProgress, DailyNutrition } from "@/types/nutrition";
import { MealSlot } from "@/types/mealPlan";

/**
 * Calculate total nutrition from multiple meals
 */
export function aggregateNutrition(meals: (MealSlot | null)[]): DailyNutrition {
  const total: DailyNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    sodium: 0,
    sugar: 0,
  };

  meals.forEach((meal) => {
    if (meal && meal.calories && meal.macros) {
      total.calories += meal.calories;
      total.protein += meal.macros.protein;
      total.carbs += meal.macros.carbs;
      total.fats += meal.macros.fats;
    }
  });

  return total;
}

/**
 * Calculate nutrition progress against goals
 */
export function calculateProgress(
  current: number,
  goal: number
): NutritionProgress {
  const percentage = goal > 0 ? Math.round((current / goal) * 100) : 0;

  return {
    current,
    goal,
    percentage,
  };
}

/**
 * Calculate all macro progress
 */
export function calculateMacroProgress(
  nutrition: DailyNutrition,
  goals: NutritionGoals
) {
  return {
    calories: calculateProgress(nutrition.calories, goals.dailyCalorieGoal),
    protein: calculateProgress(nutrition.protein, goals.proteinGoal),
    carbs: calculateProgress(nutrition.carbs, goals.carbGoal),
    fats: calculateProgress(nutrition.fats, goals.fatGoal),
  };
}

/**
 * Determine goal status
 */
export function getGoalStatus(percentage: number): "Under Goal" | "On Target" | "Over Goal" {
  if (percentage < 90) return "Under Goal";
  if (percentage <= 110) return "On Target";
  return "Over Goal";
}

/**
 * Calculate calorie needs based on activity level and goal
 */
export function calculateCalorieGoal(
  activityLevel: string,
  goalType: string,
  baseCalories: number = 2000
): number {
  // Activity multipliers
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    "lightly-active": 1.375,
    "moderately-active": 1.55,
    "very-active": 1.725,
  };

  // Goal adjustments
  const goalAdjustments: Record<string, number> = {
    lose: -500, // Calorie deficit
    maintain: 0,
    gain: 500, // Calorie surplus
  };

  const multiplier = activityMultipliers[activityLevel] || 1.55;
  const adjustment = goalAdjustments[goalType] || 0;

  return Math.round(baseCalories * multiplier + adjustment);
}

/**
 * Calculate macro split from calories
 */
export function calculateMacroSplit(
  calories: number,
  proteinPercent: number = 30,
  carbPercent: number = 40,
  fatPercent: number = 30
): NutritionGoals {
  // Calories per gram: Protein=4, Carbs=4, Fat=9
  const proteinCalories = calories * (proteinPercent / 100);
  const carbCalories = calories * (carbPercent / 100);
  const fatCalories = calories * (fatPercent / 100);

  return {
    dailyCalorieGoal: calories,
    proteinGoal: Math.round(proteinCalories / 4),
    carbGoal: Math.round(carbCalories / 4),
    fatGoal: Math.round(fatCalories / 9),
  };
}

/**
 * Suggest meals based on remaining macros
 */
export function suggestMealsForRemainingMacros(
  currentNutrition: DailyNutrition,
  goals: NutritionGoals
): {
  remainingCalories: number;
  remainingProtein: number;
  remainingCarbs: number;
  remainingFats: number;
} {
  return {
    remainingCalories: Math.max(0, goals.dailyCalorieGoal - currentNutrition.calories),
    remainingProtein: Math.max(0, goals.proteinGoal - currentNutrition.protein),
    remainingCarbs: Math.max(0, goals.carbGoal - currentNutrition.carbs),
    remainingFats: Math.max(0, goals.fatGoal - currentNutrition.fats),
  };
}

/**
 * Check if nutrition matches target (within tolerance)
 */
export function matchesNutritionTarget(
  nutrition: Nutrition,
  target: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  },
  tolerance: number = 10 // percentage
): boolean {
  const checks: boolean[] = [];

  if (target.calories !== undefined) {
    const diff = Math.abs(nutrition.calories - target.calories);
    const allowedDiff = target.calories * (tolerance / 100);
    checks.push(diff <= allowedDiff);
  }

  if (target.protein !== undefined) {
    const diff = Math.abs(nutrition.protein - target.protein);
    const allowedDiff = target.protein * (tolerance / 100);
    checks.push(diff <= allowedDiff);
  }

  if (target.carbs !== undefined) {
    const diff = Math.abs(nutrition.carbs - target.carbs);
    const allowedDiff = target.carbs * (tolerance / 100);
    checks.push(diff <= allowedDiff);
  }

  if (target.fats !== undefined) {
    const diff = Math.abs(nutrition.fats - target.fats);
    const allowedDiff = target.fats * (tolerance / 100);
    checks.push(diff <= allowedDiff);
  }

  return checks.length > 0 && checks.every((check) => check);
}
