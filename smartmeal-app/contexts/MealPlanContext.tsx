"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { MealPlan, MealSlot, DayOfWeek, MealType } from "@/types/mealPlan";
import logger from "@/lib/debug"; // Import the logger

// --- NEW HELPER FUNCTIONS ---

/**
 * Gets the date for the Monday of a given week.
 * @param date The date to find the week for.
 * @returns A string in YYYY-MM-DD format.
 */
const getStartOfWeek = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay(); // Sunday - 0, Monday - 1, ...
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0); // Set to midnight
    return d.toISOString().split('T')[0]; // Return YYYY-MM-DD
};

/**
 * Gets the start date of the week, 7 days in the future.
 * @param weekKey The current week start date (YYYY-MM-DD)
 */
const getNextWeekKey = (weekKey: string): string => {
    const d = new Date(weekKey);
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
};

/**
 * Gets the start date of the week, 7 days in the past.
 * @param weekKey The current week start date (YYYY-MM-DD)
 */
const getPrevWeekKey = (weekKey: string): string => {
    const d = new Date(weekKey);
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
};

// --- END NEW HELPER FUNCTIONS ---


interface MealPlanContextType {
  currentMealPlan: MealPlan | null; // The plan for the selected week
  currentWeekStart: string; // The YYYY-MM-DD key for the current week
  isPastWeek: boolean; // Flag for read-only state
  navigateToNextWeek: () => void;
  navigateToPrevWeek: () => void;
  navigateToThisWeek: () => void;
  updateMealSlot: (day: DayOfWeek, mealType: MealType, meal: MealSlot) => void;
  removeMealSlot: (day: DayOfWeek, mealType: MealType) => void;
  clearDay: (day: DayOfWeek) => void;
  clearWeek: () => void;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

// --- MODIFIED --- Storage key now holds ALL plans
const STORAGE_KEY = "smartmeal_all_mealplans";

const createEmptyMealSlot = (): MealSlot => ({
  recipeId: null,
  recipeName: null,
  recipeImage: null,
  calories: null,
  macros: null,
});

// --- MODIFIED --- Now takes a date to create a plan for that specific week
const createEmptyWeek = (weekStartDate: string): MealPlan => {
  const days: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const meals: any = {};
  
  days.forEach((day) => {
    meals[day] = {
      breakfast: createEmptyMealSlot(),
      lunch: createEmptyMealSlot(),
      dinner: createEmptyMealSlot(),
    };
  });

  return {
    weekStarting: weekStartDate,
    meals,
    lastUpdated: new Date().toISOString(),
  };
};

export function MealPlanProvider({ children }: { children: React.ReactNode }) {
  // --- MODIFIED --- State now holds all plans and the current week's key
  const [allMealPlans, setAllMealPlans] = useState<{ [weekKey: string]: MealPlan }>({});
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(() => getStartOfWeek(new Date()));

  useEffect(() => {
    loadAllMealPlans();
  }, []);

  const loadAllMealPlans = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let plans = {};
      if (stored) {
        plans = JSON.parse(stored);
      }
      setAllMealPlans(plans);
      logger.info('MealPlanContext:Load', `Loaded ${Object.keys(plans).length} meal plans from storage.`);
    } catch (error) {
      logger.error("MealPlanContext:Load", "Failed to load meal plans, setting empty state.", {}, error instanceof Error ? error : undefined);
      setAllMealPlans({});
    }
  };

  const saveAllMealPlans = (updatedPlans: { [weekKey: string]: MealPlan }) => {
     try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
        logger.debug('MealPlanContext:Save', `Saved ${Object.keys(updatedPlans).length} total plans.`);
      } catch (error) {
        logger.error("MealPlanContext:Save", "Failed to save meal plans.", {}, error instanceof Error ? error : undefined);
      }
  };

  // --- NEW --- Navigation Functions
  const navigateToNextWeek = () => {
    setCurrentWeekStart(prevKey => getNextWeekKey(prevKey));
    logger.info('MealPlanContext:Navigate', 'Navigated to next week');
  };

  const navigateToPrevWeek = () => {
    setCurrentWeekStart(prevKey => getPrevWeekKey(prevKey));
     logger.info('MealPlanContext:Navigate', 'Navigated to previous week');
  };
  
  const navigateToThisWeek = () => {
    setCurrentWeekStart(getStartOfWeek(new Date()));
    logger.info('MealPlanContext:Navigate', 'Navigated to current week');
  };
  
  // --- MODIFIED --- All functions now operate on the `currentWeekStart`
  const updateMealSlot = (day: DayOfWeek, mealType: MealType, meal: MealSlot) => {
    const planToUpdate = allMealPlans[currentWeekStart] || createEmptyWeek(currentWeekStart);

    const updatedPlan = {
      ...planToUpdate,
      meals: {
        ...planToUpdate.meals,
        [day]: {
          ...planToUpdate.meals[day],
          [mealType]: meal,
        },
      },
      lastUpdated: new Date().toISOString(),
    };

    const updatedPlans = { ...allMealPlans, [currentWeekStart]: updatedPlan };
    setAllMealPlans(updatedPlans);
    saveAllMealPlans(updatedPlans);
    logger.debug('MealPlanContext:Update', `Updated slot ${day} ${mealType} for week ${currentWeekStart}`);
  };

  const removeMealSlot = (day: DayOfWeek, mealType: MealType) => {
    updateMealSlot(day, mealType, createEmptyMealSlot());
  };

  const clearDay = (day: DayOfWeek) => {
    const planToUpdate = allMealPlans[currentWeekStart] || createEmptyWeek(currentWeekStart);

    const updatedPlan = {
      ...planToUpdate,
      meals: {
        ...planToUpdate.meals,
        [day]: {
          breakfast: createEmptyMealSlot(),
          lunch: createEmptyMealSlot(),
          dinner: createEmptyMealSlot(),
        },
      },
      lastUpdated: new Date().toISOString(),
    };
    
    const updatedPlans = { ...allMealPlans, [currentWeekStart]: updatedPlan };
    setAllMealPlans(updatedPlans);
    saveAllMealPlans(updatedPlans);
     logger.info('MealPlanContext:ClearDay', `Cleared day ${day} for week ${currentWeekStart}`);
  };

  const clearWeek = () => {
    const updatedPlan = createEmptyWeek(currentWeekStart);
    const updatedPlans = { ...allMealPlans, [currentWeekStart]: updatedPlan };
    
    setAllMealPlans(updatedPlans);
    saveAllMealPlans(updatedPlans);
    logger.info('MealPlanContext:ClearWeek', `Cleared all meals for week ${currentWeekStart}`);
  };

  // --- DERIVED STATE ---
  // Find the current plan, or create an empty one if it doesn't exist (e.g., for a new week)
  const currentMealPlan = allMealPlans[currentWeekStart] || createEmptyWeek(currentWeekStart);
  
  // Check if the currently viewed week is in the past
  const isPastWeek = currentWeekStart < getStartOfWeek(new Date());


  return (
    <MealPlanContext.Provider
      value={{
        currentMealPlan,
        currentWeekStart,
        isPastWeek,
        navigateToNextWeek,
        navigateToPrevWeek,
        navigateToThisWeek,
        updateMealSlot,
        removeMealSlot,
        clearDay,
        clearWeek,
      }}
    >
      {children}
    </MealPlanContext.Provider>
  );
}

export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (context === undefined) {
    throw new Error("useMealPlan must be used within a MealPlanProvider");
  }
  return context;
}