"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

interface ShoppingItem {
  id: string;
  name: string;
  amount?: string;
  unit?: string;
  checked: boolean;
  category: string;
}

interface CategorySectionProps {
  category: string;
  items: ShoppingItem[];
  onItemToggle: (itemId: string) => void;
  onItemRemove: (itemId: string) => void;
}

const CATEGORY_ICONS: { [key: string]: string } = {
  "Produce": "🥬",
  "Dairy": "🥛",
  "Meat & Seafood": "🥩",
  "Bakery": "🍞",
  "Pantry": "🥫",
  "Frozen": "❄️",
  "Beverages": "🥤",
  "Snacks": "🍿",
  "Other": "🛒",
};

/**
 * Shopping list category section with grouped items
 */
export function CategorySection({
  category,
  items,
  onItemToggle,
  onItemRemove,
}: CategorySectionProps) {
  const checkedCount = items.filter((item) => item.checked).length;
  const progress = items.length > 0 ? (checkedCount / items.length) * 100 : 0;
  const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS["Other"];

  return (
    <section className="mb-6" aria-labelledby={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}>
      {/* Category Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3
          id={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <span aria-hidden="true">{icon}</span>
          <span>{category}</span>
          <Badge variant="neutral" size="sm" aria-label={`${items.length} items in ${category}`}>
            {items.length}
          </Badge>
        </h3>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {checkedCount} / {items.length} collected
        </span>
      </div>

      {/* Progress Bar */}
      <div
        className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${category} progress`}
      >
        <div
          className="h-full bg-success transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Items List */}
      <ul className="space-y-2" role="list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
              item.checked
                ? "border-success/30 bg-success/5"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
            role="listitem"
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              id={`item-${item.id}`}
              checked={item.checked}
              onChange={() => onItemToggle(item.id)}
              className="h-5 w-5 cursor-pointer rounded border-gray-300 text-success focus:ring-2 focus:ring-success"
              aria-label={`${item.checked ? 'Uncheck' : 'Check'} ${item.name}`}
            />

            {/* Item Details */}
            <label
              htmlFor={`item-${item.id}`}
              className={`flex-1 cursor-pointer ${
                item.checked ? "text-muted-foreground line-through" : ""
              }`}
            >
              <span className="font-medium">{item.name}</span>
              {item.amount && item.unit && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({item.amount} {item.unit})
                </span>
              )}
            </label>

            {/* Remove Button */}
            <button
              onClick={() => onItemRemove(item.id)}
              className="rounded p-1.5 text-error hover:bg-error/10 transition-colors"
              aria-label={`Remove ${item.name} from list`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
