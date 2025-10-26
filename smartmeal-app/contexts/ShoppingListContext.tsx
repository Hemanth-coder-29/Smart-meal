"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { ShoppingList, ShoppingItem, IngredientCategory } from "@/types/shopping";
import { categorizeIngredient } from "@/lib/categoryClassifier";

interface ShoppingListContextType {
  items: ShoppingItem[];
  addItem: (name: string, quantity: number, unit: string) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  clearPurchased: () => void;
  clearAll: () => void;
  generateFromMealPlan: () => void;
  exportList: (format: "text" | "pdf") => void;
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

const STORAGE_KEY = "smartmeal_shopping_list";

export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ShoppingList = JSON.parse(stored);
        setItems(parsed.items || []);
      }
    } catch (error) {
      console.error("Failed to load shopping list:", error);
    }
  };

  const saveToStorage = (updatedItems: ShoppingItem[]) => {
    const list: ShoppingList = {
      items: updatedItems,
      generatedFrom: "manual",
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const addItem = (name: string, quantity: number, unit: string) => {
    const newItem: ShoppingItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      quantity,
      unit,
      category: categorizeIngredient(name),
      purchased: false,
      fromRecipes: [],
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    saveToStorage(updatedItems);
  };

  const removeItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    saveToStorage(updatedItems);
  };

  const toggleItem = (id: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, purchased: !item.purchased } : item
    );
    setItems(updatedItems);
    saveToStorage(updatedItems);
  };

  const updateItem = (id: string, updates: Partial<ShoppingItem>) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setItems(updatedItems);
    saveToStorage(updatedItems);
  };

  const clearPurchased = () => {
    const updatedItems = items.filter((item) => !item.purchased);
    setItems(updatedItems);
    saveToStorage(updatedItems);
  };

  const clearAll = () => {
    setItems([]);
    saveToStorage([]);
  };

  const generateFromMealPlan = () => {
    // This would integrate with MealPlanContext to generate shopping list
    // For now, this is a placeholder
    console.log("Generate from meal plan - to be implemented");
  };

  const exportList = (format: "text" | "pdf") => {
    if (format === "text") {
      let text = "Smart Meal - Shopping List\n";
      text += "========================\n\n";

      const categories: IngredientCategory[] = [
        "produce",
        "dairy-eggs",
        "meat-seafood",
        "grains-bakery",
        "spices-condiments",
        "canned-packaged",
        "frozen",
        "other",
      ];

      categories.forEach((category) => {
        const categoryItems = items.filter((item) => item.category === category);
        if (categoryItems.length > 0) {
          text += `${category.toUpperCase()}\n`;
          categoryItems.forEach((item) => {
            text += `  ${item.purchased ? "✓" : "○"} ${item.quantity} ${item.unit} ${item.name}\n`;
          });
          text += "\n";
        }
      });

      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "shopping-list.txt";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      console.log("PDF export - to be implemented");
    }
  };

  return (
    <ShoppingListContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        toggleItem,
        updateItem,
        clearPurchased,
        clearAll,
        generateFromMealPlan,
        exportList,
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList() {
  const context = useContext(ShoppingListContext);
  if (context === undefined) {
    throw new Error("useShoppingList must be used within a ShoppingListProvider");
  }
  return context;
}
