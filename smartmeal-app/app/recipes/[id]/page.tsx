// smartmeal-app/app/recipes/[id]/page.tsx
"use client";

// Import React hooks, including useRef
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation"; // Import useRouter
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DetailedRecipe } from "@/types/recipe";
import { LoadingScreen } from "@/components/common/Loading"; // Assuming you have this
import { NotFoundError } from "@/components/common/ErrorMessage"; // Assuming you have this
import { useFavorites } from "@/contexts/FavoritesContext"; // Import useFavorites
import { useMealPlan } from "@/contexts/MealPlanContext"; // Import useMealPlan
import logger from "@/lib/debug"; // Import logger
import type { DayOfWeek, MealType, MealSlot } from "@/types/mealPlan"; // Import Meal Plan types

// --- AddToPlanModal Component ---
// We define this helper component within the same file for simplicity

interface AddToPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: DetailedRecipe; // Pass the full recipe
  onAddToPlan: (day: DayOfWeek, mealType: MealType, mealSlot: MealSlot) => void;
}

// Constants for the modal selectors
const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const MEAL_TIMES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];

function AddToPlanModal({ isOpen, onClose, recipe, onAddToPlan }: AddToPlanModalProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday");
  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Basic Escape key handling
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleAddClick = () => {
    // Construct the MealSlot data
    const newMealSlot: MealSlot = {
      recipeId: recipe.id,
      recipeName: recipe.title,
      recipeImage: recipe.image || null,
      calories: recipe.nutrition?.calories ?? null,
      macros: recipe.nutrition ? {
        protein: recipe.nutrition.protein,
        carbs: recipe.nutrition.carbs,
        fats: recipe.nutrition.fats,
      } : null,
    };
    onAddToPlan(selectedDay, selectedMealType, newMealSlot);
    onClose(); // Close modal after adding
  };

  if (!isOpen) return null;

  return (
    // Simple Modal Structure
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose} // Close on backdrop click
      role="dialog"
      aria-modal="true"
      aria-labelledby="addToPlanTitle"
    >
      <div
        ref={modalRef}
        className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="addToPlanTitle" className="text-xl font-semibold">Add "{recipe.title}" to Meal Plan</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">✕</Button>
        </div>

        <div className="space-y-4">
          {/* Day Selector */}
          <div>
            <label htmlFor="daySelect" className="block text-sm font-medium mb-1 text-muted-foreground">Select Day:</label>
            <select
              id="daySelect"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {DAYS_OF_WEEK.map(day => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
          </div>

          {/* Meal Type Selector */}
          <div>
            <label htmlFor="mealTypeSelect" className="block text-sm font-medium mb-1 text-muted-foreground">Select Meal:</label>
            <select
              id="mealTypeSelect"
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value as MealType)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {MEAL_TIMES.map(meal => (
                <option key={meal.value} value={meal.value}>{meal.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleAddClick}>Add Meal</Button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter(); // Initialize router
  const recipeId = params.id as string;
  const [recipe, setRecipe] = useState<DetailedRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isAddToPlanModalOpen, setIsAddToPlanModalOpen] = useState(false); // State for modal

  // Get favorite functions and state
  const { toggleFavorite, isFavorite } = useFavorites();
  const { updateMealSlot } = useMealPlan(); // Get function for adding to meal plan

  // Check if the current recipe is favorited
  const isCurrentFavorite = recipe ? isFavorite(recipe.id) : false;

  useEffect(() => {
    async function loadRecipe() {
      setLoading(true); // Ensure loading starts
      logger.info('RecipeDetail:Load', `Attempting to load recipe with ID: ${recipeId}`);
      try {
        // Fetch specific recipe via API route
        const response = await fetch(`/api/recipes/${recipeId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setRecipe(null); // Explicitly set to null if not found
            logger.warn('RecipeDetail:Load', `Recipe not found via API: ${recipeId}`);
          } else {
            const errorData = await response.json().catch(() => ({ error: `API Error: ${response.status} ${response.statusText}` }));
            logger.error('RecipeDetail:Load', `API error fetching recipe ${recipeId}`, { status: response.status }, new Error(errorData.error));
            throw new Error(errorData.error || `API Error: ${response.status}`);
          }
        } else {
          const data = await response.json();
          if (data && data.recipe) {
            setRecipe(data.recipe);
            logger.info('RecipeDetail:Load', `Recipe loaded successfully: ${recipeId}`);
          } else {
            setRecipe(null); // Handle cases where response is ok but no recipe data
            logger.warn('RecipeDetail:Load', `API response OK but no recipe data found for: ${recipeId}`);
          }
        }
      } catch (error) {
        logger.error('RecipeDetail:Load', 'Failed to load recipe due to fetch/parse error', { recipeId }, error instanceof Error ? error : undefined);
        setRecipe(null); // Set recipe to null on error
      } finally {
        setLoading(false);
      }
    }

    if (recipeId) { // Only load if recipeId is available
      loadRecipe();
    } else {
      logger.warn('RecipeDetail:Load', 'No recipe ID found in params.');
      setLoading(false); // No ID, stop loading
      setRecipe(null);
    }
  }, [recipeId]); // Dependency array includes recipeId

  // --- Ingredient Check Logic ---
  const toggleIngredient = (ingredientName: string) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(ingredientName)) {
        next.delete(ingredientName);
      } else {
        next.add(ingredientName);
      }
      logger.debug('RecipeDetail:Ingredients', `Toggled ingredient: ${ingredientName}, Checked: ${next.size}/${recipe?.ingredients.length || 0}`);
      return next;
    });
  };

  // --- Handler for Favorite button ---
  const handleToggleFavorite = () => {
    if (recipe) {
      toggleFavorite(recipe.id);
      logger.info('RecipeDetail:Favorite', `Toggled favorite status for ${recipe.id}. New status: ${!isCurrentFavorite}`);
    } else {
      logger.warn('RecipeDetail:Favorite', 'Attempted to toggle favorite on null recipe');
    }
  };

  // --- Updated handler to OPEN MODAL ---
  const handleAddToMealPlan = () => {
    if (recipe) {
      setIsAddToPlanModalOpen(true); // Open the modal
      logger.info('RecipeDetail:MealPlan', `Opening Add to Plan modal for ${recipe.id}`);
    } else {
      logger.warn('RecipeDetail:MealPlan', 'Attempted to add null recipe to meal plan');
    }
  };

  // --- Handler for MODAL CONFIRMATION ---
  const handleConfirmAddToPlan = (day: DayOfWeek, mealType: MealType, mealSlot: MealSlot) => {
    updateMealSlot(day, mealType, mealSlot); // Call context function
    logger.info('RecipeDetail:MealPlan', `Added ${mealSlot.recipeId} to ${day} ${mealType}`);
    // Optional: Show a success toast notification here
    alert(`${recipe?.title} added to ${day}'s ${mealType}!`); // Simple feedback
  };

  // --- Loading State ---
  if (loading) {
    return <LoadingScreen message="Loading recipe..." />;
  }

  // --- Not Found State ---
  if (!recipe) {
    return <NotFoundError resourceType="Recipe" resourceId={recipeId} />;
  }

  // --- Calculate Progress (Using State) ---
  const checkedCount = checkedIngredients.size;
  const totalIngredients = recipe.ingredients.length;
  const progress = totalIngredients > 0 ? Math.round((checkedCount / totalIngredients) * 100) : 0;
  // Note: activeStep state management logic would go here if you implement step-by-step interaction

  // --- Render Recipe Details ---
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()}> {/* Use router.back() */}
              ← Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleToggleFavorite}
                aria-pressed={isCurrentFavorite}
              >
                {isCurrentFavorite ? '❤️ Saved' : '♡ Save'}
              </Button>
              <Button variant="primary" onClick={handleAddToMealPlan}>
                + Add to Meal Plan
              </Button>
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
                src={recipe.image || "/images/placeholder-recipe.png"} // Corrected path
                alt={recipe.title}
                fill
                className="object-cover"
                priority // Load main image quickly
                onError={(e) => { // Handle potential image load errors
                  logger.warn('RecipeDetail:Image', `Failed to load image: ${recipe.image || "/images/placeholder-recipe.png"}`);
                  (e.target as HTMLImageElement).src = "/images/placeholder-recipe.png"; // Fallback
                }}
              />
            </div>

            <div>
              <h1 className="text-4xl font-bold mb-3">{recipe.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">
                {recipe.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="info">{recipe.cuisine}</Badge>
                <Badge
                  variant={
                    recipe.difficulty === "Easy"
                      ? "success"
                      : recipe.difficulty === "Medium"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {recipe.difficulty}
                </Badge>
                <Badge variant="neutral">{recipe.mealType}</Badge>
                {recipe.dietaryTags?.map((tag) => ( // Add optional chaining
                  <Badge key={tag} variant="success">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-4 text-center border-t border-b py-4 my-4">
                <div>
                  <div className="text-2xl font-bold text-primary">{recipe.prepTime || '-'}m</div>
                  <div className="text-sm text-muted-foreground">Prep Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{recipe.cookTime || '-'}m</div>
                  <div className="text-sm text-muted-foreground">Cook Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{recipe.totalTime || '-'}m</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{recipe.servings || '-'}</div>
                  <div className="text-sm text-muted-foreground">Servings</div>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Ingredients</CardTitle>
                  <span className="text-sm text-muted-foreground" aria-live="polite">
                    {checkedCount} of {totalIngredients} checked ({progress}%)
                  </span>
                </div>
                {totalIngredients > 0 && ( // Only show progress if ingredients exist
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                      aria-hidden="true"
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {totalIngredients > 0 ? (
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={`${ingredient.name}-${index}`} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id={`ingredient-${index}`}
                          checked={checkedIngredients.has(ingredient.name)}
                          onChange={() => toggleIngredient(ingredient.name)}
                          className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer flex-shrink-0"
                          aria-labelledby={`ingredient-label-${index}`}
                        />
                        <label
                          id={`ingredient-label-${index}`}
                          htmlFor={`ingredient-${index}`}
                          className={`flex-1 cursor-pointer ${checkedIngredients.has(ingredient.name)
                              ? "line-through text-muted-foreground"
                              : ""
                            }`}
                        >
                          <span className="font-medium">{ingredient.quantity}</span>{" "}
                          <span className="text-muted-foreground">
                            {ingredient.unit}
                          </span>{" "}
                          {ingredient.name}
                          {ingredient.substitutions && ingredient.substitutions.length > 0 && (
                            <span className="text-xs text-blue-500 ml-2">(subs available)</span>
                          )}
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No ingredients listed for this recipe.</p>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  <ol className="space-y-4">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={instruction.step} className="flex gap-4 items-start">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${activeStep === index
                              ? "bg-primary text-white border-primary" // Active step
                              : "bg-gray-100 text-gray-600 border-gray-300" // Inactive step
                            }`}
                        >
                          {instruction.step}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p
                            className={`${activeStep === index
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                              }`}
                          >
                            {instruction.text}
                          </p>
                          {/* Simple Timer display (Full timer component would replace this) */}
                          {instruction.timerDuration && (
                            <Badge variant="neutral" size="sm" className="mt-2">
                              ⏱ {Math.floor(instruction.timerDuration / 60)} min
                            </Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-muted-foreground">No instructions provided for this recipe.</p>
                )}
              </CardContent>
            </Card>

            {/* Video Embed */}
            {recipe.videoId && (
              <Card>
                <CardHeader>
                  <CardTitle>Video Tutorial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube-nocookie.com/embed/${recipe.videoId}`} // Use nocookie domain
                      title={recipe.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy" // Lazy load the iframe
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div> {/* End Left Column */}

          {/* Right Column - Nutrition & Actions */}
          <div className="space-y-6 lg:sticky lg:top-24 self-start"> {/* Sticky column */}

            {/* Nutrition Panel */}
            {recipe.nutrition ? (
              <Card>
                <CardHeader>
                  <CardTitle>Nutrition Facts</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Per serving ({recipe.servings} servings)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Calories */}
                    <div className="border-b pb-3 text-center">
                      <div className="text-4xl font-bold text-primary mb-1">
                        {recipe.nutrition.calories}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Calories
                      </div>
                    </div>
                    {/* Other Nutrients */}
                    <div className="space-y-2">
                      <NutritionRow label="Protein" value={recipe.nutrition.protein} unit="g" color="bg-blue-500" goal={50} /> {/* Example Goal */}
                      <NutritionRow label="Carbs" value={recipe.nutrition.carbs} unit="g" color="bg-yellow-500" goal={300} /> {/* Example Goal */}
                      <NutritionRow label="Fats" value={recipe.nutrition.fats} unit="g" color="bg-orange-500" goal={70} /> {/* Example Goal */}
                      <NutritionRow label="Fiber" value={recipe.nutrition.fiber} unit="g" color="bg-green-500" goal={30} /> {/* Example Goal */}
                      <NutritionRow label="Sodium" value={recipe.nutrition.sodium} unit="mg" color="bg-red-500" goal={2300} /> {/* Example Goal */}
                      <NutritionRow label="Sugar" value={recipe.nutrition.sugar} unit="g" color="bg-pink-500" goal={50} /> {/* Example Goal */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader><CardTitle>Nutrition Facts</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Nutrition information not available.</p></CardContent>
              </Card>
            )}


            {/* Cooking Timer (Placeholder/Simple Display) */}
            {recipe.cookTime > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Cooking Timer</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Replace this with the actual CookingTimer component if available */}
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold mb-4 text-primary">
                      {recipe.cookTime}:00
                    </div>
                    <Button variant="primary" className="w-full mb-2" disabled> {/* Disabled for now */}
                      Start Cook Timer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}


            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" className="w-full" disabled> {/* Placeholder */}
                  📋 Add to Shopping List
                </Button>
                <Button variant="secondary" className="w-full" disabled> {/* Placeholder */}
                  📤 Share Recipe
                </Button>
                <Button variant="secondary" className="w-full" disabled> {/* Placeholder */}
                  🖨 Print Recipe
                </Button>
              </CardContent>
            </Card>
          </div> {/* End Right Column */}
        </div>
      </div>

      {/* --- RENDER THE MODAL --- */}
      {/* It will only be visible when isAddToPlanModalOpen is true */}
      {/* We check for 'recipe' being non-null before rendering to prevent errors */}
      {recipe && (
        <AddToPlanModal
          isOpen={isAddToPlanModalOpen}
          onClose={() => setIsAddToPlanModalOpen(false)}
          recipe={recipe} // Pass the loaded recipe data
          onAddToPlan={handleConfirmAddToPlan} // Pass the handler function
        />
      )}
    </div>
  );
}

// Simple Nutrition Row Component (adjust as needed)
function NutritionRow({
  label,
  value,
  unit,
  color,
  goal
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  goal?: number; // Optional goal for progress bar
}) {
  const percentage = goal && goal > 0 ? Math.min(Math.round((value / goal) * 100), 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {value}{unit} {goal ? `(${percentage}%)` : ''}
        </span>
      </div>
      {goal && goal > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`${color} h-1.5 rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}