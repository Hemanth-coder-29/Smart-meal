"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DetailedRecipe } from "@/types/recipe";

export default function RecipeDetailPage() {
  const params = useParams();
  const recipeId = params.id as string;
  const [recipe, setRecipe] = useState<DetailedRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    new Set()
  );
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    async function loadRecipe() {
      try {
        const response = await fetch("/data/recipes.json");
        const recipes: DetailedRecipe[] = await response.json();
        const found = recipes.find((r) => r.id === recipeId);
        setRecipe(found || null);
      } catch (error) {
        console.error("Failed to load recipe:", error);
      } finally {
        setLoading(false);
      }
    }
    loadRecipe();
  }, [recipeId]);

  const toggleIngredient = (ingredientName: string) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(ingredientName)) {
        next.delete(ingredientName);
      } else {
        next.add(ingredientName);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Recipe Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The recipe you're looking for doesn't exist.
          </p>
          <Button variant="primary" onClick={() => window.location.href = '/search'}>
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const checkedCount = checkedIngredients.size;
  const totalIngredients = recipe.ingredients.length;
  const progress = Math.round((checkedCount / totalIngredients) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => window.location.href = '/search'}>
              ← Back to Search
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost">♡ Save</Button>
              <Button variant="primary">+ Add to Meal Plan</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recipe Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image & Title */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={recipe.image || "/placeholder-recipe.jpg"}
                alt={recipe.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div>
              <h1 className="text-4xl font-bold mb-3">{recipe.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">
                {recipe.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="info">{recipe.cuisine}</Badge>
                <Badge variant="neutral">{recipe.difficulty}</Badge>
                <Badge variant="neutral">{recipe.mealType}</Badge>
                {recipe.dietaryTags.map((tag) => (
                  <Badge key={tag} variant="success">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {recipe.prepTime}
                  </div>
                  <div className="text-sm text-muted-foreground">Prep Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {recipe.cookTime}
                  </div>
                  <div className="text-sm text-muted-foreground">Cook Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {recipe.totalTime}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {recipe.servings}
                  </div>
                  <div className="text-sm text-muted-foreground">Servings</div>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Ingredients</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {checkedCount} of {totalIngredients} checked ({progress}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={`ingredient-${index}`}
                        checked={checkedIngredients.has(ingredient.name)}
                        onChange={() => toggleIngredient(ingredient.name)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor={`ingredient-${index}`}
                        className={`flex-1 cursor-pointer ${
                          checkedIngredients.has(ingredient.name)
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        <span className="font-medium">{ingredient.quantity}</span>{" "}
                        <span className="text-muted-foreground">
                          {ingredient.unit}
                        </span>{" "}
                        {ingredient.name}
                      </label>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-4">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          activeStep === index
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {instruction.step}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`${
                            activeStep === index
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {instruction.text}
                        </p>
                        {instruction.timerDuration && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => setActiveStep(index)}
                          >
                            ⏱ {Math.floor(instruction.timerDuration / 60)} min timer
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Video Embed Placeholder */}
            {recipe.videoId && (
              <Card>
                <CardHeader>
                  <CardTitle>Video Tutorial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${recipe.videoId}`}
                      title={recipe.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Nutrition & Actions */}
          <div className="space-y-6">
            {/* Nutrition Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Facts</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Per serving ({recipe.servings} servings)
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-bold">
                        {recipe.nutrition.calories}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        calories
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <NutritionRow
                      label="Protein"
                      value={recipe.nutrition.protein}
                      unit="g"
                      color="bg-blue-500"
                    />
                    <NutritionRow
                      label="Carbs"
                      value={recipe.nutrition.carbs}
                      unit="g"
                      color="bg-yellow-500"
                    />
                    <NutritionRow
                      label="Fats"
                      value={recipe.nutrition.fats}
                      unit="g"
                      color="bg-orange-500"
                    />
                    <NutritionRow
                      label="Fiber"
                      value={recipe.nutrition.fiber}
                      unit="g"
                      color="bg-green-500"
                    />
                    <NutritionRow
                      label="Sodium"
                      value={recipe.nutrition.sodium}
                      unit="mg"
                      color="bg-red-500"
                    />
                    <NutritionRow
                      label="Sugar"
                      value={recipe.nutrition.sugar}
                      unit="g"
                      color="bg-pink-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cooking Timer Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Cooking Timer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-5xl font-bold mb-4 text-primary">
                    {recipe.cookTime}:00
                  </div>
                  <Button variant="primary" className="w-full mb-2">
                    Start Timer
                  </Button>
                  <Button variant="ghost" className="w-full">
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" className="w-full">
                  📋 Add to Shopping List
                </Button>
                <Button variant="secondary" className="w-full">
                  📤 Share Recipe
                </Button>
                <Button variant="secondary" className="w-full">
                  🖨 Print Recipe
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function NutritionRow({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {value}
          {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: "60%" }} />
      </div>
    </div>
  );
}
