"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NutritionGoal {
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: string;
}

interface GoalTrackerProps {
  goals: NutritionGoal[];
  period?: "daily" | "weekly";
}

/**
 * Goal tracker component with progress visualization
 */
export function GoalTracker({ goals, period = "daily" }: GoalTrackerProps) {
  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getStatusBadge = (progress: number) => {
    if (progress >= 100) return { variant: "success" as const, label: "Complete" };
    if (progress >= 80) return { variant: "warning" as const, label: "Almost There" };
    if (progress >= 50) return { variant: "info" as const, label: "In Progress" };
    return { variant: "neutral" as const, label: "Just Started" };
  };

  const overallProgress = goals.length > 0
    ? Math.round(
        goals.reduce((sum, goal) => sum + calculateProgress(goal.current, goal.target), 0) /
          goals.length
      )
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Goal Tracker</span>
              <span className="text-2xl" aria-hidden="true">🎯</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 capitalize">
              {period} nutrition goals
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
            <div className="text-xs text-muted-foreground">Overall</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Overall Progress Bar */}
        <div className="mb-6">
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
            role="progressbar"
            aria-valuenow={overallProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall goal progress"
          >
            <div
              className={`h-full transition-all duration-500 ${
                overallProgress >= 100
                  ? "bg-success"
                  : overallProgress >= 80
                  ? "bg-warning"
                  : "bg-primary"
              }`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Individual Goals */}
        <div className="space-y-4" role="list" aria-label="Nutrition goals">
          {goals.map((goal, index) => {
            const progress = calculateProgress(goal.current, goal.target);
            const status = getStatusBadge(progress);
            const remaining = Math.max(0, goal.target - goal.current);

            return (
              <div
                key={index}
                className="rounded-lg border border-gray-200 p-4 hover:border-primary/50 transition-colors"
                role="listitem"
              >
                {/* Goal Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden="true">{goal.icon}</span>
                    <div>
                      <h4 className="font-semibold">{goal.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {goal.current} / {goal.target} {goal.unit}
                      </p>
                    </div>
                  </div>
                  <Badge variant={status.variant} size="sm">
                    {status.label}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${goal.name} progress: ${progress}%`}
                  >
                    <div
                      className={`h-full transition-all duration-500 ${goal.color}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{progress}% complete</span>
                  {remaining > 0 && (
                    <span>
                      {remaining} {goal.unit} remaining
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-muted-foreground mb-4">No goals set yet</p>
            <Button variant="primary" onClick={() => window.location.href = '/profile'}>
              Set Your Goals
            </Button>
          </div>
        )}

        {/* Footer Actions */}
        {goals.length > 0 && (
          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => window.location.href = '/profile'}
            >
              Adjust Goals
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => window.location.href = '/planner'}
            >
              Plan Meals
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
