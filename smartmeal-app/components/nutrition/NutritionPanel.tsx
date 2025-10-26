import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Nutrition } from "@/types/recipe";

interface NutritionPanelProps {
  nutrition: Nutrition;
  servings?: number;
  goals?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  };
}

export function NutritionPanel({ nutrition, servings = 1, goals }: NutritionPanelProps) {
  const calculatePercentage = (value: number, goal?: number) => {
    if (!goal) return 0;
    return Math.min(Math.round((value / goal) * 100), 100);
  };

  const nutritionItems = [
    {
      label: "Protein",
      value: nutrition.protein,
      unit: "g",
      goal: goals?.protein,
      color: "bg-blue-500",
    },
    {
      label: "Carbs",
      value: nutrition.carbs,
      unit: "g",
      goal: goals?.carbs,
      color: "bg-yellow-500",
    },
    {
      label: "Fats",
      value: nutrition.fats,
      unit: "g",
      goal: goals?.fats,
      color: "bg-orange-500",
    },
    {
      label: "Fiber",
      value: nutrition.fiber,
      unit: "g",
      goal: 30,
      color: "bg-green-500",
    },
    {
      label: "Sodium",
      value: nutrition.sodium,
      unit: "mg",
      goal: 2300,
      color: "bg-red-500",
    },
    {
      label: "Sugar",
      value: nutrition.sugar,
      unit: "g",
      goal: 50,
      color: "bg-pink-500",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition Facts</CardTitle>
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          Per serving ({servings} serving{servings !== 1 ? "s" : ""})
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" role="region" aria-label="Nutrition information">
          {/* Calories - Featured */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm font-medium">Calories</span>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary" aria-label={`${nutrition.calories} calories`}>
                  {nutrition.calories}
                </span>
                {goals?.calories && (
                  <span className="text-sm text-muted-foreground ml-2" aria-label={`Goal: ${goals.calories} calories`}>
                    / {goals.calories}
                  </span>
                )}
              </div>
            </div>
            {goals?.calories && (
              <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={nutrition.calories} aria-valuemin={0} aria-valuemax={goals.calories} aria-label="Calorie progress">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${calculatePercentage(nutrition.calories, goals.calories)}%`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Macros and Other Nutrients */}
          <div className="space-y-3">
            {nutritionItems.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground" aria-label={`${item.value} ${item.unit} of ${item.label}${item.goal ? ` out of ${item.goal}${item.unit}` : ''}`}>
                    {item.value}
                    {item.unit}
                    {item.goal && ` / ${item.goal}${item.unit}`}
                  </span>
                </div>
                {item.goal && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5" role="progressbar" aria-valuenow={item.value} aria-valuemin={0} aria-valuemax={item.goal} aria-label={`${item.label} progress`}>
                    <div
                      className={`${item.color} h-1.5 rounded-full transition-all`}
                      style={{
                        width: `${calculatePercentage(item.value, item.goal)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Macro Distribution */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Macro Distribution</h4>
            <div className="grid grid-cols-3 gap-2 text-center" role="group" aria-label="Macronutrient distribution">
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-xl font-bold text-blue-600" aria-label={`${Math.round((nutrition.protein * 4 / nutrition.calories) * 100)}% protein`}>
                  {Math.round(
                    (nutrition.protein * 4 / nutrition.calories) * 100
                  )}%
                </div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div className="p-2 bg-yellow-50 rounded">
                <div className="text-xl font-bold text-yellow-600" aria-label={`${Math.round((nutrition.carbs * 4 / nutrition.calories) * 100)}% carbohydrates`}>
                  {Math.round(
                    (nutrition.carbs * 4 / nutrition.calories) * 100
                  )}%
                </div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              <div className="p-2 bg-orange-50 rounded">
                <div className="text-xl font-bold text-orange-600" aria-label={`${Math.round((nutrition.fats * 9 / nutrition.calories) * 100)}% fats`}>
                  {Math.round(
                    (nutrition.fats * 9 / nutrition.calories) * 100
                  )}%
                </div>
                <div className="text-xs text-muted-foreground">Fats</div>
              </div>
            </div>
          </div>

          {/* Health Indicators */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Health Indicators</h4>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Health indicators">
              {nutrition.fiber >= 5 && (
                <Badge variant="success" size="sm" role="listitem">High Fiber</Badge>
              )}
              {nutrition.protein >= 20 && (
                <Badge variant="success" size="sm" role="listitem">High Protein</Badge>
              )}
              {nutrition.sodium <= 500 && (
                <Badge variant="success" size="sm" role="listitem">Low Sodium</Badge>
              )}
              {nutrition.sugar <= 10 && (
                <Badge variant="success" size="sm" role="listitem">Low Sugar</Badge>
              )}
              {nutrition.calories <= 300 && (
                <Badge variant="info" size="sm" role="listitem">Low Calorie</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
