"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MealSlot } from "@/types/mealPlan";
import type { DailyNutrition } from "@/types/nutrition";
import { aggregateNutrition } from "@/lib/nutritionCalculator";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEAL_TIMES = ["Breakfast", "Lunch", "Dinner"] as const;

export default function PlannerPage() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [weekPlan, setWeekPlan] = useState<Record<number, (MealSlot | null)[]>>(
    Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => [
        i,
        Array(3).fill(null) as (MealSlot | null)[],
      ])
    )
  );

  const currentDayMeals = weekPlan[selectedDay] || Array(3).fill(null);
  const dailyNutrition = aggregateNutrition(currentDayMeals);

  const handleRemoveMeal = (dayIndex: number, mealIndex: number) => {
    setWeekPlan((prev) => ({
      ...prev,
      [dayIndex]: prev[dayIndex].map((meal, i) =>
        i === mealIndex ? null : meal
      ),
    }));
  };

  const totalWeeklyCalories = Object.values(weekPlan).reduce((total, day) => {
    const dayNutrition = aggregateNutrition(day);
    return total + dayNutrition.calories;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Meal Planner</h1>
              <p className="text-muted-foreground">
                Plan your week and track nutrition
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost">← Previous Week</Button>
              <Button variant="ghost">This Week</Button>
              <Button variant="ghost">Next Week →</Button>
            </div>
          </div>

          {/* Weekly Overview */}
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day, index) => {
              const dayMeals = weekPlan[index];
              const dayCalories = aggregateNutrition(dayMeals).calories;
              const mealCount = dayMeals.filter((m) => m !== null).length;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(index)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedDay === index
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">{day.slice(0, 3)}</div>
                  <div className="text-xs text-muted-foreground">
                    {mealCount}/3 meals
                  </div>
                  <div className="text-xs font-medium text-primary mt-1">
                    {dayCalories} cal
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Meal Slots */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {DAYS_OF_WEEK[selectedDay]}
              </h2>
              <Button variant="primary">+ Add from Search</Button>
            </div>

            {/* Meal Slots */}
            <div className="space-y-4">
              {MEAL_TIMES.map((mealTime, mealIndex) => {
                const meal = currentDayMeals[mealIndex];

                return (
                  <Card key={mealTime}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{mealTime}</CardTitle>
                        {meal && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveMeal(selectedDay, mealIndex)
                            }
                          >
                            × Remove
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {meal ? (
                        <div className="flex gap-4">
                          <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0">
                            {meal.recipeImage && (
                              <img
                                src={meal.recipeImage}
                                alt={meal.recipeName || ""}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">
                              {meal.recipeName}
                            </h3>
                            <div className="flex gap-4 text-sm text-muted-foreground mb-2">
                              <span>🍽 servings</span>
                              <span>⏱ min</span>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="neutral">
                                {meal.calories} cal
                              </Badge>
                              {meal.macros && (
                                <>
                                  <Badge variant="neutral">
                                    P: {meal.macros.protein}g
                                  </Badge>
                                  <Badge variant="neutral">
                                    C: {meal.macros.carbs}g
                                  </Badge>
                                  <Badge variant="neutral">
                                    F: {meal.macros.fats}g
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <p className="text-muted-foreground mb-3">
                            No meal planned
                          </p>
                          <Button variant="secondary" size="sm">
                            + Add Recipe
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="secondary">
                  📋 Generate Shopping List
                </Button>
                <Button variant="secondary">📤 Export Week</Button>
                <Button variant="secondary">🔄 Copy to Next Week</Button>
                <Button variant="ghost">🗑 Clear This Day</Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Nutrition Summary */}
          <div className="space-y-6">
            {/* Daily Nutrition */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Nutrition</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {DAYS_OF_WEEK[selectedDay]}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <div className="text-4xl font-bold text-primary mb-1">
                      {dailyNutrition.calories}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Calories
                    </div>
                  </div>

                  <NutritionStat
                    label="Protein"
                    value={dailyNutrition.protein}
                    goal={150}
                    unit="g"
                    color="bg-blue-500"
                  />
                  <NutritionStat
                    label="Carbs"
                    value={dailyNutrition.carbs}
                    goal={200}
                    unit="g"
                    color="bg-yellow-500"
                  />
                  <NutritionStat
                    label="Fats"
                    value={dailyNutrition.fats}
                    goal={65}
                    unit="g"
                    color="bg-orange-500"
                  />
                  <NutritionStat
                    label="Fiber"
                    value={dailyNutrition.fiber}
                    goal={30}
                    unit="g"
                    color="bg-green-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Weekly Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Meals
                    </span>
                    <span className="font-semibold">
                      {Object.values(weekPlan).reduce(
                        (count, day) =>
                          count + day.filter((m) => m !== null).length,
                        0
                      )}
                      /21
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Weekly Calories
                    </span>
                    <span className="font-semibold">
                      {totalWeeklyCalories.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Avg Daily Calories
                    </span>
                    <span className="font-semibold">
                      {Math.round(totalWeeklyCalories / 7)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Completion
                    </span>
                    <span className="font-semibold">
                      {Math.round(
                        (Object.values(weekPlan).reduce(
                          (count, day) =>
                            count + day.filter((m) => m !== null).length,
                          0
                        ) /
                          21) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Planning Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Drag recipes from search to meal slots</li>
                  <li>• Click a meal to view details</li>
                  <li>• Copy successful weeks for consistency</li>
                  <li>• Generate shopping lists from your plan</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function NutritionStat({
  label,
  value,
  goal,
  unit,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
}) {
  const percentage = Math.min(Math.round((value / goal) * 100), 100);

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {value}/{goal}
          {unit} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
