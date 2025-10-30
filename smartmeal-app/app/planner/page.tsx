"use client";

import { useState, useEffect } from "react";
// --- Ensure ALL these imports are present ---
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MealSlot, DayOfWeek, MealType } from "@/types/mealPlan";
import type { DailyNutrition } from "@/types/nutrition";
import type { DetailedRecipe, Ingredient } from "@/types/recipe";
import type { ShoppingItem, IngredientCategory } from "@/types/shopping";
import { aggregateNutrition } from "@/lib/nutritionCalculator";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useShoppingList } from "@/contexts/ShoppingListContext";
import { categorizeIngredient } from "@/lib/categoryClassifier";
import logger from "@/lib/debug"; // Assuming you have this configured
// --- Import jsPDF and autoTable ---
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

// Constants
const DAYS_OF_WEEK = [
    { value: "monday" as DayOfWeek, label: "Monday" },
    { value: "tuesday" as DayOfWeek, label: "Tuesday" },
    { value: "wednesday" as DayOfWeek, label: "Wednesday" },
    { value: "thursday" as DayOfWeek, label: "Thursday" },
    { value: "friday" as DayOfWeek, label: "Friday" },
    { value: "saturday" as DayOfWeek, label: "Saturday" },
    { value: "sunday" as DayOfWeek, label: "Sunday" },
];

const MEAL_TIMES = ["breakfast", "lunch", "dinner"] as const;
type MealTimeKey = typeof MEAL_TIMES[number];

