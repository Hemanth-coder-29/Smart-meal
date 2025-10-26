#!/usr/bin/env node

/**
 * Recipe JSON Data Standardization Script
 * 
 * Purpose: Validates and enforces standardized JSON format for recipe data
 * - Ensures valid JSON array format
 * - Standardizes ingredient field structure (object array)
 * - Normalizes dietary tags to lowercase
 * - Preserves all existing data
 * - Generates comprehensive transformation report
 */

const fs = require('fs');
const path = require('path');

// Configuration
const RECIPES_FILE_PATH = path.join(__dirname, '../public/data/recipes.json');
const REQUIRED_FIELDS = ['id', 'title', 'ingredients', 'cuisine'];
const OPTIONAL_FIELDS = ['dietaryTags', 'mealType', 'description', 'image', 'instructions', 'nutrition'];

// Execution modes
const MODES = {
  STANDARD: 'standard',
  DRY_RUN: 'dry-run',
  FORCE: 'force'
};

class RecipeStandardizer {
  constructor(mode = MODES.STANDARD) {
    this.mode = mode;
    this.stats = {
      totalRecipes: 0,
      transformations: {
        ingredientsConverted: 0,
        dietaryTagsNormalized: 0,
        formatCorrections: 0,
        arrayWrapped: false
      },
      warnings: [],
      errors: [],
      validRecipes: 0,
      invalidRecipes: 0
    };
  }

  /**
   * Main execution method
   */
  async run() {
    console.log('━'.repeat(80));
    console.log('🔧 Recipe JSON Data Standardization');
    console.log('━'.repeat(80));
    console.log(`Mode: ${this.mode.toUpperCase()}`);
    console.log(`File: ${RECIPES_FILE_PATH}`);
    console.log('');

    try {
      // Pre-transformation validation
      this.validateFileExists();
      this.validateFileSize();

      // Load and parse data
      const rawData = this.loadFile();
      const recipes = this.parseData(rawData);

      // Transform data
      const standardizedRecipes = this.transformRecipes(recipes);

      // Post-transformation validation
      this.validateRecipes(standardizedRecipes);

      // Save or report based on mode
      if (this.mode !== MODES.DRY_RUN) {
        this.saveFile(standardizedRecipes);
      }

      // Generate report
      this.generateReport(standardizedRecipes);

      return true;
    } catch (error) {
      console.error('❌ Standardization failed:', error.message);
      if (this.mode !== MODES.FORCE) {
        throw error;
      }
      return false;
    }
  }

  /**
   * Validate file exists
   */
  validateFileExists() {
    if (!fs.existsSync(RECIPES_FILE_PATH)) {
      throw new Error(`Recipe file not found: ${RECIPES_FILE_PATH}`);
    }
    console.log('✓ File exists');
  }

  /**
   * Validate file size (< 50MB)
   */
  validateFileSize() {
    const stats = fs.statSync(RECIPES_FILE_PATH);
    const sizeMB = stats.size / (1024 * 1024);
    
    if (sizeMB > 50) {
      const warning = `Large file size: ${sizeMB.toFixed(2)}MB`;
      this.stats.warnings.push(warning);
      console.warn(`⚠ ${warning}`);
    } else {
      console.log(`✓ File size: ${sizeMB.toFixed(2)}MB`);
    }
  }

