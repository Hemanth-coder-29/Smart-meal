/**
 * Recipe ID Utilities
 * Provides ID normalization, fuzzy matching, and suggestion capabilities
 */

import logger from './debug';

/**
 * Normalize a recipe ID for consistent comparison
 * @param rawId - The raw ID from URL or user input
 * @returns Normalized ID string
 */
export function normalizeRecipeId(rawId: string): string {
  if (!rawId) return '';
  
  // Step 1: URL decode
  let normalized = decodeURIComponent(rawId);
  
  // Step 2: Trim whitespace
  normalized = normalized.trim();
  
  // Step 3: Lowercase
  normalized = normalized.toLowerCase();
  
  // Step 4: Remove common file extensions
  normalized = normalized.replace(/\.(json|html|htm)$/i, '');
  
  // Step 5: Normalize common prefixes (optional - keep as is for now)
  // This could be expanded if needed: recipe-001, rec-001, r-001 all become the same
  
  return normalized;
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0 to 1)
 */
function similarityScore(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;
  
  const distance = levenshteinDistance(str1, str2);
  return 1.0 - distance / maxLen;
}

/**
 * Extract numeric portion from ID
 */
function extractNumeric(id: string): string | null {
  const match = id.match(/\d+/);
  return match ? match[0] : null;
}

/**
 * Find a recipe by ID with fuzzy matching
 * @param recipes - Array of recipes to search
 * @param requestedId - The ID being searched for
 * @returns Object with found recipe and match info
 */
export function findRecipeById<T extends { id: string; title?: string }>(
  recipes: T[],
  requestedId: string
): {
  recipe: T | null;
  matchType: 'exact' | 'case-insensitive' | 'fuzzy' | 'none';
  normalizedRequestedId: string;
  matchedId?: string;
} {
  const normalizedRequestedId = normalizeRecipeId(requestedId);
  
  logger.debug('RecipeIDUtils', 'Starting ID lookup', {
    rawId: requestedId,
    normalizedId: normalizedRequestedId,
  });

  // Step 1: Exact match (after normalization)
  let recipe = recipes.find((r) => normalizeRecipeId(r.id) === normalizedRequestedId);
  if (recipe) {
    logger.debug('RecipeIDUtils', 'Exact match found', {
      matchedId: recipe.id,
    });
    return {
      recipe,
      matchType: 'exact',
      normalizedRequestedId,
      matchedId: recipe.id,
    };
  }

  // Step 2: Case-insensitive match (raw comparison)
  recipe = recipes.find((r) => r.id.toLowerCase() === requestedId.toLowerCase());
  if (recipe) {
    logger.warn('RecipeIDUtils', 'Case-insensitive match found', {
      requestedId,
      matchedId: recipe.id,
      note: 'Consider using exact case in links',
    });
    return {
      recipe,
      matchType: 'case-insensitive',
      normalizedRequestedId,
      matchedId: recipe.id,
    };
  }

  // Step 3: Fuzzy matching with Levenshtein distance
  // Only attempt if edit distance is small (within 2 characters)
  let bestMatch: T | null = null;
  let bestScore = 0;
  const threshold = 0.8; // 80% similarity required

  for (const r of recipes) {
    const score = similarityScore(normalizedRequestedId, normalizeRecipeId(r.id));
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = r;
    }
  }

  if (bestMatch) {
    logger.warn('RecipeIDUtils', 'Fuzzy match applied', {
      requestedId: normalizedRequestedId,
      matchedId: bestMatch.id,
      similarity: `${(bestScore * 100).toFixed(1)}%`,
      note: 'Auto-correction applied',
    });
    return {
      recipe: bestMatch,
      matchType: 'fuzzy',
      normalizedRequestedId,
      matchedId: bestMatch.id,
    };
  }

  // No match found
  logger.warn('RecipeIDUtils', 'No match found', {
    requestedId: normalizedRequestedId,
    totalRecipes: recipes.length,
  });

  return {
    recipe: null,
    matchType: 'none',
    normalizedRequestedId,
  };
}

/**
 * Generate suggestions for similar recipe IDs
 * @param recipes - Array of recipes to search
 * @param requestedId - The ID that was not found
 * @param maxSuggestions - Maximum number of suggestions to return
 * @returns Array of suggested recipes with similarity scores
 */
export function generateIdSuggestions<T extends { id: string; title?: string }>(
  recipes: T[],
  requestedId: string,
  maxSuggestions = 5
): Array<{
  id: string;
  title?: string;
  similarity: number;
  reason: string;
}> {
  const normalizedRequestedId = normalizeRecipeId(requestedId);
  const suggestions: Array<{
    id: string;
    title?: string;
    similarity: number;
    reason: string;
  }> = [];

  // Calculate similarity for all recipes
  for (const recipe of recipes) {
    const normalizedRecipeId = normalizeRecipeId(recipe.id);
    const score = similarityScore(normalizedRequestedId, normalizedRecipeId);
    
    if (score > 0.5) {
      // Only suggest if at least 50% similar
      let reason = 'Similar ID pattern';
      
      // Check for numeric similarity
      const requestedNumeric = extractNumeric(normalizedRequestedId);
      const recipeNumeric = extractNumeric(normalizedRecipeId);
      if (requestedNumeric && recipeNumeric && requestedNumeric === recipeNumeric) {
        reason = 'Same numeric ID';
      }
      
      suggestions.push({
        id: recipe.id,
        title: recipe.title,
        similarity: score,
        reason,
      });
    }
  }

  // Sort by similarity (descending) and return top N
  suggestions.sort((a, b) => b.similarity - a.similarity);
  return suggestions.slice(0, maxSuggestions);
}

/**
 * Log ID validation details for debugging
 */
export function logIdValidation(
  rawId: string,
  normalizedId: string,
  found: boolean,
  sampleIds: string[]
): void {
  logger.debug('RecipeIDUtils', 'ID validation details', {
    rawId,
    normalized: normalizedId,
    found,
    sampleValidIds: sampleIds.slice(0, 5),
    idType: typeof rawId,
  });
}
