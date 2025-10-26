import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md" | "lg";
}

function Badge({ className, variant = "neutral", size = "md", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        {
          "bg-success text-white": variant === "success",
          "bg-warning text-gray-900": variant === "warning",
          "bg-error text-white": variant === "danger",
          "bg-blue-500 text-white": variant === "info",
          "bg-neutral text-white": variant === "neutral",
        },
        {
          "px-2 py-0.5 text-xs": size === "sm",
          "px-3 py-1 text-sm": size === "md",
          "px-4 py-1.5 text-base": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
