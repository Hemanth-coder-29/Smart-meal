"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CookingTimerProps {
  initialMinutes?: number;
  onComplete?: () => void;
  title?: string;
}

export function CookingTimer({
  initialMinutes = 10,
  onComplete,
  title = "Cooking Timer",
}: CookingTimerProps) {
  const [timeInSeconds, setTimeInSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(initialMinutes);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isRunning && timeInSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimeInSeconds((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeInSeconds]);

  const handleComplete = () => {
    setIsRunning(false);
    onComplete?.();
    // Play alert sound
    if (typeof window !== "undefined") {
      const audio = new Audio("/sounds/timer-complete.mp3");
      audio.play().catch(() => {
        // Fallback if audio fails
        alert("Timer Complete!");
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (timeInSeconds === 0) {
      setTimeInSeconds(customMinutes * 60);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeInSeconds(customMinutes * 60);
  };

  const handleSetTime = (minutes: number) => {
    setCustomMinutes(minutes);
    setTimeInSeconds(minutes * 60);
    setIsRunning(false);
  };

  const progress = customMinutes > 0 
    ? ((customMinutes * 60 - timeInSeconds) / (customMinutes * 60)) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-6" role="timer" aria-label="Cooking timer">
          {/* Timer Display */}
          <div className="relative">
            <div className="text-7xl font-bold text-primary mb-4" aria-live="polite" aria-atomic="true">
              {formatTime(timeInSeconds)}
            </div>
            
            {/* Progress Circle */}
            <div className="w-48 h-48 mx-auto relative" role="img" aria-label={`Timer progress: ${progress.toFixed(0)}% complete`}>
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#FF6B35"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground" aria-hidden="true">
                    {progress.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground" role="status" aria-live="polite">
                    {isRunning ? "Running" : "Paused"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 justify-center" role="group" aria-label="Timer controls">
            {!isRunning ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleStart}
                className="min-w-32"
                aria-label={timeInSeconds === customMinutes * 60 ? "Start timer" : "Resume timer"}
              >
                {timeInSeconds === customMinutes * 60 ? "Start" : "Resume"}
              </Button>
            ) : (
              <Button
                variant="danger"
                size="lg"
                onClick={handlePause}
                className="min-w-32"
                aria-label="Pause timer"
              >
                Pause
              </Button>
            )}
            <Button variant="ghost" size="lg" onClick={handleReset} aria-label="Reset timer">
              Reset
            </Button>
          </div>

          {/* Quick Time Presets */}
          <fieldset className="pt-4 border-t">
            <legend className="text-sm font-medium mb-3">Quick Set:</legend>
            <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Quick time presets">
              {[5, 10, 15, 20, 25, 30, 45, 60].map((mins) => (
                <Button
                  key={mins}
                  variant={customMinutes === mins ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => handleSetTime(mins)}
                  disabled={isRunning}
                  aria-label={`Set timer to ${mins} minutes`}
                  aria-pressed={customMinutes === mins}
                >
                  {mins}m
                </Button>
              ))}
            </div>
          </fieldset>

          {/* Custom Time Input */}
          <div className="pt-4 border-t">
            <label htmlFor="custom-time-input" className="block text-sm font-medium mb-2">
              Custom Time (minutes)
            </label>
            <div className="flex gap-2 justify-center items-center max-w-xs mx-auto">
              <input
                id="custom-time-input"
                type="number"
                min="1"
                max="180"
                value={customMinutes}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setCustomMinutes(Math.min(Math.max(value, 1), 180));
                }}
                disabled={isRunning}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                aria-label="Custom timer duration in minutes"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSetTime(customMinutes)}
                disabled={isRunning}
                aria-label="Set custom timer duration"
              >
                Set
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
