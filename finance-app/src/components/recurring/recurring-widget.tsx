"use client";

import * as React from "react";
import { formatMoney } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecurringWidgetData {
  analytics: {
    monthlyRecurringExpenses: number;
    upcomingObligationsCount: number;
    missedPaymentsCount: number;
  };
  optimizations: {
    title: string;
    summary: string;
  }[];
}

export default function RecurringWidget({ currency }: { currency: string }) {
  const [data, setData] = React.useState<RecurringWidgetData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    fetch("/api/recurring")
      .then((res) => res.json())
      .then((resData) => {
        if (mounted) {
          setData(resData);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <p className="text-xs text-neutral-400">Loading recurring metrics...</p>;
  }

  if (!data) {
    return <p className="text-xs text-neutral-400">No recurring commitments found.</p>;
  }

  const { analytics, optimizations } = data;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-neutral-400">Monthly Commitment</span>
        <span className="font-bold text-neutral-800 dark:text-neutral-200">
          {formatMoney(analytics.monthlyRecurringExpenses, currency)}
        </span>
      </div>

      <div className="flex justify-between items-center text-xs pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-neutral-400">Upcoming Payments</span>
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
          {analytics.upcomingObligationsCount} Due
        </span>
      </div>

      {analytics.missedPaymentsCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>{analytics.missedPaymentsCount} Overdue Bills</span>
        </div>
      )}

      {optimizations.length > 0 && (
        <div className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-start gap-2">
          <span className="text-xs shrink-0 mt-0.5">💡</span>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {optimizations[0].title}
            </p>
            <p className="text-[10px] text-neutral-400">{optimizations[0].summary}</p>
          </div>
        </div>
      )}

      <div className="pt-1">
        <Link
          href="/recurring"
          className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
        >
          Manage Subscriptions <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
