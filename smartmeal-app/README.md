# Smart Meal - AI Recipe & Nutrition Planner

A comprehensive web application that transforms ingredient availability into actionable meal planning. Smart Meal leverages a recipe database to provide intelligent recipe matching, nutrition tracking, meal scheduling, and automated shopping list generation.

## 🌟 Features

### Core Functionality
- **Ingredient-Driven Discovery**: Match available ingredients to recipes with intelligent ranking
- **Integrated Meal Planning**: Visual weekly calendar with drag-and-drop meal scheduling
- **Nutrition Intelligence**: Real-time macro tracking against personalized goals
- **Automated Shopping**: Generate categorized shopping lists from meal plans and missing ingredients
- **Guided Cooking**: Step-by-step instructions with integrated countdown timers
- **Multimedia Learning**: Embedded YouTube tutorials for visual guidance

### Key Highlights
- 📊 **50+ Sample Recipes** (expandable to 50K+ from Kaggle dataset)
- 🔍 **Smart Search Algorithm** with ingredient matching
- 🎯 **Personalized Nutrition Goals** based on activity level and objectives
- 📅 **Weekly Meal Planner** with 21 meal slots (7 days × 3 meals)
- 🛒 **Auto-Generated Shopping Lists** with category organization
- ⏱️ **Cooking Timers** integrated with recipe instructions
- 🎨 **Dark Mode** support
- 📱 **Fully Responsive** design for mobile, tablet, and desktop

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router, Server Components, API Routes)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with custom design system
- **Component Library**: shadcn/ui (accessible, customizable components)
- **Icons**: Lucide React
- **Charts**: Recharts for nutrition visualization
- **State Management**: React Context + Local Storage persistence
- **Data Source**: Recipe dataset (JSON format, 50 sample recipes included)

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- (Optional) YouTube Data API key for video integration

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   cd smartmeal-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` file in the root directory:
   ```env
   # YouTube Data API Key (optional)
   YOUTUBE_API_KEY=your_api_key_here
   
   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
smartmeal-app/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page
│   ├── dashboard/           # Dashboard page
│   ├── search/              # Recipe search interface
│   ├── recipes/[id]/        # Recipe detail pages
│   ├── planner/             # Weekly meal planner
│   ├── shopping-list/       # Shopping list manager
│   ├── favorites/           # Saved recipes
│   ├── profile/             # User profile & goals
│   └── api/                 # API routes
│       ├── recipes/         # Recipe search & detail endpoints
│       ├── nutrition/       # Nutrition calculation
│       └── youtube/         # YouTube video search
│
├── components/              # React components
│   ├── ui/                 # shadcn/ui base components
│   ├── RecipeCard.tsx      # Recipe display card
│   ├── FilterPanel.tsx     # Search filters
│   ├── CookingTimer.tsx    # Countdown timer
│   └── ...                 # Other components
│
├── lib/                     # Utility libraries
│   ├── utils.ts            # General utilities (cn helper)
│   ├── localStorage.ts     # Type-safe storage wrapper
│   ├── recipeSearch.ts     # Search algorithm & matching
│   ├── nutritionCalculator.ts  # Macro aggregation
│   ├── categoryClassifier.ts   # Shopping list categorization
│   └── youtubeHelper.ts    # YouTube API integration
│
├── types/                   # TypeScript type definitions
│   ├── recipe.ts           # Recipe & ingredient types
│   ├── nutrition.ts        # Nutrition & goals types
│   ├── mealPlan.ts         # Meal planning types
│   ├── user.ts             # User profile types
│   └── shopping.ts         # Shopping list types
│
├── context/                 # React Context providers
│   ├── FavoritesContext.tsx
│   ├── MealPlanContext.tsx
│   ├── ShoppingListContext.tsx
│   ├── ProfileContext.tsx
│   └── ThemeContext.tsx
│
├── public/                  # Static assets
│   └── data/
│       └── recipes.json    # Recipe database (50 samples)
│
└── scripts/                 # Build & data scripts
    ├── generateData.js     # Generate sample recipes
    └── preprocess_recipes.py  # Process Kaggle dataset