export default function PlannerPage() {
    // --- State ---
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [allRecipes, setAllRecipes] = useState<DetailedRecipe[]>([]);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);

    // --- Hooks ---
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // --- MODIFIED --- Get new values from the updated context
    const { 
        currentMealPlan, // Renamed from mealPlan
        isPastWeek,      // New state to disable actions
        navigateToNextWeek, 
        navigateToPrevWeek,
        navigateToThisWeek,
        updateMealSlot, 
        removeMealSlot, 
        // copyToNextWeek was removed from context, handleCopyToNextWeek function below shows an alert
        clearDay, 
        clearWeek 
    } = useMealPlan();
    // --- END MODIFIED ---

    const { addItem: addShoppingItem, clearAll: clearShoppingList } = useShoppingList();

    // --- Effects ---
    // Fetch all recipes on component mount
    useEffect(() => {
        const fetchRecipes = async () => {
            setIsLoadingRecipes(true);
            logger.info('PlannerPage:Recipes', 'Fetching all recipes...');
            try {
                const response = await fetch('/data/recipes.json');
                if (!response.ok) {
                    throw new Error(`Failed to fetch recipes: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                 if (!Array.isArray(data)) {
                    throw new Error("Fetched recipe data is not an array.");
                 }
                setAllRecipes(data);
                logger.info('PlannerPage:Recipes', `Loaded ${data.length} recipes.`);
            } catch (error) {
                logger.error('PlannerPage:Recipes', 'Error fetching recipes', {}, error instanceof Error ? error : new Error(String(error)));
                setAllRecipes([]);
            } finally {
                setIsLoadingRecipes(false);
            }
        };
        fetchRecipes();
    }, []);

    // Handle return navigation from Favorites
    useEffect(() => {
       const returnDay = searchParams.get('returnDay');
       if (returnDay) {
         const dayIndex = DAYS_OF_WEEK.findIndex(d => d.value === returnDay);
         if (dayIndex !== -1 && dayIndex !== selectedDayIndex) {
           setSelectedDayIndex(dayIndex);
           logger.debug('PlannerPage:ReturnNav', `Returned from favorites, focusing on ${returnDay}`);
         }
       }
     }, [searchParams, selectedDayIndex]);

    // --- Derived State ---
    const currentDayKey = DAYS_OF_WEEK[selectedDayIndex]?.value;
    const currentDayMealsData = currentMealPlan?.meals[currentDayKey] ?? { breakfast: null, lunch: null, dinner: null };
    const dailyNutrition = aggregateNutrition(Object.values(currentDayMealsData));
    
    const totalWeeklyCalories = currentMealPlan ? Object.values(currentMealPlan.meals).reduce((total, dayMeals) => {
        const mealsForDay = dayMeals ? Object.values(dayMeals) : [];
        const dayNutrition = aggregateNutrition(mealsForDay);
        return total + (dayNutrition?.calories ?? 0);
    }, 0) : 0;
    const totalMealsPlanned = currentMealPlan ? Object.values(currentMealPlan.meals).reduce((count, dayMeals) => {
       const validSlots = dayMeals ? Object.values(dayMeals).filter(slot => slot && slot.recipeId) : [];
       return count + validSlots.length;
    }, 0) : 0;


    // --- Event Handlers ---
    const handleRemoveMeal = (mealIndex: number) => {
        if (!currentDayKey) return;
        const mealType = MEAL_TIMES[mealIndex];
        removeMealSlot(currentDayKey, mealType);
        logger.info('PlannerPage:RemoveMeal', `Removed meal from ${currentDayKey} ${mealType}`);
    };

    const handleAddRecipeClick = (mealIndex: number) => {
        if (!currentDayKey) {
             console.error("handleAddRecipeClick: currentDayKey is not set!");
             return;
        }
        const mealType = MEAL_TIMES[mealIndex];
        logger.info('PlannerPage:AddRecipe', `Navigating to favorites for ${currentDayKey} ${mealType}`);
        router.push(`/favorites?targetDay=${currentDayKey}&targetMeal=${mealType}`);
    };

     const handleNavigateToSearch = () => {
        router.push('/search');
     };

    const handleGenerateShoppingList = () => {
         if (!currentMealPlan) { 
             alert("Meal plan is not loaded yet.");
             logger.warn('PlannerPage:GenerateList', 'Attempted generate list: Meal plan not loaded');
             return;
        }
        if (isLoadingRecipes) {
             alert("Recipe data is still loading.");
             logger.warn('PlannerPage:GenerateList', 'Attempted generate list: Recipes not loaded');
             return;
        }
         if (allRecipes.length === 0 && !isLoadingRecipes) {
             alert("Failed to load recipe data. Cannot generate shopping list.");
             logger.error('PlannerPage:GenerateList', 'Attempted generate list: All recipes array is empty');
             return;
         }

        logger.info('PlannerPage:GenerateList', 'Generating shopping list from meal plan');
        clearShoppingList();

        const aggregatedIngredients: {
            [key: string]: {
                name: string; quantity: number; unit: string; category: IngredientCategory; recipeIds: string[];
             }
        } = {};

        Object.values(currentMealPlan.meals).forEach(dayMeals => {
            if (!dayMeals) return;
            Object.values(dayMeals).forEach(slot => {
                if (slot?.recipeId) {
                    const recipe = allRecipes.find(r => r.id === slot.recipeId);
                    if (recipe?.ingredients && Array.isArray(recipe.ingredients)) {
                        recipe.ingredients.forEach(ing => {
                            if (typeof ing?.name !== 'string' || typeof ing?.unit !== 'string' || typeof ing?.quantity !== 'number' || isNaN(ing.quantity)) {
                                logger.warn('PlannerPage:GenerateList', `Skipping invalid ingredient format in recipe ${recipe.id}`, { ingredient: ing });
                                return;
                            }
                            const nameLower = ing.name.toLowerCase().trim();
                            const unitLower = ing.unit.toLowerCase().trim();
                            const key = `${nameLower}||${unitLower}`;
                            if (!aggregatedIngredients[key]) {
                                aggregatedIngredients[key] = {
                                    name: ing.name, quantity: 0, unit: ing.unit, category: categorizeIngredient(ing.name), recipeIds: []
                                };
                            }
                            aggregatedIngredients[key].quantity += ing.quantity;
                            if (!aggregatedIngredients[key].recipeIds.includes(recipe.id)) {
                                aggregatedIngredients[key].recipeIds.push(recipe.id);
                            }
                        });
                    } else if (recipe) {
                         logger.warn('PlannerPage:GenerateList', `Recipe ${recipe.id} has missing or invalid ingredients array.`);
                    }
                }
            });
        });

        let itemsAddedCount = 0;
        Object.values(aggregatedIngredients).forEach(data => {
            if(data.quantity > 0) {
                addShoppingItem(data.name, data.quantity, data.unit);
                itemsAddedCount++;
            }
        });

        logger.info('PlannerPage:GenerateList', `Generated ${itemsAddedCount} items for shopping list`);
        if (itemsAddedCount > 0) {
            alert(`Generated ${itemsAddedCount} items for your shopping list!`);
            router.push('/shopping-list');
        } else {
             alert("No ingredients found in the current meal plan to add to the shopping list.");
        }
    };


    const handleExportWeek = () => {
        if (!currentMealPlan) {
             alert("No meal plan loaded to export.");
             logger.warn('PlannerPage:ExportWeek', 'Attempted export: Meal plan not loaded');
             return;
        }

        logger.info('PlannerPage:ExportWeek', 'Exporting current meal plan as PDF...');

        try {
            const doc = new jsPDF();
            const margin = 15;
            let yPosition = margin;

            doc.setFontSize(18);
            doc.text("Smart Meal - Meal Plan", margin, yPosition);
            yPosition += 10;

            const weekStartDate = currentMealPlan.weekStarting 
                ? new Date(currentMealPlan.weekStarting).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  }) 
                : 'Current Week';
            
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Week Starting: ${weekStartDate}`, margin, yPosition);
            yPosition += 10;

            const tableHeaders = ["Day", "Breakfast", "Lunch", "Dinner"];
            const tableData: string[][] = [];

            DAYS_OF_WEEK.forEach(dayInfo => {
                const dayKey = dayInfo.value;
                const dayLabel = dayInfo.label;
                
                const meals = currentMealPlan.meals[dayKey] ?? { breakfast: null, lunch: null, dinner: null };
                
                const breakfast = meals.breakfast?.recipeName || " - ";
                const lunch = meals.lunch?.recipeName || " - ";
                const dinner = meals.dinner?.recipeName || " - ";
                
                tableData.push([dayLabel, breakfast, lunch, dinner]);
            });

            autoTable(doc, {
                head: [tableHeaders],
                body: tableData,
                startY: yPosition,
                margin: { left: margin, right: margin },
                theme: 'grid',
                styles: { 
                    fontSize: 9, 
                    cellPadding: 3,
                    overflow: 'linebreak', 
                },
                headStyles: { 
                    fillColor: [255, 107, 53], 
                    textColor: [255, 255, 255],
                    fontSize: 10,
                },
                columnStyles: {
                    0: { cellWidth: 25 }, // Day
                    1: { cellWidth: 48 }, // Breakfast
                    2: { cellWidth: 48 }, // Lunch
                    3: { cellWidth: 48 }, // Dinner
                }
            });
            
            const weekStartDateISO = currentMealPlan.weekStarting ? new Date(currentMealPlan.weekStarting).toISOString().split('T')[0] : 'current-week';
            const pdfFileName = `smartmeal-plan-${weekStartDateISO}.pdf`;
            doc.save(pdfFileName);

            logger.info('PlannerPage:ExportWeek', `Exported meal plan as PDF: ${pdfFileName}`);
            alert("Meal plan PDF exported successfully!");

        } catch (error) {
            logger.error('PlannerPage:ExportWeek', 'Failed to export meal plan PDF', {}, error instanceof Error ? error : new Error(String(error)));
            alert("Failed to export meal plan as PDF.");
        }
    };

    const handleCopyToNextWeek = () => {
        // This function would need to be re-implemented in the context
        // to copy from `currentWeekStart` to `getNextWeekKey(currentWeekStart)`
        alert("Copy to next week is not yet implemented in the new context.");
        logger.warn('PlannerPage:CopyWeek', 'Copy to next week button clicked (not implemented)');
    };

    const handleClearDay = () => {
         if (!currentDayKey) return;
        if (confirm(`Are you sure you want to clear all meals for ${DAYS_OF_WEEK[selectedDayIndex].label}?`)) {
            clearDay(currentDayKey);
            logger.info('PlannerPage:ClearDay', `Cleared meals for ${currentDayKey}`);
        }
    };

     const handleClearWeek = () => {
         if (confirm("Are you sure you want to clear all meals for the entire week?")) {
            clearWeek();
            logger.info('PlannerPage:ClearWeek', 'Cleared entire meal plan');
        }
    };

    // --- Render Logic ---
    if (isLoadingRecipes || !currentMealPlan) { 
         return (
             <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                <span className="ml-4 text-muted-foreground">
                    {isLoadingRecipes ? "Loading recipes..." : "Loading meal plan..."}
                </span>
             </div>
        );
    }

    if (!currentDayKey) {
        return (
             <div className="min-h-screen flex items-center justify-center text-red-600">
                 Error: Invalid day selected. Please refresh.
             </div>
        );
    }

    // --- Return JSX ---
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                        <div><h1 className="text-2xl sm:text-3xl font-bold">Meal Planner</h1></div>
                        <div className="flex gap-1 sm:gap-2">
                            <Button variant="ghost" size="sm" onClick={navigateToPrevWeek}>← Prev</Button>
                            <Button variant="ghost" size="sm" onClick={navigateToThisWeek}>This Week</Button>
                            <Button variant="ghost" size="sm" onClick={navigateToNextWeek}>Next →</Button>
                        </div>
                    </div>
                    {/* Weekly Overview */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {DAYS_OF_WEEK.map((dayInfo, index) => {
                            const dayKey = dayInfo.value;
                            const dayMeals = currentMealPlan?.meals?.[dayKey] ? Object.values(currentMealPlan.meals[dayKey]) : Array(3).fill(null);
                            const dayCalories = aggregateNutrition(dayMeals).calories;
                            const mealCount = dayMeals.filter((m) => m && m.recipeId).length;
                            return (
                                <button key={dayInfo.value} onClick={() => setSelectedDayIndex(index)}
                                    className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-left text-xs sm:text-sm ${selectedDayIndex === index ? "border-primary bg-primary/10 ring-1 sm:ring-2 ring-primary/50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                                    aria-current={selectedDayIndex === index ? "date" : undefined} aria-label={`Select ${dayInfo.label}, ${mealCount} meals, ${dayCalories} cal`}>
                                    <div className="font-semibold mb-0.5">{dayInfo.label.slice(0, 3)}</div>
                                    <div className="text-[10px] sm:text-xs text-muted-foreground">{mealCount}/3</div>
                                    <div className="text-[10px] sm:text-xs font-medium text-primary mt-0.5">{dayCalories} cal</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl sm:text-2xl font-bold">{DAYS_OF_WEEK[selectedDayIndex]?.label ?? 'Selected Day'}</h2>
                            <Button variant="primary" size="sm" onClick={handleNavigateToSearch} disabled={isPastWeek}>
                                {isPastWeek ? "Viewing Past Week" : "+ Add from Search"}
                            </Button>
                        </div>
                        {/* Meal Slots */}
                        <div className="space-y-4">
                            {MEAL_TIMES.map((mealTime, mealIndex) => {
                                const meal: MealSlot | null = currentDayMealsData[mealTime as MealTimeKey] ?? null;
                                return (
                                    <Card key={mealTime}>
                                        <CardHeader className="py-3 px-4 sm:p-6">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base sm:text-lg capitalize">{mealTime}</CardTitle>
                                                {meal && meal.recipeId && (
                                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveMeal(mealIndex)} aria-label={`Remove ${meal.recipeName} from ${mealTime}`} className="text-red-500 hover:text-red-700 px-2" disabled={isPastWeek}>× Remove</Button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0 pb-4 px-4 sm:p-6 sm:pt-0">
                                            {meal && meal.recipeId ? (
                                                <div className="flex gap-3 sm:gap-4 items-start">
                                                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                                                        {meal.recipeImage ? (
                                                            <img src={meal.recipeImage} alt={meal.recipeName || "Recipe image"} className="w-full h-full object-cover rounded-lg" onError={(e) => { e.currentTarget.src = '/images/placeholder-recipe.png'; e.currentTarget.alt = 'Placeholder image'; }}/>
                                                        ) : ( <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs p-1 text-center">No Image</div> )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold mb-1 hover:text-primary cursor-pointer truncate" onClick={() => router.push(`/recipes/${meal.recipeId}`)} title={meal.recipeName || "Recipe Name Missing"}>{meal.recipeName || "Recipe Name Missing"}</h3>
                                                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                                                            {meal.calories !== null && <Badge variant="neutral" size="sm">{meal.calories} cal</Badge>}
                                                            {meal.macros && ( <> <Badge variant="info" size="sm">P: {meal.macros.protein}g</Badge> <Badge variant="info" size="sm">C: {meal.macros.carbs}g</Badge> <Badge variant="info" size="sm">F: {meal.macros.fats}g</Badge> </> )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center">
                                                    <p className="text-muted-foreground text-sm sm:text-base mb-3">No meal planned</p>
                                                    <Button variant="secondary" size="sm" onClick={() => handleAddRecipeClick(mealIndex)} disabled={isPastWeek}>
                                                        {isPastWeek ? "Past week (Read-only)" : "+ Add Recipe from Favorites"}
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader className="p-4 sm:p-6"><CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle></CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0 flex flex-wrap gap-2">
                                <Button size="sm" variant="secondary" onClick={handleGenerateShoppingList} disabled={isLoadingRecipes || totalMealsPlanned === 0}>📋 Generate Shopping List</Button>
                                <Button size="sm" variant="secondary" onClick={handleExportWeek} disabled={totalMealsPlanned === 0}>📤 Export Week</Button>
                                <Button size="sm" variant="secondary" onClick={handleCopyToNextWeek} disabled={true}>🔄 Copy to Next Week</Button>
                                <Button size="sm" variant="ghost" onClick={handleClearDay} disabled={dailyNutrition.calories === 0 || isPastWeek}>🗑 Clear This Day</Button>
                                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleClearWeek} disabled={totalMealsPlanned === 0 || isPastWeek}>🗑 Clear Entire Week</Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6 lg:sticky lg:top-24 self-start">
                        {/* Daily Nutrition */}
                        <Card>
                             <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-base sm:text-lg">Daily Nutrition</CardTitle>
                                <p className="text-xs sm:text-sm text-muted-foreground">{DAYS_OF_WEEK[selectedDayIndex]?.label ?? 'Selected Day'}</p>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="border-b pb-2 sm:pb-3">
                                        <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">{dailyNutrition.calories}</div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">Total Calories</div>
                                    </div>
                                    <NutritionStat label="Protein" value={dailyNutrition.protein} goal={150} unit="g" color="bg-blue-500" />
                                    <NutritionStat label="Carbs" value={dailyNutrition.carbs} goal={200} unit="g" color="bg-yellow-500" />
                                    <NutritionStat label="Fats" value={dailyNutrition.fats} goal={65} unit="g" color="bg-orange-500" />
                                    <NutritionStat label="Fiber" value={dailyNutrition.fiber} goal={30} unit="g" color="bg-green-500" />
                                </div>
                            </CardContent>
                        </Card>
                        {/* Weekly Stats */}
                        <Card>
                             <CardHeader className="p-4 sm:p-6"><CardTitle className="text-base sm:text-lg">Weekly Overview</CardTitle></CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0">
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex justify-between text-xs sm:text-sm"><span className="text-muted-foreground">Total Meals</span><span className="font-semibold">{totalMealsPlanned}/21</span></div>
                                    <div className="flex justify-between text-xs sm:text-sm"><span className="text-muted-foreground">Weekly Calories</span><span className="font-semibold">{totalWeeklyCalories.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-xs sm:text-sm"><span className="text-muted-foreground">Avg Daily Calories</span><span className="font-semibold">{totalMealsPlanned > 0 ? Math.round(totalWeeklyCalories / 7) : 0}</span></div>
                                    <div className="flex justify-between text-xs sm:text-sm"><span className="text-muted-foreground">Completion</span><span className="font-semibold">{Math.round((totalMealsPlanned / 21) * 100)}%</span></div>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Tips */}
                        <Card>
                             <CardHeader className="p-4 sm:p-6"><CardTitle className="text-base sm:text-lg">💡 Planning Tips</CardTitle></CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0">
                                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                                    <li>• Add meals from Favorites or Search.</li>
                                    <li>• Click a meal's title to view details.</li>
                                    <li>• Use Quick Actions to manage your week.</li>
                                    <li>• Generate shopping lists from your plan.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

// NutritionStat Component
function NutritionStat({ label, value, goal, unit, color }: { label: string; value: number; goal: number; unit: string; color: string; }) {
    const percentage = goal > 0 ? Math.min(Math.round((value / goal) * 100), 100) : 0;
    return (
        <div>
            <div className="flex justify-between text-xs sm:text-sm mb-1">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">{value}/{goal}{unit} ({percentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${percentage}%` }} aria-hidden="true"/>
            </div>
        </div>
    );
}