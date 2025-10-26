"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Recipe } from "@/types/recipe";
import Image from "next/image";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCuisine, setFilterCuisine] = useState<string>("All");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("All");

  useEffect(() => {
    async function loadFavorites() {
      try {
        // Load favorite IDs from localStorage
        const stored = localStorage.getItem("smartmeal_favorites");
        const favoriteIds: string[] = stored ? JSON.parse(stored) : [];

        if (favoriteIds.length === 0) {
          setLoading(false);
          return;
        }

        // Load full recipe data
        const response = await fetch("/data/recipes.json");
        const allRecipes: Recipe[] = await response.json();
        const favoriteRecipes = allRecipes.filter((r) =>
          favoriteIds.includes(r.id)
        );
        setFavorites(favoriteRecipes);
      } catch (error) {
        console.error("Failed to load favorites:", error);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, []);

  const removeFavorite = (recipeId: string) => {
    const updated = favorites.filter((r) => r.id !== recipeId);
    setFavorites(updated);

    // Update localStorage
    const favoriteIds = updated.map((r) => r.id);
    localStorage.setItem("smartmeal_favorites", JSON.stringify(favoriteIds));
  };

  const clearAll = () => {
    if (confirm("Are you sure you want to clear all favorites?")) {
      setFavorites([]);
      localStorage.setItem("smartmeal_favorites", JSON.stringify([]));
    }
  };

  // Get unique cuisines and difficulties
  const cuisines = ["All", ...new Set(favorites.map((r) => r.cuisine))];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  // Filter favorites
  const filteredFavorites = favorites.filter((recipe) => {
    if (filterCuisine !== "All" && recipe.cuisine !== filterCuisine)
      return false;
    if (filterDifficulty !== "All" && recipe.difficulty !== filterDifficulty)
      return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Favorite Recipes</h1>
              <p className="text-muted-foreground">
                {favorites.length} saved recipes
              </p>
            </div>
            {favorites.length > 0 && (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={clearAll}>
                  🗑 Clear All
                </Button>
                <Button variant="primary">📤 Export Favorites</Button>
              </div>
            )}
          </div>

          {/* Filters */}
          {favorites.length > 0 && (
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cuisine
                </label>
                <select
                  value={filterCuisine}
                  onChange={(e) => setFilterCuisine(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {cuisines.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Difficulty
                </label>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {favorites.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="text-6xl mb-4">♡</div>
              <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground mb-6">
                Start exploring recipes and save your favorites here
              </p>
              <Button variant="primary" onClick={() => window.location.href = '/search'}>
                Browse Recipes
              </Button>
            </CardContent>
          </Card>
        ) : filteredFavorites.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <h2 className="text-2xl font-bold mb-2">
                No recipes match your filters
              </h2>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filter criteria
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  setFilterCuisine("All");
                  setFilterDifficulty("All");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 text-sm text-muted-foreground">
              Showing {filteredFavorites.length} of {favorites.length} recipes
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <a href={`/recipes/${recipe.id}`}>
                    <div className="relative aspect-video bg-gray-100">
                      <Image
                        src={recipe.image || "/placeholder-recipe.jpg"}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeFavorite(recipe.id);
                        }}
                        className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
                        aria-label="Remove from favorites"
                      >
                        <span className="text-red-500 text-xl">♥</span>
                      </button>
                    </div>
                  </a>

                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      <a
                        href={`/recipes/${recipe.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {recipe.title}
                      </a>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
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
                      <div>
                        <div className="font-semibold text-primary">
                          {recipe.prepTime}m
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Prep
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-primary">
                          {recipe.cookTime}m
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Cook
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-primary">
                          {recipe.servings}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Servings
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.location.href = `/recipes/${recipe.id}`}
                      >
                        View Recipe
                      </Button>
                      <Button variant="secondary" size="sm">
                        + Plan
                      </Button>
                    </div>
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
