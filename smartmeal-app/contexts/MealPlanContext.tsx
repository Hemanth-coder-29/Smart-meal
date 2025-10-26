"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { MealPlan, MealSlot, DayOfWeek, MealType } from "@/types/mealPlan";

interface MealPlanContextType {
  mealPlan: MealPlan | null;
  updateMealSlot: (day: DayOfWeek, mealType: MealType, meal: MealSlot) => void;
  removeMealSlot: (day: DayOfWeek, mealType: MealType) => void;
  clearDay: (day: DayOfWeek) => void;
  clearWeek: () => void;
  copyToNextWeek: () => void;
  loadMealPlan: () => void;
  saveMealPlan: () => void;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

const STORAGE_KEY = "smartmeal_mealplan";

const createEmptyMealSlot = (): MealSlot => ({
  recipeId: null,
  recipeName: null,
  recipeImage: null,
  calories: null,
  macros: null,
});

const createEmptyWeek = (): MealPlan => {
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
    weekStarting: new Date().toISOString(),
    meals,
    lastUpdated: new Date().toISOString(),
  };
};

export function MealPlanProvider({ children }: { children: React.ReactNode }) {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  useEffect(() => {
    loadMealPlan();
  }, []);

  const loadMealPlan = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMealPlan(parsed);
      } else {
        setMealPlan(createEmptyWeek());
      }
    } catch (error) {
      console.error("Failed to load meal plan:", error);
      setMealPlan(createEmptyWeek());
    }
  };

  const saveMealPlan = () => {
    if (mealPlan) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mealPlan));
      } catch (error) {
        console.error("Failed to save meal plan:", error);
      }
    }
  };

  const updateMealSlot = (day: DayOfWeek, mealType: MealType, meal: MealSlot) => {
    if (!mealPlan) return;

    const updated = {
      ...mealPlan,
      meals: {
        ...mealPlan.meals,
        [day]: {
          ...mealPlan.meals[day],
          [mealType]: meal,
        },
      },
      lastUpdated: new Date().toISOString(),
    };

    setMealPlan(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const removeMealSlot = (day: DayOfWeek, mealType: MealType) => {
    if (!mealPlan) return;

    const updated = {
      ...mealPlan,
      meals: {
        ...mealPlan.meals,
        [day]: {
          ...mealPlan.meals[day],
          [mealType]: createEmptyMealSlot(),
        },
      },
      lastUpdated: new Date().toISOString(),
    };

    setMealPlan(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearDay = (day: DayOfWeek) => {
    if (!mealPlan) return;

    const updated = {
      ...mealPlan,
      meals: {
        ...mealPlan.meals,
        [day]: {
          breakfast: createEmptyMealSlot(),
          lunch: createEmptyMealSlot(),
          dinner: createEmptyMealSlot(),
        },
      },
      lastUpdated: new Date().toISOString(),
    };

    setMealPlan(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearWeek = () => {
    const empty = createEmptyWeek();
    setMealPlan(empty);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
  };

  const copyToNextWeek = () => {
    if (!mealPlan) return;

    const nextWeek: MealPlan = {
      ...mealPlan,
      weekStarting: new Date(
        new Date(mealPlan.weekStarting).getTime() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    setMealPlan(nextWeek);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextWeek));
  };

  return (
    <MealPlanContext.Provider
      value={{
        mealPlan,
        updateMealSlot,
        removeMealSlot,
        clearDay,
        clearWeek,
        copyToNextWeek,
        loadMealPlan,
        saveMealPlan,
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