  /**
   * Load file content
   */
  loadFile() {
    try {
      return fs.readFileSync(RECIPES_FILE_PATH, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * Parse data with fallback to line-by-line parsing
   */
  parseData(rawData) {
    console.log('');
    console.log('📖 Parsing data...');

    try {
      // Attempt standard JSON parse
      const parsed = JSON.parse(rawData);
      
      if (Array.isArray(parsed)) {
        console.log(`✓ Parsed as valid JSON array (${parsed.length} recipes)`);
        return parsed;
      } else {
        // Not an array, wrap it
        console.log('⚠ JSON is not an array, wrapping in array');
        this.stats.transformations.arrayWrapped = true;
        this.stats.transformations.formatCorrections++;
        return [parsed];
      }
    } catch (error) {
      // Fallback to line-by-line parsing
      console.log('⚠ Standard JSON parse failed, attempting line-by-line parsing');
      return this.parseLineByLine(rawData);
    }
  }

  /**
   * Parse newline-delimited JSON objects
   */
  parseLineByLine(rawData) {
    const lines = rawData.split('\n').filter(line => line.trim());
    const recipes = [];

    for (let i = 0; i < lines.length; i++) {
      try {
        const recipe = JSON.parse(lines[i]);
        recipes.push(recipe);
      } catch (error) {
        const warning = `Line ${i + 1}: Invalid JSON - ${error.message}`;
        this.stats.warnings.push(warning);
      }
    }

    if (recipes.length === 0) {
      throw new Error('No valid recipes found in file');
    }

    console.log(`✓ Parsed ${recipes.length} recipes from ${lines.length} lines`);
    this.stats.transformations.arrayWrapped = true;
    this.stats.transformations.formatCorrections++;
    return recipes;
  }

  /**
   * Transform recipes to standardized format
   */
  transformRecipes(recipes) {
    console.log('');
    console.log('🔄 Transforming recipes...');

    this.stats.totalRecipes = recipes.length;
    const transformed = recipes.map((recipe, index) => {
      return this.transformRecipe(recipe, index);
    });

    console.log(`✓ Transformed ${transformed.length} recipes`);
    return transformed;
  }

  /**
   * Transform individual recipe
   */
  transformRecipe(recipe, index) {
    const transformed = { ...recipe };

    // Transform ingredients
    if (this.shouldTransformIngredients(transformed.ingredients)) {
      transformed.ingredients = this.transformIngredients(transformed.ingredients);
      this.stats.transformations.ingredientsConverted++;
    }

    // Normalize dietary tags
    if (this.shouldNormalizeDietaryTags(transformed)) {
      transformed.dietaryTags = this.normalizeDietaryTags(transformed);
      this.stats.transformations.dietaryTagsNormalized++;
    }

    // Ensure optional fields exist
    if (!transformed.dietaryTags) {
      transformed.dietaryTags = [];
    }

    return transformed;
  }

  /**
   * Check if ingredients need transformation
   */
  shouldTransformIngredients(ingredients) {
    if (!ingredients) return false;
    if (typeof ingredients === 'string') return true;
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      return typeof ingredients[0] === 'string';
    }
    return false;
  }

  /**
   * Transform ingredients to object array
   */
  transformIngredients(ingredients) {
    // If string, split by comma
    if (typeof ingredients === 'string') {
      return ingredients
        .split(',')
        .map(ing => ing.trim())
        .filter(ing => ing)
        .map(ing => ({ name: ing }));
    }

    // If array of strings, convert to objects
    if (Array.isArray(ingredients) && typeof ingredients[0] === 'string') {
      return ingredients
        .map(ing => ing.trim())
        .filter(ing => ing)
        .map(ing => ({ name: ing }));
    }

    return ingredients;
  }

  /**
   * Check if dietary tags need normalization
   */
  shouldNormalizeDietaryTags(recipe) {
    // Always normalize if using alternate field names (dietary, tags)
    if (recipe.dietary || recipe.tags) return true;
    
    const tags = recipe.dietaryTags;
    
    if (!tags) return false;
    if (!Array.isArray(tags)) return true;
    if (tags.length === 0) return false;
    
    // Check if any tag has uppercase
    return tags.some(tag => tag !== tag.toLowerCase());
  }

  /**
   * Normalize dietary tags
   */
  normalizeDietaryTags(recipe) {
    // Find tags from various field names
    let tags = recipe.dietaryTags || recipe.dietary || recipe.tags || [];

    // Convert to array if string
    if (typeof tags === 'string') {
      tags = tags.split(',').map(t => t.trim()).filter(t => t);
    }

    // Ensure tags is an array
    if (!Array.isArray(tags)) {
      tags = [];
    }

    // Convert to lowercase
    return tags.map(tag => tag.toLowerCase());
  }

  /**
   * Validate transformed recipes
   */
  validateRecipes(recipes) {
    console.log('');
    console.log('✅ Validating recipes...');

    recipes.forEach((recipe, index) => {
      const validation = this.validateRecipe(recipe, index);
      if (validation.valid) {
        this.stats.validRecipes++;
      } else {
        this.stats.invalidRecipes++;
        this.stats.warnings.push(`Recipe ${index} (${recipe.id || 'no-id'}): ${validation.errors.join(', ')}`);
      }
    });

    console.log(`✓ Valid recipes: ${this.stats.validRecipes}/${recipes.length}`);
    
    if (this.stats.invalidRecipes > 0) {
      console.warn(`⚠ Invalid recipes: ${this.stats.invalidRecipes}`);
    }
  }

  /**
   * Validate individual recipe
   */
  validateRecipe(recipe, index) {
    const errors = [];

    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!recipe[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate ingredients format
    if (recipe.ingredients) {
      if (!Array.isArray(recipe.ingredients)) {
        errors.push('Ingredients must be an array');
      } else if (recipe.ingredients.length > 0) {
        const firstIngredient = recipe.ingredients[0];
        if (typeof firstIngredient !== 'object' || !firstIngredient.name) {
          errors.push('Ingredients must be objects with "name" field');
        }
      }
    }

    // Validate dietary tags format
    if (recipe.dietaryTags && !Array.isArray(recipe.dietaryTags)) {
      errors.push('dietaryTags must be an array');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Save standardized file with backup
   */
  saveFile(recipes) {
    console.log('');
    console.log('💾 Saving standardized file...');

    try {
      // Create backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = RECIPES_FILE_PATH.replace('.json', `.backup-${timestamp}.json`);
      
      fs.copyFileSync(RECIPES_FILE_PATH, backupPath);
      console.log(`✓ Backup created: ${path.basename(backupPath)}`);

      // Save standardized file
      const jsonContent = JSON.stringify(recipes, null, 2);
      fs.writeFileSync(RECIPES_FILE_PATH, jsonContent, 'utf8');
      console.log(`✓ Standardized file saved: ${path.basename(RECIPES_FILE_PATH)}`);

    } catch (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive transformation report
   */
  generateReport(recipes) {
    console.log('');
    console.log('━'.repeat(80));
    console.log('📊 TRANSFORMATION REPORT');
    console.log('━'.repeat(80));

    // Execution Summary
    console.log('');
    console.log('📋 Execution Summary:');
    console.log(`   Total Recipes Processed: ${this.stats.totalRecipes}`);
    console.log(`   Valid Recipes: ${this.stats.validRecipes}`);
    console.log(`   Invalid Recipes: ${this.stats.invalidRecipes}`);
    console.log(`   Execution Mode: ${this.mode}`);

    // Transformations Applied
    console.log('');
    console.log('🔄 Transformations Applied:');
    console.log(`   Array Wrapped: ${this.stats.transformations.arrayWrapped ? 'Yes' : 'No'}`);
    console.log(`   Ingredients Converted: ${this.stats.transformations.ingredientsConverted}`);
    console.log(`   Dietary Tags Normalized: ${this.stats.transformations.dietaryTagsNormalized}`);
    console.log(`   Format Corrections: ${this.stats.transformations.formatCorrections}`);

    // Sample Output
    if (recipes.length > 0) {
      console.log('');
      console.log('📄 Sample Standardized Recipe:');
      console.log(JSON.stringify(recipes[0], null, 2).substring(0, 800) + '...');
    }

    // Warnings
    if (this.stats.warnings.length > 0) {
      console.log('');
      console.log('⚠ Warnings:');
      this.stats.warnings.slice(0, 10).forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
      if (this.stats.warnings.length > 10) {
        console.log(`   ... and ${this.stats.warnings.length - 10} more warnings`);
      }
    }

    // Statistics
    console.log('');
    console.log('📈 Data Quality Statistics:');
    this.generateStatistics(recipes);

    // Recommendations
    console.log('');
    console.log('💡 Recommendations:');
    if (this.stats.invalidRecipes > 0) {
      console.log('   ⚠ Manual review required for invalid recipes');
    } else {
      console.log('   ✓ All recipes are valid and standardized');
    }
    if (this.mode === MODES.DRY_RUN) {
      console.log('   ℹ Run in standard mode to apply changes');
    }

    console.log('');
    console.log('━'.repeat(80));
    console.log('✅ Standardization complete!');
    console.log('━'.repeat(80));
  }

  /**
   * Generate data quality statistics
   */
  generateStatistics(recipes) {
    const cuisines = new Set();
    const mealTypes = new Set();
    const dietaryTagsCount = {};
    let totalIngredients = 0;

    recipes.forEach(recipe => {
      if (recipe.cuisine) cuisines.add(recipe.cuisine);
      if (recipe.mealType) mealTypes.add(recipe.mealType);
      if (recipe.ingredients) totalIngredients += recipe.ingredients.length;
      
      if (recipe.dietaryTags && Array.isArray(recipe.dietaryTags)) {
        recipe.dietaryTags.forEach(tag => {
          dietaryTagsCount[tag] = (dietaryTagsCount[tag] || 0) + 1;
        });
      }
    });

    console.log(`   Unique Cuisines: ${cuisines.size}`);
    console.log(`   Meal Types: ${Array.from(mealTypes).join(', ') || 'None'}`);
    console.log(`   Average Ingredients per Recipe: ${(totalIngredients / recipes.length).toFixed(1)}`);
    
    const topTags = Object.entries(dietaryTagsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (topTags.length > 0) {
      console.log('   Top Dietary Tags:');
      topTags.forEach(([tag, count]) => {
        console.log(`      - ${tag}: ${count} recipes`);
      });
    }
  }
}

// CLI Execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const mode = args.includes('--dry-run') ? MODES.DRY_RUN :
               args.includes('--force') ? MODES.FORCE :
               MODES.STANDARD;

  const standardizer = new RecipeStandardizer(mode);
  standardizer.run()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('');
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = RecipeStandardizer;
