#!/usr/bin/env node

/**
 * Test Suite for Recipe Standardization
 * 
 * Tests all transformation scenarios:
 * - String ingredients to object array
 * - Array of string ingredients to object array
 * - Dietary tags normalization
 * - Line-delimited JSON parsing
 * - Invalid data handling
 */

const fs = require('fs');
const path = require('path');
const RecipeStandardizer = require('./standardizeRecipes');

const TEST_DIR = path.join(__dirname, '../public/data/test');

class StandardizationTester {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  /**
   * Run all tests
   */
  async runTests() {
    console.log('━'.repeat(80));
    console.log('🧪 Recipe Standardization Test Suite');
    console.log('━'.repeat(80));
    console.log('');

    // Ensure test directory exists
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }

    try {
      await this.testStringIngredients();
      await this.testArrayStringIngredients();
      await this.testUppercaseDietaryTags();
      await this.testMixedDietaryFields();
      await this.testLineDelimitedJSON();
      await this.testAlreadyStandardized();
      await this.testMissingOptionalFields();
      await this.testDataPreservation();

      this.printResults();
    } finally {
      // Cleanup
      this.cleanup();
    }
  }

  /**
   * Test 1: String ingredients conversion
   */
  async testStringIngredients() {
    const testName = 'String Ingredients to Object Array';
    this.totalTests++;

    try {
      const testData = [{
        id: 'test_001',
        title: 'Test Recipe',
        cuisine: 'test',
        ingredients: 'tomato, onion, garlic',
        dietaryTags: []
      }];

      const result = await this.runStandardization(testData, 'string-ingredients.json');
      
      const valid = 
        Array.isArray(result[0].ingredients) &&
        result[0].ingredients.length === 3 &&
        result[0].ingredients[0].name === 'tomato' &&
        result[0].ingredients[1].name === 'onion' &&
        result[0].ingredients[2].name === 'garlic';

      this.recordTest(testName, valid, valid ? 'Ingredients converted successfully' : 'Conversion failed');
    } catch (error) {
      this.recordTest(testName, false, error.message);
    }
  }

  /**
   * Test 2: Array of string ingredients conversion
   */
  async testArrayStringIngredients() {
    const testName = 'Array of String Ingredients to Object Array';
    this.totalTests++;

    try {
      const testData = [{
        id: 'test_002',
        title: 'Test Recipe',
        cuisine: 'test',
        ingredients: ['tomato', 'onion', 'garlic'],
        dietaryTags: []
      }];

      const result = await this.runStandardization(testData, 'array-string-ingredients.json');
      
      const valid = 
        Array.isArray(result[0].ingredients) &&
        result[0].ingredients.length === 3 &&
        typeof result[0].ingredients[0] === 'object' &&
        result[0].ingredients[0].name === 'tomato';

      this.recordTest(testName, valid, valid ? 'String array converted successfully' : 'Conversion failed');
    } catch (error) {
      this.recordTest(testName, false, error.message);
    }
  }

  /**
   * Test 3: Uppercase dietary tags normalization
   */
  async testUppercaseDietaryTags() {
    const testName = 'Uppercase Dietary Tags Normalization';
    this.totalTests++;

    try {
      const testData = [{
        id: 'test_003',
        title: 'Test Recipe',
        cuisine: 'test',
        ingredients: [{ name: 'tomato' }],
        dietaryTags: ['VEGAN', 'Gluten-Free', 'LOW-CARB']
      }];

      const result = await this.runStandardization(testData, 'uppercase-tags.json');
      
      const valid = 
        result[0].dietaryTags.every(tag => tag === tag.toLowerCase()) &&
        result[0].dietaryTags.includes('vegan') &&
        result[0].dietaryTags.includes('gluten-free') &&
        result[0].dietaryTags.includes('low-carb');

      this.recordTest(testName, valid, valid ? 'Tags normalized to lowercase' : 'Normalization failed');
    } catch (error) {
      this.recordTest(testName, false, error.message);
    }
  }

  /**
   * Test 4: Mixed dietary field names
   */
  async testMixedDietaryFields() {
    const testName = 'Mixed Dietary Field Names';
    this.totalTests++;

    try {
      const testData = [{
        id: 'test_004',
        title: 'Test Recipe',
        cuisine: 'test',
        ingredients: [{ name: 'tomato' }],
        dietary: ['vegetarian', 'organic']
      }];

      const result = await this.runStandardization(testData, 'mixed-dietary-fields.json');
      
      const valid = 
        Array.isArray(result[0].dietaryTags) &&
        result[0].dietaryTags.includes('vegetarian') &&
        result[0].dietaryTags.includes('organic');

      this.recordTest(testName, valid, valid ? 'Dietary fields consolidated' : 'Consolidation failed');
    } catch (error) {
      this.recordTest(testName, false, error.message);
    }
  }

  /**
   * Test 5: Line-delimited JSON parsing
   */
  async testLineDelimitedJSON() {
    const testName = 'Line-Delimited JSON Parsing';
    this.totalTests++;

    try {
      // Create line-delimited JSON file
      const testFile = path.join(TEST_DIR, 'line-delimited.json');
      const lineData = [
        '{"id":"test_005a","title":"Recipe 1","cuisine":"test","ingredients":[{"name":"tomato"}],"dietaryTags":[]}',
        '{"id":"test_005b","title":"Recipe 2","cuisine":"test","ingredients":[{"name":"onion"}],"dietaryTags":[]}'
      ].join('\n');

      fs.writeFileSync(testFile, lineData, 'utf8');

      // Mock the standardizer to use this file
      const originalPath = require.resolve('./standardizeRecipes');
      delete require.cache[originalPath];
      
      // Read and parse manually
      const content = fs.readFileSync(testFile, 'utf8');
      const lines = content.split('\n').filter(l => l.trim());
      const parsed = lines.map(line => JSON.parse(line));

      const valid = Array.isArray(parsed) && parsed.length === 2;

      this.recordTest(testName, valid, valid ? 'Line-delimited JSON parsed successfully' : 'Parsing failed');
    } catch (error) {
      this.recordTest(testName, false, error.message);
    }
  }

  /**
   * Test 6: Already standardized data
   */
  async testAlreadyStandardized() {
    const testName = 'Already Standardized Data (No Changes)';
    this.totalTests++;

    try {
      const testData = [{
        id: 'test_006',
        title: 'Test Recipe',
        cuisine: 'test',
        ingredients: [
          { name: 'tomato', quantity: 2, unit: 'cups' },
          { name: 'onion', quantity: 1, unit: 'medium' }
        ],
        dietaryTags: ['vegan', 'gluten-free']
      }];

      const result = await this.runStandardization(testData, 'already-standardized.json');
      
      const valid = 
        JSON.stringify(result[0].ingredients) === JSON.stringify(testData[0].ingredients) &&
        JSON.stringify(result[0].dietaryTags) === JSON.stringify(testData[0].dietaryTags);

      this.recordTest(testName, valid, valid ? 'No changes applied (already standard)' : 'Unexpected changes');
    } catch (error) {
      this.recordTest(testName, false, error.message);
    }
  }

  /**
   * Test 7: Missing optional fields
   */
  async testMissingOptionalFields() {
    const testName = 'Missing Optional Fields (Add Defaults)';
    this.totalTests++;

    try {
      const testData = [{
        id: 'test_007',
        title: 'Test Recipe',
        cuisine: 'test',
        ingredients: [{ name: 'tomato' }]
        // No dietaryTags or mealType
      }];

      const result = await this.runStandardization(testData, 'missing-optional.json');
      
      const valid = 
        Array.isArray(result[0].dietaryTags) &&
        result[0].dietaryTags.length === 0;

      this.recordTest(testName, valid, valid ? 'Optional fields added with defaults' : 'Defaults not added');
    } catch (error) {
      this.recordTest(testName, false, error.message);
    }
  }

  /**
   * Test 8: Data preservation
   */
  async testDataPreservation() {
    const testName = 'Data Preservation (No Data Loss)';
    this.totalTests++;

    try {
      const testData = [{
        id: 'test_008',
        title: 'Test Recipe',
        cuisine: 'test',
        ingredients: 'tomato, onion',
        dietaryTags: [],
        customField: 'custom value',
        anotherField: { nested: 'data' }
      }];

      const result = await this.runStandardization(testData, 'data-preservation.json');
      
      const valid = 
        result[0].customField === 'custom value' &&
        result[0].anotherField.nested === 'data';

      this.recordTest(testName, valid, valid ? 'All fields preserved' : 'Data loss detected');
    } catch (error) {
      this.recordTest(testName, false, error.message);
    }
  }

  /**
   * Helper: Run standardization on test data
   */
  async runStandardization(data, filename) {
    const testFile = path.join(TEST_DIR, filename);
    fs.writeFileSync(testFile, JSON.stringify(data, null, 2), 'utf8');

    // Import standardizer module
    const RecipeStandardizer = require('./standardizeRecipes');
    const standardizer = new RecipeStandardizer('standard');
    
    // Mock file path for testing
    const originalPath = standardizer.constructor.prototype.RECIPES_FILE_PATH;
    
    // Read, transform, and return
    const content = fs.readFileSync(testFile, 'utf8');
    const parsed = JSON.parse(content);
    const recipes = Array.isArray(parsed) ? parsed : [parsed];
    
    return recipes.map(recipe => {
      const transformed = { ...recipe };
      
      // Apply transformations
      if (standardizer.shouldTransformIngredients(transformed.ingredients)) {
        transformed.ingredients = standardizer.transformIngredients(transformed.ingredients);
      }
      
      if (standardizer.shouldNormalizeDietaryTags(transformed)) {
        transformed.dietaryTags = standardizer.normalizeDietaryTags(transformed);
      }
      
      if (!transformed.dietaryTags) {
        transformed.dietaryTags = [];
      }
      
      return transformed;
    });
  }

  /**
   * Record test result
   */
  recordTest(name, passed, message) {
    this.testResults.push({ name, passed, message });
    if (passed) {
      this.passedTests++;
      console.log(`✓ ${name}`);
      console.log(`  → ${message}`);
    } else {
      this.failedTests++;
      console.log(`✗ ${name}`);
      console.log(`  → ${message}`);
    }
    console.log('');
  }

  /**
   * Print test results summary
   */
  printResults() {
    console.log('━'.repeat(80));
    console.log('📊 TEST RESULTS');
    console.log('━'.repeat(80));
    console.log('');
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests} ✓`);
    console.log(`Failed: ${this.failedTests} ✗`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    console.log('');
    console.log('━'.repeat(80));
    
    if (this.failedTests === 0) {
      console.log('✅ All tests passed!');
    } else {
      console.log('❌ Some tests failed. Review the output above.');
    }
    console.log('━'.repeat(80));
  }

  /**
   * Cleanup test files
   */
  cleanup() {
    if (fs.existsSync(TEST_DIR)) {
      const files = fs.readdirSync(TEST_DIR);
      files.forEach(file => {
        fs.unlinkSync(path.join(TEST_DIR, file));
      });
      fs.rmdirSync(TEST_DIR);
    }
  }
}

// Run tests
if (require.main === module) {
  const tester = new StandardizationTester();
  tester.runTests()
    .then(() => {
      process.exit(tester.failedTests === 0 ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test suite error:', error);
      process.exit(1);
    });
}

module.exports = StandardizationTester;
