"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Recipe {
  id: string;
  title: string;
  image?: string;
  cuisine: string;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  calories: number;
  matchReason?: string;
}

interface SmartSuggestionsProps {
  recipes: Recipe[];
  onAddToMealPlan?: (recipeId: string) => void;
}

/**
 * Smart recipe suggestions carousel component
 */
export function SmartSuggestions({ recipes, onAddToMealPlan }: SmartSuggestionsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? recipes.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === recipes.length - 1 ? 0 : prev + 1));
  };

  if (recipes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <div className="text-5xl mb-4">🤖</div>
            <p className="text-muted-foreground">
              No suggestions available. Start by adding some favorites!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentRecipe = recipes[currentIndex];
  const visibleRecipes = [
    recipes[(currentIndex - 1 + recipes.length) % recipes.length],
    currentRecipe,
    recipes[(currentIndex + 1) % recipes.length],
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Smart Suggestions</span>
              <span className="text-2xl" aria-hidden="true">🤖</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Personalized recommendations based on your preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              aria-label="Previous suggestion"
            >
              ←
            </Button>
            <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
              {currentIndex + 1} / {recipes.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              aria-label="Next suggestion"
            >
              →
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Carousel */}
        <div className="relative overflow-hidden">
          <div className="flex gap-4 transition-transform duration-300">
            {visibleRecipes.map((recipe, idx) => {
              const isCenter = idx === 1;
              return (
                <div
                  key={`${recipe.id}-${idx}`}
                  className={`flex-shrink-0 transition-all duration-300 ${
                    isCenter ? "w-full opacity-100" : "w-0 opacity-0 overflow-hidden"
                  }`}
                  aria-hidden={!isCenter}
                >
                  <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
                    {/* Recipe Image */}
                    {recipe.image && (
                      <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Match Reason Badge */}
                    {recipe.matchReason && (
                      <Badge variant="success" size="sm" className="mb-3">
                        ✨ {recipe.matchReason}
                      </Badge>
                    )}

                    {/* Recipe Title */}
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">
                      {recipe.title}
                    </h3>

                    {/* Recipe Meta */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="info" size="sm">{recipe.cuisine}</Badge>
                      <Badge
                        variant={
                          recipe.difficulty === "Easy"
                            ? "success"
                            : recipe.difficulty === "Medium"
                            ? "warning"
                            : "neutral"
                        }
                        size="sm"
                      >
                        {recipe.difficulty}
                      </Badge>
                    </div>

                    {/* Time & Calories */}
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/50 rounded-lg">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {recipe.prepTime + recipe.cookTime}m
                        </div>
                        <div className="text-xs text-muted-foreground">Total Time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {recipe.calories}
                        </div>
                        <div className="text-xs text-muted-foreground">Calories</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={() => window.location.href = `/recipes/${recipe.id}`}
                      >
                        View Recipe
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => onAddToMealPlan?.(recipe.id)}
                        aria-label={`Add ${recipe.title} to meal plan`}
                      >
                        + Add to Plan
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Recipe suggestions">
          {recipes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-primary w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              role="tab"
              aria-label={`Go to suggestion ${idx + 1}`}
              aria-selected={idx === currentIndex}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
