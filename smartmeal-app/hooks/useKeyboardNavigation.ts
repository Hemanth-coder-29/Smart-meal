"use client";

import { useEffect, useCallback } from "react";

interface KeyboardNavigationOptions {
  /**
   * Enable arrow key navigation (up, down, left, right)
   */
  enableArrowKeys?: boolean;
  
  /**
   * Enable Tab key navigation
   */
  enableTab?: boolean;
  
  /**
   * Enable Escape key to close/cancel
   */
  onEscape?: () => void;
  
  /**
   * Enable Enter key to confirm/select
   */
  onEnter?: () => void;
  
  /**
   * Custom key handlers
   */
  customKeys?: {
    [key: string]: (event: KeyboardEvent) => void;
  };
  
  /**
   * CSS selector for focusable elements within the container
   */
  focusableSelector?: string;
  
  /**
   * Container element ref or selector
   */
  container?: HTMLElement | string;
}

/**
 * Custom hook for implementing keyboard navigation patterns
 * Provides accessible keyboard interactions for components
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    enableArrowKeys = false,
    enableTab = true,
    onEscape,
    onEnter,
    customKeys = {},
    focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    container,
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Handle Escape key
    if (event.key === "Escape" && onEscape) {
      event.preventDefault();
      onEscape();
      return;
    }

    // Handle Enter key
    if (event.key === "Enter" && onEnter) {
      event.preventDefault();
      onEnter();
      return;
    }

    // Handle custom keys
    if (customKeys[event.key]) {
      customKeys[event.key](event);
      return;
    }

    // Handle arrow key navigation
    if (enableArrowKeys && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      handleArrowNavigation(event);
    }
  }, [enableArrowKeys, onEscape, onEnter, customKeys]);

  const handleArrowNavigation = (event: KeyboardEvent) => {
    const containerElement = typeof container === "string" 
      ? document.querySelector(container) as HTMLElement
      : container || document.body;

    if (!containerElement) return;

    const focusableElements = Array.from(
      containerElement.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter((el) => !el.hasAttribute("disabled"));

    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        nextIndex = (currentIndex + 1) % focusableElements.length;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
        break;
    }

    focusableElements[nextIndex]?.focus();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Hook to trap focus within a modal or dialog
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean = true
) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const getFocusableElements = () => {
      return Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((el) => !el.hasAttribute("disabled"));
    };

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element on mount
    const focusableElements = getFocusableElements();
    focusableElements[0]?.focus();

    document.addEventListener("keydown", handleTabKey);

    return () => {
      document.removeEventListener("keydown", handleTabKey);
    };
  }, [containerRef, isActive]);
}

/**
 * Hook to restore focus after component unmounts
 */
export function useRestoreFocus(shouldRestore: boolean = true) {
  useEffect(() => {
    if (!shouldRestore) return;

    const previousActiveElement = document.activeElement as HTMLElement;

    return () => {
      // Restore focus on unmount
      if (previousActiveElement && previousActiveElement.focus) {
        setTimeout(() => previousActiveElement.focus(), 0);
      }
    };
  }, [shouldRestore]);
}

/**
 * Hook for skip-to-content navigation
 */
export function useSkipNavigation() {
  const skipToContent = useCallback((contentId: string) => {
    const content = document.getElementById(contentId);
    if (content) {
      content.tabIndex = -1;
      content.focus();
      content.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return { skipToContent };
}
