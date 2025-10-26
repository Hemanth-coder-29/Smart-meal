import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@/types/recipe";
import Image from "next/image";

interface RecipeCardProps {
  recipe: Recipe;
  onViewDetails?: (recipeId: string) => void;
  onAddToMealPlan?: (recipeId: string) => void;
  onToggleFavorite?: (recipeId: string) => void;
  isFavorite?: boolean;
}

export function RecipeCard({
  recipe,
  onViewDetails,
  onAddToMealPlan,
  onToggleFavorite,
  isFavorite = false,
}: RecipeCardProps) {
  const matchPercentage = recipe.matchPercentage || 0;
  const hasMatch = matchPercentage > 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col" role="article" aria-labelledby={`recipe-title-${recipe.id}`}>
      {/* Image Section */}
      <div className="relative aspect-video bg-gray-100">
        <Image
          src={recipe.image || "/placeholder-recipe.jpg"}
          alt={`${recipe.title} recipe photo`}
          fill
          className="object-cover"
        />
        
        {/* Match Percentage Badge */}
        {hasMatch && (
          <div className="absolute top-3 left-3">
            <Badge
              variant={
                matchPercentage >= 80
                  ? "success"
                  : matchPercentage >= 50
                  ? "warning"
                  : "neutral"
              }
              className="text-lg font-bold"
              aria-label={`${matchPercentage}% ingredient match`}
            >
              {matchPercentage}% Match
            </Badge>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(recipe.id);
          }}
          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <span className={`text-xl ${isFavorite ? "text-red-500" : "text-gray-400"}`}>
            {isFavorite ? "♥" : "♡"}
          </span>
        </button>
      </div>

      {/* Content Section */}
      <CardHeader className="flex-grow">
        <CardTitle id={`recipe-title-${recipe.id}`} className="line-clamp-2 text-lg">
          {recipe.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-2" role="list" aria-label="Recipe tags">
          <Badge variant="info" size="sm" role="listitem">{recipe.cuisine}</Badge>
          <Badge
            variant={
              recipe.difficulty === "Easy"
                ? "success"
                : recipe.difficulty === "Medium"
                ? "warning"
                : "neutral"
            }
            size="sm"
            role="listitem"
          >
            {recipe.difficulty}
          </Badge>
          <Badge variant="neutral" size="sm" role="listitem">{recipe.mealType}</Badge>
        </div>

        {/* Time Info */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm" role="group" aria-label="Recipe timing information">
          <div>
            <div className="font-semibold text-primary" aria-label="Preparation time">{recipe.prepTime}m</div>
            <div className="text-xs text-muted-foreground">Prep</div>
          </div>
          <div>
            <div className="font-semibold text-primary" aria-label="Cooking time">{recipe.cookTime}m</div>
            <div className="text-xs text-muted-foreground">Cook</div>
          </div>
          <div>
            <div className="font-semibold text-primary" aria-label="Number of servings">{recipe.servings}</div>
            <div className="text-xs text-muted-foreground">Servings</div>
          </div>
        </div>

        {/* Ingredients Match Info */}
        {hasMatch && recipe.availableIngredients && recipe.missingIngredients && (
          <div className="text-xs space-y-1" role="status" aria-live="polite">
            <div className="text-green-600">
              <span aria-hidden="true">✓</span> {recipe.availableIngredients.length} ingredients you have
            </div>
            {recipe.missingIngredients.length > 0 && (
              <div className="text-orange-600">
                <span aria-hidden="true">⚠</span> {recipe.missingIngredients.length} ingredients needed
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2" role="group" aria-label="Recipe actions">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails?.(recipe.id)}
            aria-label={`View ${recipe.title} recipe details`}
          >
            View Recipe
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onAddToMealPlan?.(recipe.id)}
            aria-label={`Add ${recipe.title} to meal plan`}
          >
            + Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
