"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CuisineType, DietaryFilter } from "@/types/recipe";

interface FilterPanelProps {
  onFilterChange: (filters: {
    cuisine?: string;
    dietaryFilters: string[];
    difficulty?: string;
    maxTime?: number;
  }) => void;
  initialFilters?: {
    cuisine?: string;
    dietaryFilters?: string[];
    difficulty?: string;
    maxTime?: number;
  };
}

const CUISINES = [
  { value: "all", label: "All Cuisines" },
  { value: "italian", label: "Italian" },
  { value: "chinese", label: "Chinese" },
  { value: "mexican", label: "Mexican" },
  { value: "indian", label: "Indian" },
  { value: "thai", label: "Thai" },
  { value: "japanese", label: "Japanese" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "american", label: "American" },
];

const DIETARY_FILTERS = [
  { value: "vegetarian", label: "Vegetarian", icon: "🥬" },
  { value: "vegan", label: "Vegan", icon: "🌱" },
  { value: "gluten-free", label: "Gluten-Free", icon: "🌾" },
  { value: "keto", label: "Keto", icon: "🥑" },
  { value: "low-carb", label: "Low-Carb", icon: "🥗" },
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const TIME_RANGES = [
  { value: 15, label: "Under 15 min" },
  { value: 30, label: "Under 30 min" },
  { value: 45, label: "Under 45 min" },
  { value: 60, label: "Under 1 hour" },
];

export function FilterPanel({ onFilterChange, initialFilters }: FilterPanelProps) {
  const [cuisine, setCuisine] = useState(initialFilters?.cuisine || "all");
  const [dietaryFilters, setDietaryFilters] = useState<string[]>(
    initialFilters?.dietaryFilters || []
  );
  const [difficulty, setDifficulty] = useState(initialFilters?.difficulty || "");
  const [maxTime, setMaxTime] = useState(initialFilters?.maxTime);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDietaryFilter = (filter: string) => {
    const updated = dietaryFilters.includes(filter)
      ? dietaryFilters.filter((f) => f !== filter)
      : [...dietaryFilters, filter];
    setDietaryFilters(updated);
    applyFilters(cuisine, updated, difficulty, maxTime);
  };

  const handleCuisineChange = (newCuisine: string) => {
    setCuisine(newCuisine);
    applyFilters(newCuisine, dietaryFilters, difficulty, maxTime);
  };

  const handleDifficultyChange = (newDifficulty: string) => {
    const updated = difficulty === newDifficulty ? "" : newDifficulty;
    setDifficulty(updated);
    applyFilters(cuisine, dietaryFilters, updated, maxTime);
  };

  const handleTimeChange = (time: number) => {
    const updated = maxTime === time ? undefined : time;
    setMaxTime(updated);
    applyFilters(cuisine, dietaryFilters, difficulty, updated);
  };

  const applyFilters = (
    c: string,
    d: string[],
    diff: string,
    time?: number
  ) => {
    onFilterChange({
      cuisine: c === "all" ? undefined : c,
      dietaryFilters: d,
      difficulty: diff || undefined,
      maxTime: time,
    });
  };

  const clearAllFilters = () => {
    setCuisine("all");
    setDietaryFilters([]);
    setDifficulty("");
    setMaxTime(undefined);
    onFilterChange({
      cuisine: undefined,
      dietaryFilters: [],
      difficulty: undefined,
      maxTime: undefined,
    });
  };

  const activeFilterCount =
    (cuisine !== "all" ? 1 : 0) +
    dietaryFilters.length +
    (difficulty ? 1 : 0) +
    (maxTime ? 1 : 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span id="filter-label">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="info" size="sm" aria-label={`${activeFilterCount} active filters`}>
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                aria-label="Clear all filters"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls="filter-content"
              aria-label={isExpanded ? "Hide filters" : "Show filters"}
            >
              {isExpanded ? "Hide" : "Show"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6" id="filter-content" role="region" aria-labelledby="filter-label">
          {/* Cuisine Filter */}
          <fieldset>
            <legend className="block text-sm font-medium mb-3">Cuisine</legend>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2" role="group" aria-label="Cuisine filter options">
              {CUISINES.map((c) => (
                <Button
                  key={c.value}
                  variant={cuisine === c.value ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => handleCuisineChange(c.value)}
                  className="w-full"
                  aria-pressed={cuisine === c.value}
                  aria-label={`Filter by ${c.label}`}
                >
                  {c.label}
                </Button>
              ))}
            </div>
          </fieldset>

          {/* Dietary Filters */}
          <fieldset>
            <legend className="block text-sm font-medium mb-3">
              Dietary Preferences
            </legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Dietary preferences">
              {DIETARY_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => toggleDietaryFilter(filter.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                    dietaryFilters.includes(filter.value)
                      ? "border-primary bg-primary text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  aria-pressed={dietaryFilters.includes(filter.value)}
                  aria-label={`${filter.label} filter`}
                >
                  <span aria-hidden="true">{filter.icon}</span>
                  <span className="text-sm">{filter.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Difficulty Filter */}
          <fieldset>
            <legend className="block text-sm font-medium mb-3">Difficulty</legend>
            <div className="flex gap-2" role="group" aria-label="Difficulty filter">
              {DIFFICULTIES.map((diff) => (
                <Button
                  key={diff}
                  variant={difficulty === diff ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => handleDifficultyChange(diff)}
                  className="flex-1"
                  aria-pressed={difficulty === diff}
                  aria-label={`${diff} difficulty`}
                >
                  {diff}
                </Button>
              ))}
            </div>
          </fieldset>

          {/* Time Filter */}
          <fieldset>
            <legend className="block text-sm font-medium mb-3">
              Cooking Time
            </legend>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Cooking time filter">
              {TIME_RANGES.map((range) => (
                <Button
                  key={range.value}
                  variant={maxTime === range.value ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => handleTimeChange(range.value)}
                  aria-pressed={maxTime === range.value}
                  aria-label={`${range.label} cooking time`}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </fieldset>
        </CardContent>
      )}
    </Card>
  );
}
