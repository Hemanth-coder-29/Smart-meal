"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ShoppingList, ShoppingItem, IngredientCategory } from "@/types/shopping"; //
import { categorizeIngredient } from "@/lib/categoryClassifier"; //
// --- Import jsPDF and autoTable ---
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const CATEGORIES: { name: IngredientCategory; icon: string; label: string }[] = [
  { name: "produce", icon: "🥬", label: "Produce" },
  { name: "dairy-eggs", icon: "🥛", label: "Dairy & Eggs" },
  { name: "meat-seafood", icon: "🥩", label: "Meat & Seafood" },
  { name: "grains-bakery", icon: "🍞", label: "Grains & Bakery" },
  { name: "spices-condiments", icon: "🧂", label: "Spices & Condiments" },
  { name: "canned-packaged", icon: "🥫", label: "Canned & Packaged" },
  { name: "frozen", icon: "🧊", label: "Frozen" },
  { name: "other", icon: "🛒", label: "Other" },
]; //

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]); //
  const [newItemName, setNewItemName] = useState(""); //
  const [newItemAmount, setNewItemAmount] = useState(""); //
  const [showCompleted, setShowCompleted] = useState(false); //

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem("smartmeal_shopping_list"); //
    if (stored) {
      try {
        const parsed = JSON.parse(stored); //
        setItems(parsed.items || []); //
      } catch (error) {
        console.error("Failed to load shopping list:", error); //
      }
    }
  }, []); //

  const saveToStorage = (updatedItems: ShoppingItem[]) => {
    const list: ShoppingList = {
      items: updatedItems, //
      generatedFrom: "manual", //
      lastModified: new Date().toISOString(), //
    };
    localStorage.setItem("smartmeal_shopping_list", JSON.stringify(list)); //
  };

  const addItem = () => {
    if (!newItemName.trim()) return; //

    const newItem: ShoppingItem = {
      id: `item_${Date.now()}`, //
      name: newItemName.trim(), //
      // Ensure quantity defaults correctly, handle potential parsing issues
      quantity: parseFloat(newItemAmount) || 1, //
      // Attempt to parse unit if provided in amount, otherwise default
      unit: newItemAmount.replace(/[0-9.]/g, '').trim() || "unit", // Basic unit parsing
      category: categorizeIngredient(newItemName.trim()), //
      purchased: false, //
      fromRecipes: [], //
    };

    const updatedItems = [...items, newItem]; //
    setItems(updatedItems); //
    saveToStorage(updatedItems); //
    setNewItemName(""); //
    setNewItemAmount(""); //
  };

  const toggleItem = (itemId: string) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, purchased: !item.purchased } : item //
    );
    setItems(updatedItems); //
    saveToStorage(updatedItems); //
  };

  const deleteItem = (itemId: string) => {
    const updatedItems = items.filter((item) => item.id !== itemId); //
    setItems(updatedItems); //
    saveToStorage(updatedItems); //
  };

  const clearCompleted = () => {
    const updatedItems = items.filter((item) => !item.purchased); //
    setItems(updatedItems); //
    saveToStorage(updatedItems); //
  };

  const clearAll = () => {
    if (confirm("Are you sure you want to clear all items?")) { //
      setItems([]); //
      saveToStorage([]); //
    }
  };

  // --- Updated exportList function ---
  const exportList = (format: "text" | "pdf") => {
    // Filter only non-purchased items for export
    const itemsToExport = items.filter(item => !item.purchased); //

    if (itemsToExport.length === 0) {
        alert("No items to export (list is empty or all items are checked).");
        return;
    }


    if (format === "text") {
      let text = "Smart Meal - Shopping List\n"; //
      text += "========================\n\n"; //

      CATEGORIES.forEach((cat) => { //
        // Use itemsToExport here
        const categoryItems = itemsToExport.filter((item) => item.category === cat.name); //
        if (categoryItems.length > 0) { //
          text += `${cat.icon} ${cat.label}\n`; //
          categoryItems.forEach((item) => {
            // Use '○' as items are already filtered to be unpurchased
            text += `  ○ ${item.quantity} ${item.unit} ${item.name}\n`; //
          });
          text += "\n"; //
        }
      });

      const blob = new Blob([text], { type: "text/plain" }); //
      const url = URL.createObjectURL(blob); //
      const a = document.createElement("a"); //
      a.href = url; //
      a.download = "shopping-list.txt"; //
      a.click(); //
      URL.revokeObjectURL(url); //

    } else if (format === "pdf") {
      const doc = new jsPDF();
      const margin = 15;
      let yPosition = margin;

      doc.setFontSize(18);
      doc.text("Smart Meal - Shopping List", margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 10;

      const tableData: (string | number)[][] = []; // Explicit type
      const tableHeaders = ["Category", "Item", "Quantity", "Unit"];

      CATEGORIES.forEach((cat) => { //
        // Use itemsToExport here
        const categoryItems = itemsToExport.filter((item) => item.category === cat.name); //
        if (categoryItems.length > 0) { //
           categoryItems.forEach((item, index) => {
             tableData.push([
                index === 0 ? `${cat.icon} ${cat.label}` : "", // Show category only once
                item.name, //
                item.quantity.toString(), //
                item.unit //
             ]);
           });
        }
      });

      if (tableData.length > 0) {
        autoTable(doc, {
          head: [tableHeaders],
          body: tableData,
          startY: yPosition,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [255, 107, 53] }, // Smart Meal primary orange
           // Add didDrawCell to handle potential text overflow and add check boxes
            didDrawCell: (data) => {
              // Add a checkbox placeholder for each item row (optional)
              // This is visual only, not interactive in the PDF
              if (data.column.index === 0 && data.cell.section === 'body') {
                 // Adjust coordinates as needed
                 // doc.rect(data.cell.x + 2, data.cell.y + 2, 3, 3);
              }
            }
        });
      } else {
         // This case should theoretically not happen due to the check at the start
         doc.setFontSize(12);
         doc.setTextColor(150);
         doc.text("No items to export.", margin, yPosition);
      }

      doc.save("smartmeal-shopping-list.pdf");

    } else {
      console.error("Unsupported export format requested:", format);
      alert("Unsupported export format!"); //
    }
  };


  const getItemsByCategory = (category: IngredientCategory) => {
    return items.filter((item) => item.category === category); //
  };

  const displayedItems = showCompleted ? items : items.filter((item) => !item.purchased); //
  const checkedCount = items.filter((item) => item.purchased).length; //
  const totalCount = items.length; //
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0; //

  // --- Return the JSX (no changes needed here from your provided code) ---
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Shopping List</h1>
              <p className="text-muted-foreground">
                {totalCount} items · {checkedCount} completed
              </p>
            </div>
            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => exportList("text")}>
                📄 Export Text
              </Button>
              <Button variant="ghost" onClick={() => exportList("pdf")}>
                📑 Export PDF
              </Button>
              <Button variant="primary">+ From Meal Plan</Button> {/* Add onClick handler later */}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Shopping Progress</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Add Item Form */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Item name (e.g., Tomatoes)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addItem()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  // Changed placeholder to reflect quantity + unit together
                  placeholder="Quantity & Unit (e.g., 2 lbs)"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addItem()}
                  className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button onClick={addItem} variant="primary">
                  + Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Shopping Items */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Items by Category</h2>
              <div className="flex gap-2">
                <Button
                  variant={showCompleted ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setShowCompleted(!showCompleted)}
                >
                  {showCompleted ? "Hide" : "Show"} Completed
                </Button>
                {checkedCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCompleted}>
                    Clear Completed
                  </Button>
                )}
              </div>
            </div>

            {/* Categories */}
            {CATEGORIES.map((cat) => {
              // Use displayedItems derived logic based on showCompleted state
              const categoryItems = displayedItems.filter(item => item.category === cat.name);

              if (categoryItems.length === 0) return null;

              return (
                <Card key={cat.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{cat.icon}</span>
                      <span>{cat.label}</span>
                      <Badge variant="neutral" className="ml-2">
                        {categoryItems.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {categoryItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={item.purchased}
                            onChange={() => toggleItem(item.id)}
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            aria-label={`Mark ${item.name} as ${item.purchased ? 'not purchased' : 'purchased'}`}
                          />
                          <div className="flex-1">
                            <span
                              className={`font-medium ${
                                item.purchased
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {item.name}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({item.quantity} {item.unit})
                            </span>
                          </div>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            aria-label={`Delete ${item.name}`}
                          >
                            🗑
                          </button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}

            {/* Empty State Logic */}
            {items.length > 0 && displayedItems.length === 0 && !showCompleted && (
                 <Card>
                    <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">All items are marked as completed! 🎉</p>
                    <Button variant="ghost" size="sm" onClick={() => setShowCompleted(true)} className="mt-4">
                        Show Completed Items
                    </Button>
                    </CardContent>
                 </Card>
            )}
             {items.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No items in your shopping list yet.
                  </p>
                  <Button variant="primary">+ Add Items from Meal Plan</Button> {/* Add onClick later */}
                </CardContent>
              </Card>
            )}
          </div> {/* End Left Column */}


          {/* Right Column - Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Items
                  </span>
                  <span className="font-semibold">{totalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Remaining
                  </span>
                  <span className="font-semibold">{totalCount - checkedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Completed
                  </span>
                  <span className="font-semibold text-green-600">
                    {checkedCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Categories
                  </span>
                  <span className="font-semibold">
                    {
                      CATEGORIES.filter(
                        (cat) => getItemsByCategory(cat.name).length > 0
                      ).length
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" className="w-full" disabled> {/* Add onClick later */}
                  📤 Share List
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => window.print()}> {/* Simple print */}
                  🖨 Print List
                </Button>
                 <Button variant="secondary" className="w-full" disabled> {/* Add onClick later */}
                  💾 Save Template
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={clearAll}
                  disabled={items.length === 0} // Disable if list is empty
                >
                  🗑 Clear All Items
                </Button>
              </CardContent>
            </Card>

            {/* Shopping Tips */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Shopping Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Items are auto-categorized by type</li>
                  <li>• Check items off as you shop</li>
                  <li>• Export to print or share</li>
                  <li>• Generate from your meal plan</li>
                </ul>
              </CardContent>
            </Card>
          </div> {/* End Right Column */}
        </div>
      </div>
    </div>
  );
}