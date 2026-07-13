import * as React from "react";
import { cn } from "@/lib/utils";

export function CircularProgress({
  value,
  size = 168,
  stroke = 14,
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);
  const color =
    value >= 75
      ? "text-green-500"
      : value >= 40
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div className={cn("relative inline-flex flex-col items-center")}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-neutral-200 dark:text-neutral-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(color)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label ? (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {label}
          </span>
        ) : null}
        <span className={cn("font-bold text-3xl", color)}>{Math.round(value)}</span>
        {sublabel ? (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {sublabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
