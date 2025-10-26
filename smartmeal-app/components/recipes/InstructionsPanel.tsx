"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InstructionsPanelProps {
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
}

/**
 * Step-by-step instructions panel with progress tracking
 */
export function InstructionsPanel({
  instructions,
  prepTime,
  cookTime,
}: InstructionsPanelProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleStepComplete = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);

    // Auto-advance to next step
    if (!newCompleted.has(stepIndex) && stepIndex < instructions.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const progress = instructions.length > 0
    ? (completedSteps.size / instructions.length) * 100
    : 0;

  const totalTime = (prepTime || 0) + (cookTime || 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Instructions</CardTitle>
          
          {/* Time Info */}
          {totalTime > 0 && (
            <div className="flex items-center gap-4 text-sm">
              {prepTime && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Prep:</span>
                  <span className="font-semibold">{prepTime}m</span>
                </div>
              )}
              {cookTime && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Cook:</span>
                  <span className="font-semibold">{cookTime}m</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold text-primary">{totalTime}m</span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {completedSteps.size > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium" aria-live="polite">
                {completedSteps.size} / {instructions.length} completed
              </span>
            </div>
            <div
              className="w-full bg-gray-200 rounded-full h-2"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Cooking progress"
            >
              <div
                className="bg-success h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Step Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {instructions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`flex-shrink-0 w-10 h-10 rounded-full border-2 font-semibold transition-all ${
                  currentStep === index
                    ? "border-primary bg-primary text-white"
                    : completedSteps.has(index)
                    ? "border-success bg-success text-white"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                aria-label={`Go to step ${index + 1}`}
                aria-current={currentStep === index ? "step" : undefined}
              >
                {completedSteps.has(index) ? "✓" : index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Display */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">
              Step {currentStep + 1} of {instructions.length}
            </h3>
            <Badge
              variant={completedSteps.has(currentStep) ? "success" : "neutral"}
              aria-label={completedSteps.has(currentStep) ? "Step completed" : "Step not completed"}
            >
              {completedSteps.has(currentStep) ? "✓ Done" : "In Progress"}
            </Badge>
          </div>

          <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
            <p className="text-lg leading-relaxed" aria-live="polite">
              {instructions[currentStep]}
            </p>
          </div>
        </div>

        {/* Step Controls */}
        <div className="flex gap-3 mb-6" role="group" aria-label="Step navigation controls">
          <Button
            variant="secondary"
            onClick={() => goToStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex-1"
            aria-label="Previous step"
          >
            ← Previous
          </Button>
          
          <Button
            variant="primary"
            onClick={() => handleStepComplete(currentStep)}
            className="flex-1"
            aria-label={completedSteps.has(currentStep) ? "Mark step as incomplete" : "Mark step as complete"}
          >
            {completedSteps.has(currentStep) ? "Undo" : "Complete Step"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => goToStep(Math.min(instructions.length - 1, currentStep + 1))}
            disabled={currentStep === instructions.length - 1}
            className="flex-1"
            aria-label="Next step"
          >
            Next →
          </Button>
        </div>

        {/* All Steps List */}
        <details className="mt-6">
          <summary className="cursor-pointer font-medium text-primary hover:underline">
            View all steps
          </summary>
          <ol className="mt-4 space-y-4" role="list" aria-label="All cooking steps">
            {instructions.map((instruction, index) => (
              <li
                key={index}
                className={`flex gap-4 p-4 rounded-lg border transition-all ${
                  completedSteps.has(index)
                    ? "bg-green-50 border-green-200"
                    : index === currentStep
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
                role="listitem"
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    completedSteps.has(index)
                      ? "bg-success text-white"
                      : index === currentStep
                      ? "bg-primary text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                  aria-hidden="true"
                >
                  {completedSteps.has(index) ? "✓" : index + 1}
                </div>
                <div className="flex-1">
                  <p className={completedSteps.has(index) ? "text-muted-foreground" : ""}>
                    {instruction}
                  </p>
                </div>
                <button
                  onClick={() => handleStepComplete(index)}
                  className="flex-shrink-0 px-3 py-1 text-sm rounded hover:bg-white transition-colors"
                  aria-label={completedSteps.has(index) ? `Mark step ${index + 1} as incomplete` : `Mark step ${index + 1} as complete`}
                >
                  {completedSteps.has(index) ? "Undo" : "Done"}
                </button>
              </li>
            ))}
          </ol>
        </details>

        {/* Completion Message */}
        {completedSteps.size === instructions.length && (
          <div
            className="mt-6 p-4 bg-success/10 border-2 border-success rounded-lg text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-lg font-semibold text-success">
              🎉 All steps completed! Enjoy your meal!
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCompletedSteps(new Set());
                setCurrentStep(0);
              }}
              className="mt-2"
              aria-label="Reset all steps"
            >
              Start Over
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
