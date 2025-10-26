import React from "react";
import { RecipeCard } from "./RecipeCard";
import type { Recipe } from "@/types/recipe";

interface RecipeGridProps {
  recipes: Recipe[];
  onViewDetails?: (recipeId: string) => void;
  onAddToMealPlan?: (recipeId: string) => void;
  onToggleFavorite?: (recipeId: string) => void;
  favoriteIds?: string[];
  emptyMessage?: string;
}

export function RecipeGrid({
  recipes,
  onViewDetails,
  onAddToMealPlan,
  onToggleFavorite,
  favoriteIds = [],
  emptyMessage = "No recipes found",
}: RecipeGridProps) {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onViewDetails={onViewDetails}
          onAddToMealPlan={onAddToMealPlan}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favoriteIds.includes(recipe.id)}
        />
      ))}
    </div>
  );
}
