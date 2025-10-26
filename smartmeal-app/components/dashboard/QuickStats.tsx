import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}

function StatCard({ icon, label, value, subtext, color = "text-primary" }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
          </div>
          <div className="text-4xl">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickStatsProps {
  stats: {
    favorites: number;
    plannedMeals: number;
    shoppingItems: number;
    weeklyCalories: number;
  };
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon="♥"
        label="Favorite Recipes"
        value={stats.favorites}
        color="text-red-500"
      />
      <StatCard
        icon="📅"
        label="Planned Meals"
        value={stats.plannedMeals}
        subtext="This week"
        color="text-blue-500"
      />
      <StatCard
        icon="🛒"
        label="Shopping Items"
        value={stats.shoppingItems}
        subtext="To purchase"
        color="text-green-500"
      />
      <StatCard
        icon="🔥"
        label="Weekly Calories"
        value={stats.weeklyCalories.toLocaleString()}
        subtext="Avg per day"
        color="text-orange-500"
      />
    </div>
  );
}
