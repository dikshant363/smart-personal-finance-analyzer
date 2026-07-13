import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100",
  success:
    "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
