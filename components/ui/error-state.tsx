"use client";

import { AlertTriangle, RefreshCw, XCircle } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent } from "./card";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: "error" | "warning" | "info";
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading data. Please try again.",
  onRetry,
  variant = "error",
}: ErrorStateProps) {
  const icons = {
    error: XCircle,
    warning: AlertTriangle,
    info: AlertTriangle,
  };

  const colors = {
    error: "text-[var(--error)]",
    warning: "text-[var(--warning)]",
    info: "text-[var(--info)]",
  };

  const Icon = icons[variant];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Icon className={`h-12 w-12 ${colors[variant]}`} />
      <h3 className="mt-4 text-lg font-medium text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--text-muted)] text-center max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

export function ErrorCard({
  title = "Error Loading Data",
  message = "An error occurred while loading data. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="py-12">
        <ErrorState title={title} message={message} onRetry={onRetry} />
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {Icon && <Icon className="h-12 w-12 text-[var(--text-muted)]" />}
      <h3 className="mt-4 text-lg font-medium text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-[var(--text-muted)] text-center max-w-md">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
}
