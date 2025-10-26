# JSON Data Standardization

## Overview

The JSON Data Standardization feature ensures the recipe data file (`public/data/recipes.json`) maintains a standardized JSON array format with consistent field structures, enabling reliable data consumption across the SmartMeal application.

## Features

✅ **Automatic Format Validation** - Validates JSON array format with proper structure  
✅ **Ingredient Standardization** - Converts string/array ingredients to object array format  
✅ **Dietary Tag Normalization** - Consolidates and normalizes dietary tags to lowercase  
✅ **Data Preservation** - All existing data is retained during transformation  
✅ **Comprehensive Reporting** - Detailed transformation reports with statistics  
✅ **Backup Creation** - Automatic backup before any modifications  
✅ **Multiple Execution Modes** - Standard, dry-run, and force modes  

## Quick Start

### Run Standardization

```bash
# Standard mode (applies changes with backup)
npm run standardize

# Dry-run mode (preview changes without applying)
npm run standardize:dry-run

# Force mode (override warnings)
npm run standardize:force
```

### Run Tests

```bash
# Run comprehensive test suite
npm run test:standardization
```

## Execution Modes

### Standard Mode
Default execution mode that:
- Validates the recipe data file
- Applies all necessary transformations
- Creates timestamped backup before saving
- Generates comprehensive report
- Saves standardized file

```bash
npm run standardize
```

### Dry-Run Mode
Preview mode that:
- Validates and transforms data
- Generates full report
- **Does NOT** modify the file
- **Does NOT** create backup
- Useful for previewing changes

```bash
npm run standardize:dry-run
```

### Force Mode
Override mode that:
- Applies transformations even with warnings
- Useful for automated scripts
- Still creates backups
- Bypasses non-critical validation failures

```bash
npm run standardize:force
```

## Transformation Rules

### Rule 1: Array Format Enforcement
**Condition**: File contains newline-delimited JSON objects  
**Action**: Parse each line, collect objects, wrap in proper JSON array  
**Example**:
```json
// Before (line-delimited)
{"id": "1", "title": "Recipe 1"}
{"id": "2", "title": "Recipe 2"}

// After (array)
[
  {"id": "1", "title": "Recipe 1"},
  {"id": "2", "title": "Recipe 2"}
]
```

### Rule 2: Ingredients Array Conversion
**Condition**: Ingredients field is a comma-separated string or string array  
**Action**: Convert to object array with `name` property  
**Examples**:

```json
// From string
"ingredients": "tomato, onion, garlic"
↓
"ingredients": [
  {"name": "tomato"},
  {"name": "onion"},
  {"name": "garlic"}
]

// From string array
"ingredients": ["tomato", "onion", "garlic"]
↓
"ingredients": [
  {"name": "tomato"},
  {"name": "onion"},
  {"name": "garlic"}
]
```

### Rule 3: Dietary Tags Normalization
**Condition**: Tags in various field names or uppercase format  
**Action**: Consolidate to `dietaryTags` array and convert to lowercase  
**Examples**:

```json
// From uppercase
"dietaryTags": ["VEGAN", "Gluten-Free"]
↓
"dietaryTags": ["vegan", "gluten-free"]

// From alternate field names
"dietary": ["Vegetarian", "Organic"]
↓
"dietaryTags": ["vegetarian", "organic"]

// From string
"tags": "Keto, Low-Carb"
↓
"dietaryTags": ["keto", "low-carb"]
```

### Rule 4: Data Preservation
**Principle**: No data deletion during standardization  
**Action**: All existing fields retained; only format transformations applied

```json
// Custom fields are preserved
{
  "id": "recipe_001",
  "customField": "custom value",
  "nestedData": {"key": "value"}
}
↓ (all fields retained)
{
  "id": "recipe_001",
  "customField": "custom value",
  "nestedData": {"key": "value"},
  "dietaryTags": []  // Added if missing
}
```

## Required Recipe Schema

Each recipe object must conform to this structure:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string \| number | ✅ Yes | Unique recipe identifier |
| `title` | string | ✅ Yes | Recipe name |
| `ingredients` | array | ✅ Yes | Array of ingredient objects |
| `cuisine` | string | ✅ Yes | Cuisine category |
| `dietaryTags` | array | ⚪ No | Dietary classifications |
| `mealType` | string | ⚪ No | Meal category |

### Ingredient Object Structure

```typescript
interface Ingredient {
  name: string;           // Required
  quantity?: number;      // Optional
  unit?: string;          // Optional
  substitutions?: string[]; // Optional
}
```

## Validation

### Pre-Transformation Validation
- ✅ File exists
- ✅ File size < 50MB (warns if larger)
- ✅ Valid JSON or parseable format

### Post-Transformation Validation
- ✅ All required fields present
- ✅ Ingredients are object arrays
- ✅ Dietary tags are string arrays
- ✅ Input count matches output count
- ✅ Valid JSON array structure

## Output & Reporting

### File Output
- **Location**: `public/data/recipes.json`
- **Format**: Valid JSON array with 2-space indentation
- **Encoding**: UTF-8
- **Backup**: `recipes.backup-{timestamp}.json`

