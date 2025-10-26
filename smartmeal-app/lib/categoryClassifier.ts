/**
 * Shopping List Category Classifier
 * Categorizes ingredients into shopping list sections
 */

import { IngredientCategory } from "@/types/shopping";

// Category keyword mappings
const CATEGORY_KEYWORDS: Record<IngredientCategory, string[]> = {
  produce: [
    "tomato",
    "onion",
    "garlic",
    "lettuce",
    "spinach",
    "carrot",
    "potato",
    "pepper",
    "cucumber",
    "celery",
    "broccoli",
    "cauliflower",
    "mushroom",
    "apple",
    "banana",
    "orange",
    "lemon",
    "lime",
    "berry",
    "fruit",
    "vegetable",
    "herb",
    "parsley",
    "cilantro",
    "basil",
    "mint",
  ],
  "dairy-eggs": [
    "milk",
    "cream",
    "cheese",
    "butter",
    "yogurt",
    "egg",
    "sour cream",
    "cottage cheese",
    "mozzarella",
    "cheddar",
    "parmesan",
  ],
  "meat-seafood": [
    "chicken",
    "beef",
    "pork",
    "lamb",
    "turkey",
    "fish",
    "salmon",
    "tuna",
    "shrimp",
    "seafood",
    "meat",
    "sausage",
    "bacon",
  ],
  "grains-bakery": [
    "rice",
    "pasta",
    "bread",
    "flour",
    "cereal",
    "oats",
    "quinoa",
    "couscous",
    "noodle",
    "tortilla",
    "bagel",
    "roll",
  ],
  "spices-condiments": [
    "salt",
    "pepper",
    "spice",
    "oregano",
    "cumin",
    "paprika",
    "cinnamon",
    "vanilla",
    "oil",
    "olive oil",
    "vinegar",
    "sauce",
    "ketchup",
    "mustard",
    "mayo",
    "soy sauce",
    "honey",
    "sugar",
  ],
  "canned-packaged": [
    "canned",
    "beans",
    "tomato sauce",
    "broth",
    "stock",
    "soup",
    "chickpea",
    "lentil",
    "coconut milk",
  ],
  frozen: [
    "frozen",
    "ice cream",
    "frozen vegetables",
    "frozen fruit",
    "popsicle",
  ],
  other: [],
};

/**
 * Categorize an ingredient based on its name
 */
export function categorizeIngredient(ingredientName: string): IngredientCategory {
  const normalized = ingredientName.toLowerCase().trim();

  // Check each category's keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "other") continue;

    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        return category as IngredientCategory;
      }
    }
  }

  // Default to "other" if no match found
  return "other";
}

/**
 * Get display name for category
 */
export function getCategoryDisplayName(category: IngredientCategory): string {
  const displayNames: Record<IngredientCategory, string> = {
    produce: "Produce",
    "dairy-eggs": "Dairy & Eggs",
    "meat-seafood": "Meat & Seafood",
    "grains-bakery": "Grains & Bakery",
    "spices-condiments": "Spices & Condiments",
    "canned-packaged": "Canned & Packaged",
    frozen: "Frozen",
    other: "Other",
  };

  return displayNames[category] || "Other";
}

/**
 * Get icon name for category (using lucide-react icon names)
 */
export function getCategoryIcon(category: IngredientCategory): string {
  const icons: Record<IngredientCategory, string> = {
    produce: "Leaf",
    "dairy-eggs": "Milk",
    "meat-seafood": "Drumstick",
    "grains-bakery": "Wheat",
    "spices-condiments": "Sparkles",
    "canned-packaged": "Package",
    frozen: "Snowflake",
    other: "ShoppingBasket",
  };

  return icons[category] || "ShoppingBasket";
}

/**
 * Get sort order for category
 */
export function getCategorySortOrder(category: IngredientCategory): number {
  const sortOrder: Record<IngredientCategory, number> = {
    produce: 1,
    "dairy-eggs": 2,
    "meat-seafood": 3,
    "grains-bakery": 4,
    "spices-condiments": 5,
    "canned-packaged": 6,
    frozen: 7,
    other: 8,
  };

  return sortOrder[category] || 99;
}
