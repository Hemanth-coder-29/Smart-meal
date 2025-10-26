"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SearchPage() {
  const [ingredients, setIngredients] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    setSearching(true);
    // Simulate search
    setTimeout(() => setSearching(false), 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card" role="banner">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary" aria-label="Smart Meal home">
              Smart Meal
            </Link>
            <nav className="flex gap-6" role="navigation" aria-label="Main navigation">
              <Link href="/dashboard" className="text-neutral hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/search" className="font-medium text-primary" aria-current="page">
                Search Recipes
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12" role="main" id="main-content">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Find Recipes</h1>
          <p className="mt-2 text-lg text-neutral">
            Enter your ingredients and discover perfect recipes
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Search Panel */}
          <div className="lg:col-span-2">
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
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cuisine-select" className="mb-2 block text-sm font-medium">Cuisine Type</label>
                    <select id="cuisine-select" className="w-full rounded-lg border border-border bg-background px-4 py-2" aria-label="Select cuisine type">
                      <option>All Cuisines</option>
                      <option>Indian</option>
                      <option>Chinese</option>
                      <option>Italian</option>
                      <option>Mexican</option>
                      <option>Thai</option>
                    </select>
                  </div>

                  <div>
                    <label id="dietary-filters-label" className="mb-2 block text-sm font-medium">Dietary Filters</label>
                    <div className="flex flex-wrap gap-2" role="group" aria-labelledby="dietary-filters-label">
                      <Badge variant="neutral" className="cursor-pointer" role="button" tabIndex={0} aria-label="Filter by vegetarian">Vegetarian</Badge>
                      <Badge variant="neutral" className="cursor-pointer" role="button" tabIndex={0} aria-label="Filter by vegan">Vegan</Badge>
                      <Badge variant="neutral" className="cursor-pointer" role="button" tabIndex={0} aria-label="Filter by gluten-free">Gluten-Free</Badge>
                      <Badge variant="neutral" className="cursor-pointer" role="button" tabIndex={0} aria-label="Filter by keto">Keto</Badge>
                      <Badge variant="neutral" className="cursor-pointer" role="button" tabIndex={0} aria-label="Filter by low-carb">Low-Carb</Badge>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={!ingredients.trim() || searching}
                  className="w-full"
                  aria-label={searching ? "Searching for recipes" : "Find recipes based on your ingredients"}
                >
                  {searching ? "Searching..." : "Find Recipes 🔍"}
                </Button>
              </CardContent>
            </Card>

            {/* Results Placeholder */}
            {ingredients.trim() && !searching && (
              <section className="mt-6" aria-label="Recipe search results">
                <h2 className="mb-4 text-2xl font-bold">Recipe Results</h2>
                <div className="grid gap-4 sm:grid-cols-2" role="list">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="cursor-pointer hover:-translate-y-1" role="listitem">
                      <CardHeader>
                        <div className="mb-2 flex items-center justify-between">
                          <Badge variant="success" size="sm" aria-label="85% ingredient match">85% Match</Badge>
                          <Badge variant="info" size="sm">Easy</Badge>
                        </div>
                        <CardTitle className="text-lg">Sample Recipe {i}</CardTitle>
                        <CardDescription>
                          <span aria-hidden="true">🕐</span> 30 min • <span aria-hidden="true">🍽️</span> 4 servings • <span aria-hidden="true">🔥</span> 350 cal
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Tips Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Search Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-medium">✨ Get Better Results</p>
                  <p className="mt-1 text-neutral">
                    List common ingredients you have at home
                  </p>
                </div>
                <div>
                  <p className="font-medium">🎯 Match Percentage</p>
                  <p className="mt-1 text-neutral">
                    Shows how well your ingredients match each recipe
                  </p>
                </div>
                <div>
                  <p className="font-medium">🏷️ Use Filters</p>
                  <p className="mt-1 text-neutral">
                    Apply cuisine and dietary filters to narrow results
                  </p>
                </div>
                <div>
                  <p className="font-medium">📊 Sort Options</p>
                  <p className="mt-1 text-neutral">
                    Sort by best match, quickest, or easiest
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
