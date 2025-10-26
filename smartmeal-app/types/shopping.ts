/**
 * Shopping List Type Definitions
 */

export type IngredientCategory = 
  | "produce" 
  | "dairy-eggs" 
  | "meat-seafood" 
  | "grains-bakery" 
  | "spices-condiments" 
  | "canned-packaged" 
  | "frozen" 
  | "other";

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  purchased: boolean;
  fromRecipes: string[]; // Recipe IDs that require this item
}

export interface ShoppingList {
  items: ShoppingItem[];
  generatedFrom: "mealplan" | "manual";
  weekReference?: string; // ISO date of meal plan week
  lastModified: string; // ISO timestamp
}
