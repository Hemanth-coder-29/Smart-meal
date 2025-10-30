"use client";

import { useState, useEffect } from "react";
// --- Add necessary imports ---
import { useRouter, useSearchParams } from 'next/navigation'; //
import { useMealPlan } from "@/contexts/MealPlanContext"; //
import type { MealSlot, DayOfWeek, MealType } from "@/types/mealPlan"; //
import type { Recipe, DetailedRecipe } from "@/types/recipe"; // Import DetailedRecipe
// --- Keep existing imports ---
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; //
import { Button } from "@/components/ui/button"; //
import { Badge } from "@/components/ui/badge"; //
import Image from "next/image"; //
import logger from "@/lib/debug"; // Optional: Add logging

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Recipe[]>([]); // Keep state for favorite recipes (using basic Recipe type for display)
  const [allRecipes, setAllRecipes] = useState<DetailedRecipe[]>([]); // Add state for all recipe details (needed for MealSlot)
  const [loading, setLoading] = useState(true); //
  const [filterCuisine, setFilterCuisine] = useState<string>("All"); //
  const [filterDifficulty, setFilterDifficulty] = useState<string>("All"); //

  // --- Get router, searchParams and context functions ---
  const router = useRouter(); //
  const searchParams = useSearchParams(); //
  const { updateMealSlot } = useMealPlan(); //

  // Check if we are in "add to plan" mode by reading URL params
  const targetDay = searchParams.get('targetDay') as DayOfWeek | null; //
  const targetMeal = searchParams.get('targetMeal') as MealType | null; //
  const isAddingToPlanMode = !!(targetDay && targetMeal); // True if both params exist

  useEffect(() => {
    async function loadData() {
      setLoading(true); //
      try {
        // Load favorite IDs from localStorage
        const stored = localStorage.getItem("smartmeal_favorites"); //
        const favoriteIds: string[] = stored ? JSON.parse(stored) : []; //

        if (favoriteIds.length === 0) {
          setLoading(false); //
          setAllRecipes([]); // Ensure allRecipes is empty if no favorites
          return;
        }

        // Load full recipe data (needed for nutrition details when adding to plan)
        const response = await fetch("/data/recipes.json"); // Fetch detailed recipes
        if (!response.ok) throw new Error("Failed to load recipes.json"); // Add error check
        const loadedAllRecipes: DetailedRecipe[] = await response.json(); //
        setAllRecipes(loadedAllRecipes); // Store all detailed recipes

        // Filter favorite recipes from the full list
        const favoriteDetailedRecipes = loadedAllRecipes.filter((r) =>
          favoriteIds.includes(r.id) //
        );
        // Map DetailedRecipe to the basic Recipe type for display in cards if needed
        const favoriteDisplayRecipes = favoriteDetailedRecipes.map(dr => ({
            id: dr.id, //
            title: dr.title, //
            image: dr.image, //
            prepTime: dr.prepTime, //
            cookTime: dr.cookTime, //
            totalTime: dr.totalTime, //
            servings: dr.servings, //
            difficulty: dr.difficulty, //
            mealType: dr.mealType, //
            cuisine: dr.cuisine, //
             // Add matchPercentage if your RecipeCard uses it, default to 0
            matchPercentage: 0,
            // availableIngredients/missingIngredients are usually from search, omit here
        }));
        setFavorites(favoriteDisplayRecipes); // Set the display list

      } catch (error) {
        logger.error("FavoritesPage:Load", "Failed to load favorites or recipes", {}, error instanceof Error ? error : undefined); //
      } finally {
        setLoading(false); //
      }
    }
    loadData();
  }, []); // Run once on mount

  // --- New Handler for Clicking a Recipe Card ---
  const handleRecipeClick = (recipeId: string) => {
    if (isAddingToPlanMode && targetDay && targetMeal) {
        // Find the full details of the selected favorite recipe from allRecipes state
        const selectedRecipeDetails = allRecipes.find(r => r.id === recipeId); //

        if (!selectedRecipeDetails) {
            logger.error("FavoritesPage:AddPlan", `Could not find details for recipe ID: ${recipeId}`); //
            alert("Error: Could not find recipe details."); //
            return;
        }

        // Create MealSlot using DetailedRecipe info
        const newMealSlot: MealSlot = {
            recipeId: selectedRecipeDetails.id, //
            recipeName: selectedRecipeDetails.title, //
            recipeImage: selectedRecipeDetails.image || null, //
            // Use optional chaining and nullish coalescing for safety
            calories: selectedRecipeDetails.nutrition?.calories ?? null, //
            macros: selectedRecipeDetails.nutrition ? {
                protein: selectedRecipeDetails.nutrition.protein, //
                carbs: selectedRecipeDetails.nutrition.carbs, //
                fats: selectedRecipeDetails.nutrition.fats, //
            } : null,
        };

        // Update the meal plan using context function
        updateMealSlot(targetDay, targetMeal, newMealSlot); //
        logger.info("FavoritesPage:AddPlan", `Added ${recipeId} to ${targetDay} ${targetMeal}`); //

        // Navigate back to the planner, passing the day to potentially focus it
        router.push(`/planner?returnDay=${targetDay}`); //

    } else {
      // Default behavior: Navigate to recipe details page
      router.push(`/recipes/${recipeId}`); //
    }
  };


  const removeFavorite = (recipeId: string) => {
    // Keep existing removeFavorite logic...
    const updated = favorites.filter((r) => r.id !== recipeId); //
    setFavorites(updated); //
    const favoriteIds = updated.map((r) => r.id); //
    localStorage.setItem("smartmeal_favorites", JSON.stringify(favoriteIds)); //
    logger.info("FavoritesPage:RemoveFav", `Removed ${recipeId} from favorites`); //
  };

  const clearAll = () => {
    // Keep existing clearAll logic...
    if (confirm("Are you sure you want to clear all favorites?")) { //
      setFavorites([]); //
      localStorage.setItem("smartmeal_favorites", JSON.stringify([])); //
      logger.info("FavoritesPage:ClearAll", "Cleared all favorites"); //
    }
  };

  // Keep filtering logic...
  const cuisines = ["All", ...new Set(favorites.map((r) => r.cuisine))]; //
  const difficulties = ["All", "Easy", "Medium", "Hard"]; //
  const filteredFavorites = favorites.filter((recipe) => {
      // ... keep filter checks ...
      if (filterCuisine !== "All" && recipe.cuisine !== filterCuisine) return false; //
      if (filterDifficulty !== "All" && recipe.difficulty !== filterDifficulty) return false; //
      return true; //
  });

  // Keep loading state rendering...
  if (loading) {
    // ... loading JSX ...
    return <div>Loading favorites...</div>; // Replace with LoadingScreen if preferred
  }

  // --- Update JSX Rendering ---
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    {/* Conditional Title based on mode */}
                    {isAddingToPlanMode ? (
                        <h1 className="text-3xl font-bold mb-2">
                            Select a Favorite for <span className="capitalize text-primary">{targetDay}'s {targetMeal}</span>
                        </h1>
                    ) : (
                         <h1 className="text-3xl font-bold mb-2">Favorite Recipes</h1>
                    )}
                   <p className="text-muted-foreground">
                     {favorites.length} saved recipes
                   </p>
                </div>
                 {/* Keep Buttons like Clear All / Export */}
                 {favorites.length > 0 && !isAddingToPlanMode && (
                   <div className="flex gap-2">
                     <Button variant="ghost" onClick={clearAll}>
                       🗑 Clear All
                     </Button>
                     <Button variant="primary" disabled>📤 Export Favorites</Button> {/* Keep disabled or implement */}
                   </div>
                 )}
                 {isAddingToPlanMode && (
                     <Button variant="secondary" onClick={() => router.push('/planner')}>Cancel Adding</Button>
                 )}
            </div>

           {/* Keep Filters */}
           {favorites.length > 0 && (
             <div className="flex gap-4">
                 {/* Cuisine Filter */}
                 <div>
                    <label className="block text-sm font-medium mb-2">Cuisine</label>
                    <select
                      value={filterCuisine}
                      onChange={(e) => setFilterCuisine(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {cuisines.map((cuisine) => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                  </div>
                  {/* Difficulty Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <select
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {difficulties.map((diff) => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>
             </div>
           )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Empty states - keep as is */}
        {favorites.length === 0 ? (
           <Card> {/* No favorites yet */} </Card>
        ) : filteredFavorites.length === 0 ? (
           <Card> {/* No matching filters */} </Card>
        ) : (
          /* Recipe Grid */
          <>
            <div className="mb-6 text-sm text-muted-foreground">
              Showing {filteredFavorites.length} of {favorites.length} recipes
              {isAddingToPlanMode && <span className="text-primary font-semibold ml-2">(Click a recipe card to add it to your plan)</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((recipe) => (
                <Card
                  key={recipe.id} //
                  className={`overflow-hidden transition-all duration-200 ease-in-out ${
                      // Add hover effects specifically for add mode
                      isAddingToPlanMode
                       ? 'cursor-pointer hover:shadow-xl hover:border-primary hover:scale-[1.03] border-2 border-transparent focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/50'
                       : 'hover:shadow-lg' // Default hover
                  }`}
                  // --- Attach handleRecipeClick to the entire card ---
                  onClick={() => handleRecipeClick(recipe.id)} //
                  // Add keyboard accessibility for clicking the card
                  tabIndex={0} // Makes it focusable
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault(); // Prevent space bar scrolling
                          handleRecipeClick(recipe.id); //
                      }
                  }}
                  role={isAddingToPlanMode ? "button" : "article"} // Role changes based on mode
                  aria-label={isAddingToPlanMode ? `Add ${recipe.title} to meal plan` : `View ${recipe.title} details`} // Dynamic label
                >
                  {/* Keep inner structure (Image, CardHeader, CardContent) */}
                   <div className="relative aspect-video bg-gray-100">
                      <Image
                        src={recipe.image || "/placeholder-recipe.jpg"} //
                        alt={recipe.title} //
                        fill
                        className="object-cover"
                      />
                      {/* --- Modify Remove Button to prevent card click propagation --- */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // VERY IMPORTANT: Prevent card's onClick
                          removeFavorite(recipe.id); //
                        }}
                        className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors z-10" // Add z-index
                        aria-label="Remove from favorites"
                      >
                        <span className="text-red-500 text-xl">♥</span>
                      </button>
                    </div>
                  {/* ... CardHeader ... */}
                  <CardHeader>
                     <CardTitle className="line-clamp-2">
                         {/* Remove the <a> tag - the whole card is the trigger */}
                         {recipe.title}
                     </CardTitle>
                  </CardHeader>

                  {/* ... CardContent ... */}
                  <CardContent>
                     {/* ... Badges, Time Info ... */}
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
                     </div>
                     <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                       <div><div className="font-semibold text-primary">{recipe.prepTime}m</div><div className="text-xs text-muted-foreground">Prep</div></div>
                       <div><div className="font-semibold text-primary">{recipe.cookTime}m</div><div className="text-xs text-muted-foreground">Cook</div></div>
                       <div><div className="font-semibold text-primary">{recipe.servings}</div><div className="text-xs text-muted-foreground">Servings</div></div>
                     </div>

                     {/* --- Conditionally hide/change buttons in Add mode --- */}
                     {!isAddingToPlanMode ? (
                          <div className="flex gap-2 pt-2">
                             {/* In normal mode, the card click handles navigation, so button is just visual */}
                             <Button
                                variant="primary"
                                size="sm"
                                className="flex-1"
                                tabIndex={-1} // Prevent tabbing to this button as card handles action
                             >
                                View Recipe
                             </Button>
                             {/* You might want a button to add to plan directly from here too eventually */}
                             <Button variant="secondary" size="sm" disabled> + Plan </Button>
                          </div>
                     ) : (
                          // Visual indicator for add mode
                          <div className="mt-2 text-center p-2 bg-primary/10 rounded text-primary font-semibold border border-primary/30">
                             Click Card to Add
                          </div>
                     )}
                   </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}