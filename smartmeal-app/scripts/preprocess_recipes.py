"""
Smart Meal - Recipe Data Preprocessing Script
Downloads and preprocesses Kaggle Recipe Dataset to optimized 50K subset
"""

import pandas as pd
import json
import re
from typing import List, Dict, Any
import random

# Note: This is a simplified preprocessing script
# In production, you would:
# 1. Install kagglehub: pip install kagglehub pandas
# 2. Download the actual dataset from Kaggle
# 3. Run more comprehensive data cleaning and enrichment

def clean_ingredient_name(ingredient: str) -> str:
    """Clean and normalize ingredient names"""
    # Remove special characters, lowercase, trim
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', ingredient.lower()).strip()
    # Remove articles
    cleaned = re.sub(r'\b(a|an|the)\b', '', cleaned).strip()
    return cleaned

def parse_time(time_str: str) -> int:
    """Parse time string to minutes"""
    if pd.isna(time_str) or not time_str:
        return 0
    
    # Extract numbers from string
    matches = re.findall(r'(\d+)', str(time_str))
    if not matches:
        return 0
    
    minutes = int(matches[0])
    
    # Check if it's hours
    if 'hour' in str(time_str).lower() or 'hr' in str(time_str).lower():
        minutes *= 60
    
    return minutes

def determine_difficulty(steps_count: int, total_time: int) -> str:
    """Determine difficulty based on steps and time"""
    if steps_count <= 5 and total_time <= 30:
        return "Easy"
    elif steps_count <= 10 and total_time <= 60:
        return "Medium"
    else:
        return "Hard"

def determine_meal_type(keywords: List[str], name: str) -> str:
    """Determine meal type from keywords and recipe name"""
    text = " ".join(keywords).lower() + " " + name.lower()
    
    if any(word in text for word in ['breakfast', 'pancake', 'waffle', 'cereal', 'oatmeal']):
        return "Breakfast"
    elif any(word in text for word in ['dinner', 'main', 'entree']):
        return "Dinner"
    elif any(word in text for word in ['snack', 'appetizer', 'dessert']):
        return "Snack"
    else:
        return "Lunch"

def extract_cuisine(keywords: List[str], name: str) -> str:
    """Extract cuisine type from keywords"""
    text = " ".join(keywords).lower() + " " + name.lower()
    
    cuisines = {
        'indian': ['indian', 'curry', 'masala', 'tandoori', 'biryani'],
        'chinese': ['chinese', 'szechuan', 'cantonese', 'wok'],
        'italian': ['italian', 'pasta', 'pizza', 'risotto'],
        'mexican': ['mexican', 'taco', 'burrito', 'enchilada', 'salsa'],
        'thai': ['thai', 'pad thai', 'curry thai']
    }
    
    for cuisine, keywords_list in cuisines.items():
        if any(keyword in text for keyword in keywords_list):
            return cuisine
    
    return "international"

def extract_dietary_tags(ingredients: List[str], keywords: List[str]) -> List[str]:
    """Extract dietary tags from ingredients"""
    tags = []
    ingredients_text = " ".join(ingredients).lower()
    keywords_text = " ".join(keywords).lower()
    
    # Check for meat
    meat_keywords = ['chicken', 'beef', 'pork', 'lamb', 'meat', 'fish', 'seafood']
    has_meat = any(keyword in ingredients_text for keyword in meat_keywords)
    
    # Check for animal products
    dairy_keywords = ['milk', 'cheese', 'butter', 'cream', 'egg']
    has_dairy = any(keyword in ingredients_text for keyword in dairy_keywords)
    
    if not has_meat:
        tags.append('vegetarian')
    if not has_meat and not has_dairy:
        tags.append('vegan')
    
    if 'gluten-free' in keywords_text or 'gluten free' in keywords_text:
        tags.append('gluten-free')
    if 'keto' in keywords_text or 'low-carb' in keywords_text or 'low carb' in keywords_text:
        tags.append('keto')
    if 'low-carb' in keywords_text or 'low carb' in keywords_text:
        tags.append('low-carb')
    
    return tags

def create_sample_recipes(count: int = 50) -> List[Dict[str, Any]]:
    """Create sample recipes for initial testing"""
    sample_recipes = []
    
    cuisines = ['indian', 'chinese', 'italian', 'mexican', 'thai', 'international']
    difficulties = ['Easy', 'Medium', 'Hard']
    meal_types = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
    
    for i in range(count):
        recipe_id = f"recipe_{i+1:04d}"
        cuisine = random.choice(cuisines)
        difficulty = random.choice(difficulties)
        meal_type = random.choice(meal_types)
        
        prep_time = random.randint(5, 30)
        cook_time = random.randint(10, 90)
        total_time = prep_time + cook_time
        
        recipe = {
            "id": recipe_id,
            "title": f"Sample {cuisine.capitalize()} {meal_type} Recipe {i+1}",
            "image": f"/images/placeholder-recipe.png",
            "description": f"A delicious {cuisine} {meal_type.lower()} dish",
            "prepTime": prep_time,
            "cookTime": cook_time,
            "totalTime": total_time,
            "servings": random.randint(2, 6),
            "difficulty": difficulty,
            "mealType": meal_type,
            "cuisine": cuisine,
            "ingredients": [
                {"name": "ingredient1", "quantity": 2, "unit": "cups", "substitutions": []},
                {"name": "ingredient2", "quantity": 1, "unit": "tbsp", "substitutions": []},
                {"name": "ingredient3", "quantity": 500, "unit": "g", "substitutions": []}
            ],
            "instructions": [
                {"step": 1, "text": "Prepare all ingredients", "timerDuration": None},
                {"step": 2, "text": "Cook for 20 minutes", "timerDuration": 1200},
                {"step": 3, "text": "Serve hot", "timerDuration": None}
            ],
            "nutrition": {
                "calories": random.randint(200, 800),
                "protein": random.randint(10, 50),
                "carbs": random.randint(20, 100),
                "fats": random.randint(5, 40),
                "fiber": random.randint(2, 15),
                "sodium": random.randint(200, 1500),
                "sugar": random.randint(2, 25)
            },
            "dietaryTags": random.sample(['vegetarian', 'vegan', 'gluten-free', 'keto', 'low-carb'], k=random.randint(0, 2)),
            "videoId": None
        }
        
        sample_recipes.append(recipe)
    
    return sample_recipes

def main():
    """Main preprocessing function"""
    print("Smart Meal Recipe Preprocessing")
    print("=" * 50)
    
    # For initial testing, create sample recipes
    # In production, replace this with actual dataset processing
    print("\nCreating sample recipes for initial testing...")
    recipes = create_sample_recipes(50)
    
    print(f"\nGenerated {len(recipes)} sample recipes")
    
    # Save to JSON file
    output_path = "../public/data/recipes.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(recipes, f, indent=2, ensure_ascii=False)
    
    print(f"\nRecipes saved to: {output_path}")
    print("\nPreprocessing complete!")
    
    # Print statistics
    print("\nDataset Statistics:")
    print(f"Total recipes: {len(recipes)}")
    cuisines = {}
    for recipe in recipes:
        cuisine = recipe['cuisine']
        cuisines[cuisine] = cuisines.get(cuisine, 0) + 1
    
    print("\nRecipes by cuisine:")
    for cuisine, count in sorted(cuisines.items()):
        print(f"  {cuisine}: {count}")

if __name__ == "__main__":
    main()
