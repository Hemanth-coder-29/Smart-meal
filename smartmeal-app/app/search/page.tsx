// smartmeal-app/app/search/page.tsx
"use client";

import { useState } from "react"; // Keep useState
import Link from "next/link";
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecipeGrid } from "@/components/recipes/RecipeGrid"; // Import RecipeGrid
import { FilterPanel } from "@/components/search/FilterPanel"; // Import FilterPanel
import { LoadingSpinner } from "@/components/common/Loading"; // Import LoadingSpinner
import { ErrorMessage } from "@/components/common/ErrorMessage"; // Import ErrorMessage
import type { Recipe } from "@/types/recipe"; // Import Recipe type
import type { CuisineType, DietaryFilter } from "@/types/recipe"; // Import filter types

export default function SearchPage() {
  const [ingredients, setIngredients] = useState("");
  const [filters, setFilters] = useState<{
    cuisine?: CuisineType;
    dietaryFilters: DietaryFilter[];
    difficulty?: string;
    maxTime?: number;
  }>({ dietaryFilters: [] });

  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialize router

  const handleSearch = async () => {
    if (!ingredients.trim()) return;

    setSearching(true);
    setError(null);
    setSearchResults([]); // Clear previous results

    try {
      const response = await fetch("/api/recipes/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients: ingredients.split(',').map(ing => ing.trim()).filter(ing => ing), // Split and clean ingredients
          filters: {
             cuisine: filters.cuisine === 'all' ? undefined : filters.cuisine, // Handle 'all' cuisine
             dietaryFilters: filters.dietaryFilters,
             difficulty: filters.difficulty,
             maxTime: filters.maxTime,
             // Add sortBy if you implement it in FilterPanel
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.recipes || []);

    } catch (err: unknown) {
      console.error("Search failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during search.");
    } finally {
      setSearching(false);
    }
  };

  // Function to handle clicking on a recipe card
  const handleViewDetails = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  const handleFilterChange = (newFilters: any) => {
     setFilters(newFilters);
     // Optional: Trigger search immediately on filter change if ingredients are present
     // if (ingredients.trim()) {
     //   handleSearch();
     // }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header (Keep as is) */}
      <header className="border-b border-border bg-card" role="banner">
        {/* ... existing header code ... */}
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12" role="main" id="main-content">
        {/* Title (Keep as is) */}
        <div className="mb-8">
            {/* ... existing title code ... */}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Search Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Ingredients</CardTitle>
                <CardDescription>
                  Enter ingredients separated by commas (e.g., chicken, tomatoes, garlic)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="tomatoes, onion, garlic, olive oil, pasta..."
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows={4}
                  aria-label="Enter your ingredients"
                  aria-describedby="ingredients-description"
                />
                <p id="ingredients-description" className="sr-only">Enter ingredients separated by commas</p>

                {/* --- Filters Section Removed - Use FilterPanel Below --- */}

                <Button
                  onClick={handleSearch}
                  disabled={!ingredients.trim() || searching}
                  className="w-full"
                  aria-label={searching ? "Searching for recipes" : "Find recipes based on your ingredients"}
                >
                  {searching ? (
                     <><LoadingSpinner size="sm" color="white" /> Searching...</>
                  ) : "Find Recipes 🔍"}
                </Button>
              </CardContent>
            </Card>

            {/* Filter Panel */}
             <FilterPanel onFilterChange={handleFilterChange} />


            {/* Results Section */}
            <section className="mt-6" aria-live="polite">
              <h2 className="mb-4 text-2xl font-bold">Recipe Results</h2>
              {searching && (
                <div className="flex justify-center py-10">
                  <LoadingSpinner size="lg" />
                </div>
              )}
              {error && (
                 <ErrorMessage variant="generic" title="Search Error" message={error} onRetry={handleSearch} />
              )}
              {!searching && !error && searchResults.length === 0 && ingredients.trim() && (
                 <Card>
                   <CardContent className="py-10 text-center">
                     <p className="text-muted-foreground">No recipes found matching your ingredients and filters. Try adjusting your search.</p>
                   </CardContent>
                 </Card>
              )}
              {!searching && !error && searchResults.length > 0 && (
                // Use RecipeGrid to display actual results
                <RecipeGrid
                  recipes={searchResults}
                  onViewDetails={handleViewDetails} // Pass the navigation handler
                  // Add onAddToMealPlan and onToggleFavorite if needed later
                />
              )}
            </section>
          </div>

          {/* Tips Panel (Keep as is) */}
          <div>
              {/* ... existing tips panel code ... */}
          </div>
        </div>
      </main>
       {/* Footer (Keep as is) */}
       <footer className="border-t border-border bg-card py-6">
          {/* ... existing footer code ... */}
       </footer>
    </div>
  );
}