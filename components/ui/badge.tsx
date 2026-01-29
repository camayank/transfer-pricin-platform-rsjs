import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent-glow)] text-[var(--accent-light)] border border-[var(--accent)]/20",
        secondary:
          "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]",
        success:
          "bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success)]/20",
        warning:
          "bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning)]/20",
        error:
          "bg-[var(--error-bg)] text-[var(--error)] border border-[var(--error)]/20",
        info:
          "bg-[var(--info-bg)] text-[var(--info)] border border-[var(--info)]/20",
        outline:
          "text-[var(--text-secondary)] border border-[var(--border-default)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
