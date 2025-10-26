# Smart Meal - Quick Start Guide

## 🚀 Get Running in 3 Minutes

### Step 1: Install Dependencies (1 min)
```bash
cd smartmeal-app
npm install
```

### Step 2: Start Development Server (30 sec)
```bash
npm run dev
```

### Step 3: Open Browser
Visit **http://localhost:3000**

---

## 🎯 What You'll See

### Landing Page (/)
- Beautiful hero section
- 6 feature cards
- How it works guide
- Call-to-action buttons

### Dashboard (/dashboard)
- Navigation header
- Quick stats (4 cards)
- 6 action buttons
- Getting started section

---

## 💡 Try These Commands

### Build for Production
```bash
npm run build
npm start
```

### Generate More Sample Data
```bash
node scripts/generateData.js
```

### Type Check
```bash
npx tsc --noEmit
```

---

## 📂 Key Files to Explore

### Core Utilities (Ready to Use)
- `lib/recipeSearch.ts` - Search algorithm
- `lib/nutritionCalculator.ts` - Nutrition tracking
- `lib/localStorage.ts` - Data persistence
- `lib/categoryClassifier.ts` - Shopping categories

### Type Definitions
- `types/recipe.ts` - Recipe data models
- `types/nutrition.ts` - Nutrition types
- `types/mealPlan.ts` - Meal planning
- `types/user.ts` - User profiles
- `types/shopping.ts` - Shopping lists

### Sample Data
- `public/data/recipes.json` - 50 recipes

---

## 🔧 Common Tasks

### Add More Recipes
Edit `public/data/recipes.json` or run:
```bash
node scripts/generateData.js
```

### Customize Colors
Edit `app/globals.css`:
```css
:root {
  --primary: #FF6B35;  /* Change this */
  --success: #4ECB71;
  --warning: #FFC947;
  --error: #EF4444;
}
```

### Add YouTube API Key
Create/edit `.env.local`:
```
YOUTUBE_API_KEY=your_key_here
```

---

## 📖 Next Steps

1. **Explore the Dashboard**: Click "Get Started Free" on landing page
2. **Review the Code**: Check out the utilities in `/lib`
3. **Read the Docs**: See README.md for full documentation
4. **Build Features**: Use existing utilities to build pages

---

## ✅ What's Working

- ✅ Landing page with animations
- ✅ Dashboard with navigation
- ✅ TypeScript type system
- ✅ Core utility functions
- ✅ 50 sample recipes
- ✅ Responsive design
- ✅ Production build

---

## 🎨 Design System

**Colors**: Primary (#FF6B35), Success, Warning, Error  
**Font**: Inter (system fallback)  
**Icons**: Emoji (upgradable to Lucide React)  
**Layout**: Tailwind CSS responsive grid

---

## 🚨 Troubleshooting

**Build Errors?**
```bash
rm -rf .next node_modules
npm install
npm run build
```

**Port Already in Use?**
```bash
# Kill process on port 3000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -ti:3000 | xargs kill
```

**TypeScript Errors?**
```bash
npx tsc --noEmit
```

---

## 📚 Learn More

- **Full Documentation**: README.md
- **Technical Details**: IMPLEMENTATION_SUMMARY.md
- **Project Status**: PROJECT_STATUS.md
- **Next.js Docs**: https://nextjs.org/docs

---

**Happy Coding!** 🍳✨

*Transform Ingredients into Delicious Meals*
