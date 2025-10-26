# SmartMeal Debugging Guide

This guide provides comprehensive information on debugging the SmartMeal application, understanding log output, and resolving common issues.

## Table of Contents

1. [Where to Find Logs](#where-to-find-logs)
2. [Understanding Log Output](#understanding-log-output)
3. [Common Error Scenarios](#common-error-scenarios)
4. [Debug Mode Activation](#debug-mode-activation)
5. [Error Response Codes](#error-response-codes)
6. [Troubleshooting Decision Trees](#troubleshooting-decision-trees)

---

## Where to Find Logs

### Browser Console Logs

**Location**: Browser DevTools → Console tab (Press `F12` or `Ctrl+Shift+I`)

**What you'll find here:**
- Client-side component errors
- API fetch request/response logs
- Error boundary catches
- User interaction logs
- Validation errors

**How to use:**
1. Open DevTools
2. Navigate to Console tab
3. Filter by log level (Info, Warn, Error)
4. Search for specific contexts (e.g., "API:RecipeSearch")

### Server Console Logs

**Location**: Terminal where `npm run dev` is running

**What you'll find here:**
- API route entry/exit logs
- File system operations
- Server-side processing logs
- API errors with full stack traces
- Performance timing

**How to use:**
1. Keep terminal visible while debugging
2. Look for color-coded log levels
3. Match request IDs with browser console logs
4. Check timestamps to correlate events

### Network Tab Diagnostics

**Location**: Browser DevTools → Network tab

**What you'll find here:**
- All HTTP requests and responses
- Request/response headers
- Response status codes
- Response body preview
- Request timing and size

**How to use:**
1. Open DevTools Network tab
2. Filter by "Fetch/XHR" to see API calls
3. Click on a request to see details
4. Check Response tab for API response
5. Check Headers tab for custom debug headers

---

## Understanding Log Output

### Log Format

All logs follow this format:
```
[ICON] [LEVEL] [HH:MM:SS.mmm] [Context] Message
  → key1: value1
  → key2: value2
```

**Example:**
```
✅ [SUCCESS] [14:30:45.123] [API:RecipeSearch] Response sent
  → status: 200
  → resultCount: 12
  → processingTime: 78ms
  → requestId: req_abc123
```

### Log Levels

| Icon | Level | Color | When Used |
|------|-------|-------|-----------|
| 🔍 | DEBUG | Gray | Detailed debugging information |
| ℹ️ | INFO | Blue | General informational messages |
| ⚠️ | WARN | Yellow/Orange | Warning conditions |
| ❌ | ERROR | Red | Error conditions |
| ✅ | SUCCESS | Green | Successful operations |

### Context Tags

Context tags identify where the log originated:

| Context | Meaning |
|---------|---------|
| `API:RecipeSearch` | Recipe search API endpoint |
| `API:RecipeDetail` | Recipe detail API endpoint |
| `Page:RecipeDetail` | Recipe detail page component |
| `Component:RecipeCard` | Recipe card component |
| `RecipeIDUtils` | Recipe ID utility functions |
| `ErrorBoundary:*` | Error boundary components |

### Request IDs

Each API request receives a unique request ID (e.g., `req_abc123`) that appears in both:
- Server-side API logs
- Client-side fetch logs
- API response metadata

Use request IDs to trace a request through the entire lifecycle.

---

## Common Error Scenarios

### Scenario 1: Recipe Not Found (404)

**Symptoms:**
- Recipe detail page shows "Recipe Not Found"
- Network tab shows 404 response
- No recipe displayed

**Where to Look:**
1. **Browser Console**: Search for `[API:RecipeDetail]` logs
2. **Server Console**: Look for ID matching logs
3. **Network Tab**: Check `/api/recipes/[id]` request and response

**Example Logs:**

*Server Console:*
```
ℹ️ [INFO] [14:30:45.120] [API:RecipeDetail] Request received
  → rawId: "recipe-999"
  → requestId: req_abc123

🔍 [DEBUG] [14:30:45.125] [RecipeIDUtils] Starting ID lookup
  → rawId: "recipe-999"
  → normalizedId: "recipe-999"

⚠️ [WARN] [14:30:45.130] [RecipeIDUtils] No match found
  → requestedId: recipe-999
  → totalRecipes: 150

⚠️ [WARN] [14:30:45.135] [API:RecipeDetail] Recipe not found
  → requestedId: recipe-999
  → normalizedId: recipe-999
  → totalRecipes: 150
  → suggestionsCount: 2
  → requestId: req_abc123
```

**Resolution Steps:**
1. Verify the ID format matches dataset IDs
2. Check if recipe exists in `public/data/recipes.json`
3. Look at suggestions in API response
4. Verify navigation/link construction

### Scenario 2: Search Returns No Results

**Symptoms:**
- Search completes but shows empty results
- No error displayed
- API returns 200 status

**Where to Look:**
1. **Browser Console**: Check request payload
2. **Server Console**: Review `[API:RecipeSearch]` processing logs
3. **Network Tab**: Verify API response structure

**Example Logs:**

*Server Console:*
```
ℹ️ [INFO] [14:31:10.100] [API:RecipeSearch] Request received
  → requestId: req_xyz789

🔍 [DEBUG] [14:31:10.105] [API:RecipeSearch] Request parameters
  → ingredients: ["xyz123impossible"]
  → filters: {}
  → requestId: req_xyz789

🔍 [DEBUG] [14:31:10.110] [API:RecipeSearch] Recipes loaded successfully
  → totalRecipes: 150
  → requestId: req_xyz789

🔍 [DEBUG] [14:31:10.150] [API:RecipeSearch] Search completed
  → matchesFound: 0
  → recipesReturned: 0
  → requestId: req_xyz789

✅ [SUCCESS] [14:31:10.155] [API:RecipeSearch] Response sent
  → status: 200
  → resultCount: 0
  → processingTime: 55ms
  → requestId: req_xyz789
```

**Resolution Steps:**
1. Check if ingredients match expected format
2. Verify search algorithm is working
3. Try broadening filters
4. Check ingredient normalization logic

### Scenario 3: API Fetch Failure

**Symptoms:**
- Error message displayed in UI
- Network error in console
- Request doesn't complete

**Where to Look:**
1. **Browser Console**: Look for fetch error logs
2. **Network Tab**: Check if request reached server
3. **Server Console**: Check if request was processed

**Example Logs:**

*Browser Console:*
```
❌ [ERROR] [14:32:15.100] [Page:SearchPage] Fetch failed
  → url: /api/recipes/search
  → error: TypeError: Failed to fetch
  → requestId: req_def456
```

**Resolution Steps:**
1. Check network connectivity
2. Verify API route is running (`npm run dev`)
3. Check for CORS issues
4. Verify request payload format

### Scenario 4: Component Rendering Error

**Symptoms:**
- Error boundary fallback UI displayed
- Component fails to render
- Red error in console

**Where to Look:**
1. **Browser Console**: Look for error boundary logs
2. **React DevTools**: Check component tree
3. **Console Error**: Review stack trace

**Example Logs:**
```
❌ [ERROR] [14:33:20.500] [ErrorBoundary:RecipeDetail] Error caught at page level
  → errorId: err_xyz123_1234567890
  → errorMessage: Cannot read property 'title' of undefined
  → errorName: TypeError
  → route: /recipes/recipe-001
  → timestamp: 2025-01-15T14:33:20.500Z
```

**Resolution Steps:**
1. Review error message for null/undefined access
2. Check data structure matches expected shape
3. Verify all required props are provided
4. Add null checks and defensive coding

---

## Debug Mode Activation

### Enable Debug Mode

**Method 1: Environment Variable (Persistent)**

Create or edit `.env.local`:
```env
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=DEBUG
```

**Method 2: localStorage (Session)**

Open browser console and run:
```javascript
localStorage.setItem('smartmeal_debug', 'true')
localStorage.setItem('smartmeal_log_level', 'DEBUG')
location.reload()
```

**Method 3: URL Parameter (Temporary)**
```
http://localhost:3000?debug=true
```

### Configure Log Filtering

**Show only API logs:**
```javascript
localStorage.setItem('debug_filter', 'API:*')
location.reload()
```

**Show specific feature:**
```javascript
localStorage.setItem('debug_filter', '*RecipeSearch*')
location.reload()
```

**Show multiple contexts:**
```javascript
localStorage.setItem('debug_filter', 'API:*,Component:Recipe*')
location.reload()
```

### Disable Debug Mode

```javascript
localStorage.removeItem('smartmeal_debug')
localStorage.removeItem('smartmeal_log_level')
localStorage.removeItem('debug_filter')
location.reload()
```

---

## Error Response Codes

All API errors include a machine-readable error code:

| Error Code | HTTP Status | Meaning | User Action |
|------------|-------------|---------|-------------|
| `RECIPE_NOT_FOUND_INVALID_ID` | 404 | Recipe ID doesn't exist | Browse/search for recipes |
| `RECIPE_SEARCH_INVALID_INPUT` | 400 | Invalid or empty ingredients | Enter valid ingredients |
| `RECIPE_FILE_READ_ERROR` | 500 | Cannot read recipes.json | Retry after a moment |
| `RECIPE_SEARCH_ERROR` | 500 | Search processing failed | Retry search |
| `RECIPE_DETAIL_ERROR` | 500 | Detail fetch failed | Retry or go back |

**Example Error Response:**
```json
{
  "error": "Recipe not found. It may have been removed or the link is incorrect.",
  "code": "RECIPE_NOT_FOUND_INVALID_ID",
  "statusCode": 404,
  "details": {
    "requestedId": "recipe-999",
    "normalizedId": "recipe-999",
    "suggestions": [
      {
        "id": "recipe-099",
        "title": "Similar Recipe",
        "similarity": 85.7,
        "reason": "Similar ID pattern"
      }
    ]
  },
  "timestamp": "2025-01-15T14:30:45.135Z",
  "requestId": "req_abc123"
}
```

---

## Troubleshooting Decision Trees

### Blank Page Decision Tree

```
Blank Page Issue
  └─> Check Browser Console
      ├─> Errors Present
      │   ├─> 404 Not Found → Recipe ID Issue
      │   ├─> JSON Parse Error → API Response Issue
      │   └─> Component Error → Rendering Issue
      └─> No Errors
          └─> Check Network Tab
              ├─> No Request → Navigation Issue
              ├─> Request Failed → Network Issue
              └─> Request Success → Rendering Issue
```

### No Search Results Decision Tree

```
No Results Issue
  └─> Check Server Console
      └─> Find API:RecipeSearch logs
          ├─> totalRecipes: 0 → Data File Issue
          ├─> matchesFound: 0 → Ingredient Matching Issue
          └─> After filters: 0 → Filter Too Restrictive
```

### Error Boundary Displayed Decision Tree

```
Error Boundary Shown
  └─> Check Error Details (Development Mode)
      ├─> TypeError: ... undefined → Null/Undefined Access
      ├─> SyntaxError → Invalid Data Format
      ├─> ReferenceError → Missing Import/Variable
      └─> Custom Error → Application Logic Error
```

---

## Quick Tips

### Reading Logs Efficiently

1. **Follow Request IDs**: Match client and server logs using request IDs
2. **Check Timestamps**: Correlate events by timestamp
3. **Use Filters**: Filter console by context to reduce noise
4. **Look for Patterns**: Similar errors often have the same root cause

### Performance Debugging

1. Look for `processingTime` in API logs
2. Use browser Performance tab for client-side profiling
3. Check Network tab for slow requests
4. Look for blocking operations in console

### Error Prevention

1. Always check data shape before access
2. Use TypeScript types
3. Add proper error handling to async operations
4. Use ErrorBoundary components around features
5. Validate user input before submission

---

## Additional Resources

- **Next.js Error Handling**: https://nextjs.org/docs/app/building-your-application/routing/error-handling
- **React Error Boundaries**: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- **API Testing Guide**: See `API_TESTING.md`
- **Browser DevTools Guide**: https://developer.chrome.com/docs/devtools/

---

## Support

If you encounter an issue not covered in this guide:

1. Check browser and server console logs
2. Enable debug mode for detailed logs
3. Note the error code and request ID
4. Check the error details in development mode
5. Review relevant source code
6. Create an issue with logs and error details

---

**Last Updated**: January 2025
