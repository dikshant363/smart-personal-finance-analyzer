"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { ForecastPoint } from "@/lib/forecasting";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";

export function ForecastTimeline({
  points,
  currency = "USD",
  height = 320,
}: {
  points: ForecastPoint[];
  currency?: string;
  height?: number;
}) {
  const data = points.map((p) => ({
    date: p.date,
    value: p.value,
    upper: p.upper,
    lower: p.lower,
  }));

  const hasBounds = data.some((d) => d.lower != null && d.upper != null);

  const formatY = (value: number) => formatMoney(value, currency);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            className="text-neutral-500 dark:text-neutral-400"
            stroke="currentColor"
          />
          <YAxis
            tickFormatter={formatY}
            tick={{ fontSize: 12 }}
            className="text-neutral-500 dark:text-neutral-400"
            stroke="currentColor"
            width={80}
          />
          <Tooltip
            formatter={(value: number) => formatMoney(value, currency)}
            labelFormatter={(label) => label}
          />
          {hasBounds && (
            <Line
              type="monotone"
              dataKey="upper"
              stroke="#6366f1"
              strokeDasharray="4 4"
              dot={false}
              strokeWidth={1}
            />
          )}
          {hasBounds && (
            <Line
              type="monotone"
              dataKey="lower"
              stroke="#6366f1"
              strokeDasharray="4 4"
              dot={false}
              strokeWidth={1}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