```

## 🎯 Core Features Implementation

### Recipe Search Algorithm
- **Ingredient Matching**: Fuzzy matching with percentage calculation
- **Filtering**: Cuisine type and dietary restrictions
- **Ranking**: Sort by best match, quickest time, or easiest difficulty
- **Minimum Match**: 30% threshold for displaying results

### Nutrition Tracking
- **Daily Goals**: Customizable calorie and macro targets
- **Progress Visualization**: Real-time progress bars and charts
- **Weekly Summary**: Aggregate weekly nutrition statistics
- **Goal Status**: Under Goal, On Target, Over Goal indicators

### Meal Planning
- **21 Meal Slots**: 7 days × 3 meals (Breakfast, Lunch, Dinner)
- **Drag-and-Drop**: Intuitive recipe assignment to slots
- **Daily Summaries**: Calculate nutrition for each day
- **Weekly Overview**: Track weekly adherence to goals

### Shopping List Generation
- **Auto-Generate**: Extract missing ingredients from meal plan
- **Categorization**: 8 categories (Produce, Dairy, Meat, Grains, etc.)
- **Smart Merging**: Combine duplicate ingredients with quantity aggregation
- **Export Options**: Print, PDF, WhatsApp, Email, Clipboard

## 🎨 Design System

### Color Palette
- **Primary Orange**: `#FF6B35` - CTAs, active states, accents
- **Success Green**: `#4ECB71` - Positive indicators, available ingredients
- **Warning Yellow**: `#FFC947` - Medium priority alerts
- **Error Red**: `#EF4444` - Missing ingredients, errors
- **Neutral Gray**: `#6B7280` - Body text, borders
- **Light Background**: `#F9FAFB` - Page background (light mode)
- **Dark Background**: `#111827` - Page background (dark mode)

### Typography
- **Font Family**: 'Inter', system-ui, sans-serif
- **Scale**: H1 (60px), H2 (36px), H3 (24px), Body (16px), Small (14px)

### Responsive Breakpoints
- **Mobile**: < 640px (1 column)
- **Tablet**: 640-1024px (2-3 columns)
- **Desktop**: > 1024px (3-4 columns)

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Linting & Type Checking
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Data Generation
node scripts/generateData.js  # Generate sample recipes
python scripts/preprocess_recipes.py  # Process Kaggle dataset (requires Python)
```

## 📊 Sample Data

The application includes 50 sample recipes covering:
- **Cuisines**: Indian, Chinese, Italian, Mexican, Thai, International
- **Meal Types**: Breakfast, Lunch, Dinner, Snack
- **Difficulty Levels**: Easy, Medium, Hard
- **Dietary Tags**: Vegetarian, Vegan, Gluten-Free, Keto, Low-Carb

To expand the dataset to 50K+ recipes:
1. Download Kaggle Recipe Dataset
2. Run `scripts/preprocess_recipes.py`
3. Place generated `recipes.json` in `public/data/`

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `YOUTUBE_API_KEY` | YouTube Data API v3 key for video search | Optional |
| `NEXT_PUBLIC_APP_URL` | Application base URL | Optional |

## 🌐 API Endpoints

### Recipe Search
**POST** `/api/recipes/search`
- Request: `{ ingredients: string[], cuisine?: string, dietaryFilters?: string[], sortBy?: string }`
- Response: `{ success: boolean, recipes: Recipe[], totalMatches: number }`

### Recipe Detail
**GET** `/api/recipes/[id]`
- Response: `{ success: boolean, recipe: DetailedRecipe }`

### Nutrition Calculation
**POST** `/api/nutrition/calculate`
- Request: `{ recipeIds: string[] }`
- Response: `{ success: boolean, totalNutrition: Nutrition }`

### YouTube Search
**GET** `/api/youtube/search?query={recipeName}`
- Response: `{ success: boolean, videoId: string, title: string, thumbnail: string }`

## 🤝 Contributing

This is a design implementation project. To contribute:
1. Review the design document
2. Follow TypeScript strict mode
3. Maintain component modularity
4. Add unit tests for utilities
5. Follow Tailwind CSS conventions

## 📝 License

This project is for educational and demonstration purposes.

## 🙏 Acknowledgments

- Recipe data: Kaggle Recipe Dataset
- UI Components: shadcn/ui
- Icons: Lucide React
- Charts: Recharts

---

**Built with ❤️ using Next.js 15 and TypeScript**
