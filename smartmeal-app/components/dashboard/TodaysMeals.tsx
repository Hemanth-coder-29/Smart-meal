"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Meal {
  id: string;
  recipeName: string;
  recipeImage?: string;
  mealType: "breakfast" | "lunch" | "dinner";
  calories: number;
  prepTime: number;
  cookTime: number;
}

interface TodaysMealsProps {
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    dinner?: Meal;
  };
  date?: Date;
}

const MEAL_TYPE_CONFIG = {
  breakfast: { icon: "🌅", label: "Breakfast", color: "text-orange-600" },
  lunch: { icon: "☀️", label: "Lunch", color: "text-yellow-600" },
  dinner: { icon: "🌙", label: "Dinner", color: "text-blue-600" },
};

/**
 * Today's meals preview component for dashboard
 */
export function TodaysMeals({ meals, date = new Date() }: TodaysMealsProps) {
  const totalCalories = Object.values(meals).reduce(
    (sum, meal) => sum + (meal?.calories || 0),
    0
  );

  const mealCount = Object.values(meals).filter(Boolean).length;

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Today's Meals</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
          </div>
          {totalCalories > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{totalCalories}</div>
              <div className="text-xs text-muted-foreground">calories</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {mealCount === 0 ? (
          /* Empty State */
          <div className="py-12 text-center">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="text-muted-foreground mb-4">No meals planned for today</p>
            <Button variant="primary" onClick={() => window.location.href = '/planner'}>
              Plan Your Meals
            </Button>
          </div>
        ) : (
          /* Meals List */
          <div className="space-y-4" role="list" aria-label="Today's planned meals">
            {(["breakfast", "lunch", "dinner"] as const).map((mealType) => {
              const meal = meals[mealType];
              const config = MEAL_TYPE_CONFIG[mealType];

              return (
                <div
                  key={mealType}
                  className={`rounded-lg border-2 p-4 transition-all ${
                    meal
                      ? "border-gray-200 bg-white hover:border-primary hover:shadow-md"
                      : "border-dashed border-gray-300 bg-gray-50"
                  }`}
                  role="listitem"
                >
                  <div className="flex items-center gap-4">
                    {/* Meal Type Icon */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl ${
                          meal ? "" : "opacity-50"
                        }`}
                        aria-hidden="true"
                      >
                        {config.icon}
                      </div>
                    </div>

                    {/* Meal Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${config.color}`}>
                          {config.label}
                        </h4>
                        {meal && (
                          <Badge variant="neutral" size="sm">
                            {meal.calories} cal
                          </Badge>
                        )}
                      </div>
                      
                      {meal ? (
                        <>
                          <p className="font-medium text-foreground truncate">
                            {meal.recipeName}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>⏱ {meal.prepTime + meal.cookTime} min</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not planned</p>
                      )}
                    </div>

                    {/* Action Button */}
                    {meal ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.location.href = `/recipes/${meal.id}`}
                        aria-label={`View ${meal.recipeName} recipe`}
                      >
                        View
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = '/planner'}
                        aria-label={`Add ${config.label.toLowerCase()} to meal plan`}
                      >
                        + Add
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        {mealCount > 0 && (
          <div className="mt-6 flex gap-3">
            <Link href="/planner" className="flex-1">
              <Button variant="secondary" className="w-full">
                View Full Week
              </Button>
            </Link>
            <Link href="/shopping-list" className="flex-1">
              <Button variant="primary" className="w-full">
                Shopping List
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
