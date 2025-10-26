"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ShoppingItem {
  id: string;
  name: string;
  amount?: string;
  unit?: string;
  checked: boolean;
  category: string;
}

interface ExportMenuProps {
  items: ShoppingItem[];
}

/**
 * Export menu component with multiple export format options
 */
export function ExportMenu({ items }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportAsText = () => {
    const uncheckedItems = items.filter((item) => !item.checked);
    const text = uncheckedItems
      .map((item) => {
        const quantity = item.amount && item.unit ? `${item.amount} ${item.unit}` : "";
        return `□ ${item.name}${quantity ? ` - ${quantity}` : ""}`;
      })
      .join("\n");

    copyToClipboard(text);
    setIsOpen(false);
  };

  const exportAsCategorized = () => {
    const uncheckedItems = items.filter((item) => !item.checked);
    const categorized = uncheckedItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as { [key: string]: ShoppingItem[] });

    let text = "";
    Object.entries(categorized).forEach(([category, categoryItems]) => {
      text += `\n${category}:\n`;
      categoryItems.forEach((item) => {
        const quantity = item.amount && item.unit ? `${item.amount} ${item.unit}` : "";
        text += `  □ ${item.name}${quantity ? ` - ${quantity}` : ""}\n`;
      });
    });

    copyToClipboard(text.trim());
    setIsOpen(false);
  };

  const exportAsJSON = () => {
    const uncheckedItems = items.filter((item) => !item.checked);
    const json = JSON.stringify(uncheckedItems, null, 2);
    downloadFile(json, "shopping-list.json", "application/json");
    setIsOpen(false);
  };

  const exportAsCSV = () => {
    const uncheckedItems = items.filter((item) => !item.checked);
    const headers = "Category,Item,Amount,Unit\n";
    const rows = uncheckedItems
      .map((item) => `"${item.category}","${item.name}","${item.amount || ""}","${item.unit || ""}"`)
      .join("\n");
    const csv = headers + rows;
    downloadFile(csv, "shopping-list.csv", "text/csv");
    setIsOpen(false);
  };

  const printList = () => {
    const uncheckedItems = items.filter((item) => !item.checked);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shopping List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #FF6B35; }
            .category { margin-top: 20px; }
            .category-title { font-weight: bold; font-size: 18px; margin-bottom: 10px; }
            .item { margin-left: 20px; margin-bottom: 5px; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Shopping List</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          ${generatePrintHTML(uncheckedItems)}
          <button onclick="window.print()">Print</button>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setIsOpen(false);
  };

  const generatePrintHTML = (uncheckedItems: ShoppingItem[]) => {
    const categorized = uncheckedItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as { [key: string]: ShoppingItem[] });

    return Object.entries(categorized)
      .map(([category, categoryItems]) => `
        <div class="category">
          <div class="category-title">${category}</div>
          ${categoryItems.map((item) => {
            const quantity = item.amount && item.unit ? ` - ${item.amount} ${item.unit}` : "";
            return `<div class="item">□ ${item.name}${quantity}</div>`;
          }).join("")}
        </div>
      `)
      .join("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const uncheckedCount = items.filter((item) => !item.checked).length;

  return (
    <div className="relative" role="menu" aria-label="Export shopping list">
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        Export List ({uncheckedCount} items)
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <Card className="absolute right-0 top-12 z-20 w-64 p-2 shadow-lg">
            <div className="space-y-1" role="menu">
              <button
                onClick={exportAsText}
                className="w-full rounded px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                role="menuitem"
              >
                <div className="font-medium">Copy as Text</div>
                <div className="text-xs text-muted-foreground">Simple list format</div>
              </button>

              <button
                onClick={exportAsCategorized}
                className="w-full rounded px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                role="menuitem"
              >
                <div className="font-medium">Copy by Category</div>
                <div className="text-xs text-muted-foreground">Organized by sections</div>
              </button>

              <button
                onClick={exportAsCSV}
                className="w-full rounded px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                role="menuitem"
              >
                <div className="font-medium">Download CSV</div>
                <div className="text-xs text-muted-foreground">For Excel/Sheets</div>
              </button>

              <button
                onClick={exportAsJSON}
                className="w-full rounded px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                role="menuitem"
              >
                <div className="font-medium">Download JSON</div>
                <div className="text-xs text-muted-foreground">Structured data format</div>
              </button>

              <button
                onClick={printList}
                className="w-full rounded px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                role="menuitem"
              >
                <div className="font-medium">Print</div>
                <div className="text-xs text-muted-foreground">Printer-friendly view</div>
              </button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
