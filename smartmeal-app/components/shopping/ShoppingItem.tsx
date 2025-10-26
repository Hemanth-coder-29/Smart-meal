"use client";

import React from "react";

interface ShoppingItemProps {
  id: string;
  name: string;
  amount?: string;
  unit?: string;
  checked: boolean;
  onToggle: () => void;
  onRemove: () => void;
}

/**
 * Individual shopping list item with checkbox toggle
 */
export function ShoppingItem({
  id,
  name,
  amount,
  unit,
  checked,
  onToggle,
  onRemove,
}: ShoppingItemProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
        checked
          ? "border-success/30 bg-success/5"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
      role="listitem"
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        id={`shopping-item-${id}`}
        checked={checked}
        onChange={onToggle}
        className="h-5 w-5 cursor-pointer rounded border-gray-300 text-success focus:ring-2 focus:ring-success"
        aria-label={`${checked ? 'Uncheck' : 'Check'} ${name}${amount && unit ? ` ${amount} ${unit}` : ''}`}
      />

      {/* Item Details */}
      <label
        htmlFor={`shopping-item-${id}`}
        className={`flex-1 cursor-pointer select-none ${
          checked ? "text-muted-foreground line-through" : ""
        }`}
      >
        <span className="font-medium">{name}</span>
        {amount && unit && (
          <span className="ml-2 text-sm text-muted-foreground">
            ({amount} {unit})
          </span>
        )}
      </label>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="flex-shrink-0 rounded p-1.5 text-error hover:bg-error/10 transition-colors focus:outline-none focus:ring-2 focus:ring-error"
        aria-label={`Remove ${name} from shopping list`}
        type="button"
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
    </div>
  );
}
