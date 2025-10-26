// Generate sample recipe data for testing
const fs = require('fs');
const path = require('path');

function generateSampleRecipes(count = 50) {
  const recipes = [];
  const cuisines = ['indian', 'chinese', 'italian', 'mexican', 'thai', 'international'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'keto', 'low-carb'];

  for (let i = 0; i < count; i++) {
    const recipeId = `recipe_${String(i + 1).padStart(4, '0')}`;
    const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];

    const prepTime = Math.floor(Math.random() * 26) + 5; // 5-30 min
    const cookTime = Math.floor(Math.random() * 81) + 10; // 10-90 min
    const totalTime = prepTime + cookTime;

    const dietaryCount = Math.floor(Math.random() * 3);
    const dietaryTags = [];
    for (let j = 0; j < dietaryCount; j++) {
      const tag = dietaryOptions[Math.floor(Math.random() * dietaryOptions.length)];
      if (!dietaryTags.includes(tag)) {
        dietaryTags.push(tag);
      }
    }

    const recipe = {
      id: recipeId,
      title: `Sample ${cuisine.charAt(0).toUpperCase() + cuisine.slice(1)} ${mealType} Recipe ${i + 1}`,
      image: `/images/placeholder-recipe.png`,
      description: `A delicious ${cuisine} ${mealType.toLowerCase()} dish that's perfect for any occasion.`,
      prepTime,
      cookTime,
      totalTime,
      servings: Math.floor(Math.random() * 5) + 2, // 2-6 servings
      difficulty,
      mealType,
      cuisine,
      ingredients: [
        { name: 'tomatoes', quantity: 2, unit: 'cups', substitutions: ['canned tomatoes'] },
        { name: 'onion', quantity: 1, unit: 'medium', substitutions: ['shallots'] },
        { name: 'garlic', quantity: 3, unit: 'cloves', substitutions: ['garlic powder'] },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', substitutions: ['vegetable oil'] },
        { name: 'salt', quantity: 1, unit: 'tsp', substitutions: [] },
        { name: 'pepper', quantity: 0.5, unit: 'tsp', substitutions: [] }
      ],
      instructions: [
        { step: 1, text: 'Prepare all ingredients by washing and chopping as needed.', timerDuration: null },
        { step: 2, text: 'Heat oil in a large pan over medium heat.', timerDuration: null },
        { step: 3, text: 'Cook the base ingredients for 10 minutes.', timerDuration: 600 },
        { step: 4, text: 'Add main ingredients and simmer for 20 minutes.', timerDuration: 1200 },
        { step: 5, text: 'Season to taste and serve hot.', timerDuration: null }
      ],
      nutrition: {
        calories: Math.floor(Math.random() * 600) + 200, // 200-800 cal
        protein: Math.floor(Math.random() * 40) + 10, // 10-50g
        carbs: Math.floor(Math.random() * 80) + 20, // 20-100g
        fats: Math.floor(Math.random() * 35) + 5, // 5-40g
        fiber: Math.floor(Math.random() * 13) + 2, // 2-15g
        sodium: Math.floor(Math.random() * 1300) + 200, // 200-1500mg
        sugar: Math.floor(Math.random() * 23) + 2 // 2-25g
      },
      dietaryTags,
      videoId: null
    };

    recipes.push(recipe);
  }

  return recipes;
}

// Generate recipes
const recipes = generateSampleRecipes(50);

// Ensure directory exists
const dataDir = path.join(__dirname, '..', 'public', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write to file
const outputPath = path.join(dataDir, 'recipes.json');
fs.writeFileSync(outputPath, JSON.stringify(recipes, null, 2));

console.log(`✓ Generated ${recipes.length} sample recipes`);
console.log(`✓ Saved to: ${outputPath}`);

// Print statistics
const cuisineCounts = recipes.reduce((acc, r) => {
  acc[r.cuisine] = (acc[r.cuisine] || 0) + 1;
  return acc;
}, {});

console.log('\nRecipes by cuisine:');
Object.entries(cuisineCounts).sort().forEach(([cuisine, count]) => {
  console.log(`  ${cuisine}: ${count}`);
});
