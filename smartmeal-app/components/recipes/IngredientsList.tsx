"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  substitutions?: string[];
}

interface IngredientsListProps {
  ingredients: Ingredient[];
  servings?: number;
  onServingsChange?: (servings: number) => void;
  availableIngredients?: string[];
}

/**
 * Ingredients list component with checkboxes and substitution suggestions
 */
export function IngredientsList({
  ingredients,
  servings = 4,
  onServingsChange,
  availableIngredients = [],
}: IngredientsListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [showSubstitutions, setShowSubstitutions] = useState<number | null>(null);

  const handleCheck = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  const handleServingsChange = (delta: number) => {
    const newServings = Math.max(1, servings + delta);
    onServingsChange?.(newServings);
  };

  const isAvailable = (ingredientName: string) => {
    return availableIngredients.some((available) =>
      ingredientName.toLowerCase().includes(available.toLowerCase())
    );
  };

  const progress = ingredients.length > 0 
    ? (checkedItems.size / ingredients.length) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ingredients</CardTitle>
          
          {/* Servings Adjuster */}
          <div className="flex items-center gap-3" role="group" aria-label="Adjust servings">
            <span className="text-sm text-muted-foreground">Servings:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleServingsChange(-1)}
                disabled={servings <= 1}
                aria-label="Decrease servings"
              >
                −
              </Button>
              <span className="min-w-[2rem] text-center font-semibold" aria-live="polite">
                {servings}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleServingsChange(1)}
                aria-label="Increase servings"
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {checkedItems.size > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium" aria-live="polite">
                {checkedItems.size} / {ingredients.length}
              </span>
            </div>
            <div 
              className="w-full bg-gray-200 rounded-full h-2"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Ingredients checked"
            >
              <div
                className="bg-success h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ul className="space-y-3" role="list" aria-label="Recipe ingredients">
          {ingredients.map((ingredient, index) => {
            const checked = checkedItems.has(index);
            const available = isAvailable(ingredient.name);

            return (
              <li key={index} className="group" role="listitem">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    id={`ingredient-${index}`}
                    checked={checked}
                    onChange={() => handleCheck(index)}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                    aria-label={`${ingredient.amount} ${ingredient.unit} ${ingredient.name}`}
                  />

                  {/* Ingredient Details */}
                  <label
                    htmlFor={`ingredient-${index}`}
                    className={`flex-1 cursor-pointer ${
                      checked ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {ingredient.amount} {ingredient.unit}
                      </span>
                      <span>{ingredient.name}</span>
                      
                      {/* Availability Badge */}
                      {available && (
                        <Badge variant="success" size="sm" aria-label="You have this ingredient">
                          ✓ Have
                        </Badge>
                      )}
                    </div>

                    {/* Substitutions Button */}
                    {ingredient.substitutions && ingredient.substitutions.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowSubstitutions(
                            showSubstitutions === index ? null : index
                          );
                        }}
                        className="mt-1 text-sm text-primary hover:underline"
                        aria-expanded={showSubstitutions === index}
                        aria-controls={`substitutions-${index}`}
                      >
                        {showSubstitutions === index ? "Hide" : "Show"} substitutions
                      </button>
                    )}
                  </label>
                </div>

                {/* Substitutions Panel */}
                {showSubstitutions === index && ingredient.substitutions && (
                  <div
                    id={`substitutions-${index}`}
                    className="ml-8 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    role="region"
                    aria-label="Ingredient substitutions"
                  >
                    <p className="text-sm font-medium mb-2">Can substitute with:</p>
                    <ul className="space-y-1">
                      {ingredient.substitutions.map((sub, subIndex) => (
                        <li key={subIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary" aria-hidden="true">•</span>
                          <span>{sub}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3" role="group" aria-label="Ingredient actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCheckedItems(new Set(ingredients.map((_, i) => i)))}
            className="flex-1"
            aria-label="Check all ingredients"
          >
            Check All
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCheckedItems(new Set())}
            className="flex-1"
            disabled={checkedItems.size === 0}
            aria-label="Uncheck all ingredients"
          >
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
