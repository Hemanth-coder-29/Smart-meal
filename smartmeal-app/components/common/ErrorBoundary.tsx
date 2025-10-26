"use client";

import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logger from "@/lib/debug";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: "root" | "page" | "feature" | "component";
  context?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: unknown[];
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `err_${Math.random().toString(36).substring(7)}_${Date.now()}`;
    return { 
      hasError: true, 
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { level = "component", context = "Unknown", onError } = this.props;
    const { errorId } = this.state;

    // Enhanced logging with context
    logger.error(
      `ErrorBoundary:${context}`,
      `Error caught at ${level} level`,
      {
        errorId,
        errorMessage: error.message,
        errorName: error.name,
        componentStack: errorInfo.componentStack,
        route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        timestamp: new Date().toISOString(),
      },
      error
    );

    // Store error info in state
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // In production, you could send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary if resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const prevKeys = prevProps.resetKeys || [];
      const currentKeys = this.props.resetKeys;
      
      if (prevKeys.length !== currentKeys.length ||
          prevKeys.some((key, index) => key !== currentKeys[index])) {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      }
    }
  }

  handleReset = () => {
    logger.info('ErrorBoundary', 'User triggered error boundary reset');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = "component", context = "Unknown" } = this.props;
      const { error, errorInfo, errorId } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-2xl w-full border-l-4 border-l-red-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-4xl">⚠️</span>
                <div>
                  <CardTitle className="text-red-600 text-2xl">
                    {level === 'root' ? 'Application Error' : 'Something Went Wrong'}
                  </CardTitle>
                  {isDevelopment && errorId && (
                    <p className="text-xs text-gray-500 mt-1">Error ID: {errorId}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {level === 'root' 
                  ? "We're sorry, but the application encountered an unexpected error. Please try refreshing the page."
                  : "We're sorry, but this part of the page failed to load. You can try reloading or continue using other features."}
              </p>

              {/* Error Message */}
              {isDevelopment && error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                    {error.name}: {error.message}
                  </p>
                  {context !== 'Unknown' && (
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Context: {context}
                    </p>
                  )}
                </div>
              )}

              {/* Technical Details (Development Only) */}
              {isDevelopment && error && errorInfo && (
                <details className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                  <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                    🔍 Technical Details (Development Only)
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="font-semibold text-gray-600 dark:text-gray-400">Error Stack:</p>
                      <pre className="text-xs overflow-auto bg-white dark:bg-gray-900 p-2 rounded mt-1 max-h-40">
                        {error.stack}
                      </pre>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600 dark:text-gray-400">Component Stack:</p>
                      <pre className="text-xs overflow-auto bg-white dark:bg-gray-900 p-2 rounded mt-1 max-h-40">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                {level !== 'root' && (
                  <Button
                    variant="primary"
                    onClick={this.handleReset}
                    className="flex-1"
                  >
                    🔄 Try Again
                  </Button>
                )}
                <Button
                  variant={level === 'root' ? 'primary' : 'secondary'}
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  🔄 Reload Page
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => (window.location.href = '/')}
                  className="flex-1"
                >
                  🏠 Go Home
                </Button>
              </div>

              {/* Support Information */}
              {!isDevelopment && (
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
                  If this problem persists, please contact support.
                  {errorId && ` Reference: ${errorId}`}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
