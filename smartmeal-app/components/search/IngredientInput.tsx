"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface IngredientInputProps {
  onIngredientsChange: (ingredients: string[]) => void;
  initialIngredients?: string[];
  placeholder?: string;
}

const COMMON_INGREDIENTS = [
  "Chicken", "Tomatoes", "Onion", "Garlic", "Rice", "Pasta",
  "Eggs", "Cheese", "Milk", "Butter", "Olive Oil", "Salt",
  "Pepper", "Potatoes", "Carrots", "Beef", "Pork", "Fish",
  "Bread", "Flour", "Sugar", "Lettuce", "Bell Pepper", "Mushrooms",
];

export function IngredientInput({
  onIngredientsChange,
  initialIngredients = [],
  placeholder = "Add ingredients (e.g., chicken, tomatoes, rice)...",
}: IngredientInputProps) {
  const [ingredients, setIngredients] = useState<string[]>(initialIngredients);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputValue.trim().length > 0) {
      const filtered = COMMON_INGREDIENTS.filter(
        (ing) =>
          ing.toLowerCase().includes(inputValue.toLowerCase()) &&
          !ingredients.includes(ing.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, ingredients]);

  const addIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      const updated = [...ingredients, trimmed];
      setIngredients(updated);
      onIngredientsChange(updated);
      setInputValue("");
      setSuggestions([]);
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const removeIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
    onIngredientsChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0 && showSuggestions) {
        addIngredient(suggestions[0]);
      } else if (inputValue.trim()) {
        addIngredient(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && ingredients.length > 0) {
      removeIngredient(ingredients.length - 1);
    }
  };

  const handleCommonIngredientClick = (ingredient: string) => {
    addIngredient(ingredient);
  };

  return (
    <div className="space-y-4" role="search" aria-label="Ingredient search">
      <div className="relative">
        <div className="min-h-[120px] p-3 border-2 border-gray-300 rounded-lg focus-within:border-primary transition-colors" role="group" aria-label="Ingredient input area">
          {/* Selected Ingredients */}
          <div className="flex flex-wrap gap-2 mb-2" role="list" aria-label="Selected ingredients">
            {ingredients.map((ingredient, index) => (
              <Badge
                key={index}
                variant="info"
                className="flex items-center gap-1 px-3 py-1 cursor-pointer"
                onClick={() => removeIngredient(index)}
                role="listitem"
                aria-label={`Remove ${ingredient}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    removeIngredient(index);
                  }
                }}
              >
                {ingredient}
                <span className="ml-1 hover:text-red-200" aria-hidden="true">×</span>
              </Badge>
            ))}
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={ingredients.length === 0 ? placeholder : "Add more..."}
            className="w-full outline-none bg-transparent text-base"
            aria-label="Enter ingredient"
            aria-describedby="ingredient-count"
            aria-autocomplete="list"
            aria-controls={showSuggestions ? "ingredient-suggestions" : undefined}
            aria-expanded={showSuggestions}
          />
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            id="ingredient-suggestions"
            role="listbox"
            aria-label="Ingredient suggestions"
            className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                role="option"
                onClick={() => addIngredient(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg"
                aria-label={`Add ${suggestion}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Common Ingredients Quick Add */}
      <section aria-labelledby="quick-add-label">
        <label id="quick-add-label" className="block text-sm font-medium mb-2 text-muted-foreground">
          Quick Add:
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Quick add common ingredients">
          {COMMON_INGREDIENTS.filter((ing) => !ingredients.includes(ing.toLowerCase()))
            .slice(0, 12)
            .map((ingredient) => (
              <button
                key={ingredient}
                onClick={() => handleCommonIngredientClick(ingredient)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:border-primary hover:bg-primary hover:text-white transition-colors"
                aria-label={`Add ${ingredient}`}
              >
                + {ingredient}
              </button>
            ))}
        </div>
      </section>

      {/* Ingredient Count */}
      {ingredients.length > 0 && (
        <p id="ingredient-count" className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""} added
        </p>
      )}
    </div>
  );
}
