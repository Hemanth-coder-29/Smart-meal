/**
 * ErrorMessage Component
 * Displays user-friendly error messages with different variants and recovery actions
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export type ErrorVariant = 'network' | 'notFound' | 'validation' | 'server' | 'generic';

interface ErrorMessageProps {
  variant?: ErrorVariant;
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  onNavigate?: {
    label: string;
    href: string;
  };
  showDetails?: boolean;
}

const variantConfig: Record<
  ErrorVariant,
  { icon: string; title: string; color: string }
> = {
  network: {
    icon: '🌐',
    title: 'Connection Error',
    color: 'text-orange-600',
  },
  notFound: {
    icon: '🔍',
    title: 'Not Found',
    color: 'text-yellow-600',
  },
  validation: {
    icon: '⚠️',
    title: 'Invalid Input',
    color: 'text-amber-600',
  },
  server: {
    icon: '🔧',
    title: 'Server Error',
    color: 'text-red-600',
  },
  generic: {
    icon: '⚠️',
    title: 'Something Went Wrong',
    color: 'text-gray-600',
  },
};

export function ErrorMessage({
  variant = 'generic',
  title,
  message,
  details,
  onRetry,
  onNavigate,
  showDetails = process.env.NODE_ENV === 'development',
}: ErrorMessageProps) {
  const config = variantConfig[variant];
  const displayTitle = title || config.title;
  const [detailsExpanded, setDetailsExpanded] = React.useState(false);

  return (
    <Card className="p-6 max-w-2xl mx-auto my-8 border-l-4 border-l-red-500">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icon and Title */}
        <div className="text-5xl mb-2">{config.icon}</div>
        <h2 className={`text-2xl font-bold ${config.color}`}>{displayTitle}</h2>

        {/* Message */}
        <p className="text-gray-700 dark:text-gray-300">{message}</p>

        {/* Technical Details (Development Only) */}
        {showDetails && details && (
          <div className="w-full mt-4">
            <button
              onClick={() => setDetailsExpanded(!detailsExpanded)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
              type="button"
            >
              {detailsExpanded ? 'Hide' : 'Show'} Technical Details
            </button>
            {detailsExpanded && (
              <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-left text-xs font-mono overflow-auto max-h-40">
                <pre className="whitespace-pre-wrap">{details}</pre>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          {onRetry && (
            <Button onClick={onRetry} variant="primary">
              🔄 Try Again
            </Button>
          )}
          {onNavigate && (
            <Button
              onClick={() => (window.location.href = onNavigate.href)}
              variant="secondary"
            >
              {onNavigate.label}
            </Button>
          )}
          {!onRetry && !onNavigate && (
            <Button onClick={() => (window.location.href = '/')} variant="secondary">
              🏠 Go to Homepage
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Specialized error message for network errors
 */
export function NetworkError({
  onRetry,
  message = 'Unable to connect to the server. Please check your internet connection.',
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <ErrorMessage
      variant="network"
      message={message}
      onRetry={onRetry}
      onNavigate={!onRetry ? { label: '🏠 Go to Homepage', href: '/' } : undefined}
    />
  );
}

/**
 * Specialized error message for not found errors
 */
export function NotFoundError({
  resourceType = 'resource',
  resourceId,
  onNavigate,
}: {
  resourceType?: string;
  resourceId?: string;
  onNavigate?: { label: string; href: string };
}) {
  const message = resourceId
    ? `The ${resourceType} "${resourceId}" could not be found. It may have been removed or the link is incorrect.`
    : `The ${resourceType} you're looking for could not be found.`;

  return (
    <ErrorMessage
      variant="notFound"
      message={message}
      onNavigate={onNavigate || { label: '🔍 Browse All', href: '/search' }}
    />
  );
}

/**
 * Specialized error message for validation errors
 */
export function ValidationError({
  message,
  field,
}: {
  message: string;
  field?: string;
}) {
  const displayMessage = field
    ? `${field}: ${message}`
    : message;

  return <ErrorMessage variant="validation" message={displayMessage} />;
}

/**
 * Specialized error message for server errors
 */
export function ServerError({
  message = 'We encountered an error on our end. Please try again in a moment.',
  onRetry,
  details,
}: {
  message?: string;
  onRetry?: () => void;
  details?: string;
}) {
  return (
    <ErrorMessage
      variant="server"
      message={message}
      details={details}
      onRetry={onRetry}
    />
  );
}

export default ErrorMessage;
