"use client";

import React, { useRef, useEffect } from "react";
import { useFocusTrap, useRestoreFocus } from "@/hooks/useKeyboardNavigation";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Accessible modal component with focus trap and keyboard navigation
 */
export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Trap focus within modal
  useFocusTrap(modalRef as React.RefObject<HTMLElement>, isOpen);

  // Restore focus to trigger element when modal closes
  useRestoreFocus(isOpen);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-2xl font-bold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <span className="text-2xl" aria-hidden="true">
              ×
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">{children}</div>

        {/* Footer */}
        {footer && <div className="flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
