/**
 * Nutrition Type Definitions
 */

export interface NutritionGoals {
  dailyCalorieGoal: number;
  proteinGoal: number; // grams
  carbGoal: number; // grams
  fatGoal: number; // grams
}

export interface NutritionProgress {
  current: number;
  goal: number;
  percentage: number;
}

export interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium: number;
  sugar: number;
}

export interface WeeklyNutritionSummary {
  avgDailyCalories: number;
  weeklyProtein: number;
  weeklyCarbs: number;
  weeklyFats: number;
  goalAdherence: number; // days on track / 7
}
