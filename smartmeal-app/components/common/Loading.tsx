"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function LoadingSpinner({ size = "md", color = "#FF6B35" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-gray-200 border-t-[${color}] rounded-full animate-spin`}
      style={{ borderTopColor: color }}
    />
  );
}

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <LoadingSkeleton className="aspect-video" />
      <div className="p-4 space-y-3">
        <LoadingSkeleton className="h-6 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <LoadingSkeleton className="h-6 w-16" />
          <LoadingSkeleton className="h-6 w-16" />
          <LoadingSkeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}