### Transformation Report

The report includes:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TRANSFORMATION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Execution Summary:
   Total Recipes Processed: 50
   Valid Recipes: 50
   Invalid Recipes: 0
   Execution Mode: standard

🔄 Transformations Applied:
   Array Wrapped: No
   Ingredients Converted: 0
   Dietary Tags Normalized: 0
   Format Corrections: 0

📄 Sample Standardized Recipe:
   {sample recipe JSON...}

⚠ Warnings:
   (any warnings listed here)

📈 Data Quality Statistics:
   Unique Cuisines: 6
   Meal Types: Snack, Dinner, Breakfast, Lunch
   Average Ingredients per Recipe: 6.0
   Top Dietary Tags:
      - vegan: 11 recipes
      - keto: 10 recipes
      - gluten-free: 7 recipes

💡 Recommendations:
   ✓ All recipes are valid and standardized
```

## Testing

### Test Suite Coverage

The standardization script includes comprehensive tests:

1. ✅ **String Ingredients to Object Array** - Validates comma-separated string conversion
2. ✅ **Array of String Ingredients** - Validates string array conversion
3. ✅ **Uppercase Dietary Tags** - Validates lowercase normalization
4. ✅ **Mixed Dietary Field Names** - Validates field consolidation
5. ✅ **Line-Delimited JSON** - Validates line-by-line parsing
6. ✅ **Already Standardized Data** - Validates no-change scenario
7. ✅ **Missing Optional Fields** - Validates default value addition
8. ✅ **Data Preservation** - Validates custom field retention

### Running Tests

```bash
npm run test:standardization
```

Expected output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TEST RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Tests: 8
Passed: 8 ✓
Failed: 0 ✗
Success Rate: 100.0%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All tests passed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Error Handling

### Error Types & Recovery

| Error Type | Recovery Strategy | Fallback |
|------------|-------------------|----------|
| Invalid JSON | Line-by-line object parsing | Manual review prompt |
| Missing Required Field | Log warning, include in report | Continue processing others |
| Malformed Ingredient | Preserve original format | Flag for review |
| File Write Error | Retry with backup location | Rollback changes |

### Example Error Scenarios

```bash
# File not found
❌ Standardization failed: Recipe file not found: /path/to/recipes.json

# Invalid JSON (recoverable)
⚠ Standard JSON parse failed, attempting line-by-line parsing
✓ Parsed 50 recipes from 50 lines

# Missing required fields (warning)
⚠ Recipe 15 (recipe_015): Missing required field: cuisine
```

## Integration with SmartMeal

The standardized data integrates with:

| Component | Dependency | Benefit |
|-----------|------------|---------|
| Recipe Search API | Data consumer | Consistent ingredient querying |
| Nutrition Calculator | Data consumer | Reliable ingredient parsing |
| TypeScript Types | Schema enforcement | Type safety validation |
| Shopping List Generator | Data consumer | Accurate ingredient extraction |

## Best Practices

### When to Run Standardization

✅ **Recommended Times**:
- After bulk recipe data imports
- Before deployment to production
- After manual JSON file edits
- As part of data quality checks
- During initial project setup

⚠️ **Cautions**:
- Always run dry-run first for large changes
- Review transformation reports
- Keep backups of original data
- Test with application after standardization

### Backup Management

Backups are automatically created with timestamps:
```
recipes.backup-2025-10-26T14-05-52-571Z.json
```

**Recommendation**: Keep at least 3 most recent backups and delete older ones periodically.

## Troubleshooting

### Common Issues

**Issue**: Script fails with "File not found"  
**Solution**: Verify `public/data/recipes.json` exists and path is correct

**Issue**: All transformations show 0  
**Solution**: Data is already standardized, no changes needed (this is normal)

**Issue**: Invalid recipes in report  
**Solution**: Review warnings, fix missing required fields manually

**Issue**: Backup file not created  
**Solution**: Check write permissions on `public/data/` directory

## Files & Scripts

### Main Script
```
scripts/standardizeRecipes.js
```
Core standardization logic with validation, transformation, and reporting.

### Test Suite
```
scripts/testStandardization.js
```
Comprehensive test suite for all transformation scenarios.

### NPM Scripts
```json
{
  "standardize": "node scripts/standardizeRecipes.js",
  "standardize:dry-run": "node scripts/standardizeRecipes.js --dry-run",
  "standardize:force": "node scripts/standardizeRecipes.js --force",
  "test:standardization": "node scripts/testStandardization.js"
}
```

## Future Enhancements

Potential improvements for future versions:

- 🔄 Real-time validation on recipe creation/update
- 📊 Automated data quality scoring
- 🔌 Support for multiple recipe data sources
- ⚡ Incremental validation for large datasets
- 📝 Schema versioning and migration support
- 🔍 Ingredient synonym standardization
- 🌐 Multi-language support for dietary tags

## Support

For issues or questions:
1. Check this documentation
2. Review transformation reports
3. Run test suite to verify functionality
4. Check backup files if data issues occur

---

**Version**: 1.0.0  
**Last Updated**: October 26, 2025  
**Status**: ✅ Production Ready
