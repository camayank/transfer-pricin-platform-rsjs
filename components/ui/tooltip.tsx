"use client";

import * as React from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
        >
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-secondary)] shadow-lg max-w-xs">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

// Info tooltip helper
interface InfoTooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function InfoTooltip({ content, position = "top" }: InfoTooltipProps) {
  return (
    <Tooltip content={content} position={position}>
      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[var(--bg-secondary)] text-xs text-[var(--text-muted)] hover:bg-[var(--accent-glow)] hover:text-[var(--accent)]">
        ?
      </span>
    </Tooltip>
  );
}

// Field hint with info icon
interface FieldHintProps {
  hint: string;
  label?: string;
}

export function FieldHint({ hint, label }: FieldHintProps) {
  return (
    <div className="flex items-center gap-1.5">
      {label && (
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </span>
      )}
      <Tooltip content={hint} position="right">
        <span className="inline-flex cursor-help items-center text-[var(--text-muted)] hover:text-[var(--accent)]">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
      </Tooltip>
    </div>
  );
}
