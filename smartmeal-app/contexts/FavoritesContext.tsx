"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (recipeId: string) => void;
  removeFavorite: (recipeId: string) => void;
  toggleFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = "smartmeal_favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  };

  const saveFavorites = (updatedFavorites: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  };

  const addFavorite = (recipeId: string) => {
    if (!favorites.includes(recipeId)) {
      const updated = [...favorites, recipeId];
      setFavorites(updated);
      saveFavorites(updated);
    }
  };

  const removeFavorite = (recipeId: string) => {
    const updated = favorites.filter((id) => id !== recipeId);
    setFavorites(updated);
    saveFavorites(updated);
  };

  const toggleFavorite = (recipeId: string) => {
    if (favorites.includes(recipeId)) {
      removeFavorite(recipeId);
    } else {
      addFavorite(recipeId);
    }
  };

  const isFavorite = (recipeId: string): boolean => {
    return favorites.includes(recipeId);
  };

  const clearFavorites = () => {
    setFavorites([]);
    saveFavorites([]);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
