/**
 * Type-safe LocalStorage wrapper utilities
 * Handles storage, retrieval, and error handling for persisted data
 */

import { MealPlan } from "@/types/mealPlan";
import { ShoppingList } from "@/types/shopping";
import { UserProfile, SearchQuery } from "@/types/user";

// Storage keys
export const STORAGE_KEYS = {
  FAVORITES: "smartmeal_favorites",
  MEAL_PLAN: "smartmeal_mealplan",
  SHOPPING_LIST: "smartmeal_shoppinglist",
  PROFILE: "smartmeal_profile",
  RECENT_SEARCHES: "smartmeal_recentsearches",
  THEME: "smartmeal_theme",
} as const;

/**
 * Save data to localStorage with error handling
 */
export function saveToStorage<T>(key: string, data: T): boolean {
  try {
    if (typeof window === "undefined") return false;
    
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Load data from localStorage with type safety
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === "undefined") return defaultValue;
    
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Remove data from localStorage
 */
export function removeFromStorage(key: string): boolean {
  try {
    if (typeof window === "undefined") return false;
    
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Clear all Smart Meal data from localStorage
 */
export function clearAllStorage(): boolean {
  try {
    if (typeof window === "undefined") return false;
    
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined") return false;
    
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Typed storage functions for specific data

export interface FavoriteRecipe {
  recipeId: string;
  recipeName: string;
  recipeImage: string;
  addedAt: string;
  cuisine: string;
  totalTime: number;
}

export function saveFavorites(favorites: FavoriteRecipe[]): boolean {
  return saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
}

export function loadFavorites(): FavoriteRecipe[] {
  return loadFromStorage<FavoriteRecipe[]>(STORAGE_KEYS.FAVORITES, []);
}

export function saveMealPlan(mealPlan: MealPlan): boolean {
  return saveToStorage(STORAGE_KEYS.MEAL_PLAN, mealPlan);
}

export function loadMealPlan(): MealPlan | null {
  return loadFromStorage<MealPlan | null>(STORAGE_KEYS.MEAL_PLAN, null);
}

export function saveShoppingList(shoppingList: ShoppingList): boolean {
  return saveToStorage(STORAGE_KEYS.SHOPPING_LIST, shoppingList);
}

export function loadShoppingList(): ShoppingList | null {
  return loadFromStorage<ShoppingList | null>(STORAGE_KEYS.SHOPPING_LIST, null);
}

export function saveProfile(profile: UserProfile): boolean {
  return saveToStorage(STORAGE_KEYS.PROFILE, profile);
}

export function loadProfile(): UserProfile {
  const defaultProfile: UserProfile = {
    dailyCalorieGoal: 2000,
    proteinGoal: 150,
    carbGoal: 250,
    fatGoal: 65,
    dietaryRestrictions: [],
    activityLevel: "moderately-active",
    goalType: "maintain",
    preferredCuisines: [],
  };
  
  return loadFromStorage<UserProfile>(STORAGE_KEYS.PROFILE, defaultProfile);
}

export function saveRecentSearches(searches: SearchQuery[]): boolean {
  return saveToStorage(STORAGE_KEYS.RECENT_SEARCHES, searches);
}

export function loadRecentSearches(): SearchQuery[] {
  return loadFromStorage<SearchQuery[]>(STORAGE_KEYS.RECENT_SEARCHES, []);
}

export function saveTheme(theme: "light" | "dark"): boolean {
  return saveToStorage(STORAGE_KEYS.THEME, theme);
}

export function loadTheme(): "light" | "dark" {
  return loadFromStorage<"light" | "dark">(STORAGE_KEYS.THEME, "light");
}
