# JSON Standardization Quick Reference

## Commands

```bash
# Run standardization (with backup)
npm run standardize

# Preview changes (no file modification)
npm run standardize:dry-run

# Force mode (override warnings)
npm run standardize:force

# Run tests
npm run test:standardization
```

## Transformation Examples

### String Ingredients → Object Array
```json
"ingredients": "tomato, onion, garlic"
```
↓
```json
"ingredients": [
  {"name": "tomato"},
  {"name": "onion"},
  {"name": "garlic"}
]
```

### Uppercase Tags → Lowercase
```json
"dietaryTags": ["VEGAN", "Gluten-Free"]
```
↓
```json
"dietaryTags": ["vegan", "gluten-free"]
```

### Alternate Field Names → dietaryTags
```json
"dietary": ["Vegetarian"]
```
↓
```json
"dietaryTags": ["vegetarian"]
```

## Required Fields

✅ `id` - Unique identifier  
✅ `title` - Recipe name  
✅ `ingredients` - Array of ingredient objects  
✅ `cuisine` - Cuisine type  

## Optional Fields

⚪ `dietaryTags` - Array of dietary tags  
⚪ `mealType` - Breakfast, Lunch, Dinner, Snack  
⚪ `description` - Recipe description  
⚪ `image` - Image path  
⚪ `instructions` - Cooking instructions  
⚪ `nutrition` - Nutrition information  

## Validation Checks

✓ Valid JSON array format  
✓ All required fields present  
✓ Ingredients are object arrays  
✓ Dietary tags are string arrays  
✓ No data loss during transformation  

## Backup Files

Format: `recipes.backup-{timestamp}.json`  
Location: `public/data/`  
Example: `recipes.backup-2025-10-26T14-05-52-571Z.json`

## Common Workflows

### Before Deployment
```bash
npm run standardize:dry-run  # Preview
npm run standardize           # Apply
npm run test:standardization  # Verify
```

### After Data Import
```bash
npm run standardize:dry-run  # Check changes
# Review report
npm run standardize           # Apply if looks good
```

### Troubleshooting
```bash
npm run standardize:dry-run  # See what would change
# Check warnings in report
npm run standardize:force    # Force if needed
```

## Report Sections

📋 **Execution Summary** - Total processed, valid/invalid counts  
🔄 **Transformations Applied** - Count of each transformation  
📄 **Sample Output** - Example standardized recipe  
⚠️ **Warnings** - Issues that need attention  
📈 **Statistics** - Data quality metrics  
💡 **Recommendations** - Next steps  

---

For detailed documentation, see [JSON_STANDARDIZATION.md](./JSON_STANDARDIZATION.md)
