"use client";

import * as React from "react";
import { formatMoney } from "@/lib/currency";
import { CalendarDays, ArrowRight } from "lucide-react";
import Link from "next/link";

interface TimelineWidgetEvent {
  id: string;
  title: string;
  type: string;
  timestamp: string;
  amount?: number;
}

export default function TimelineWidget({ currency }: { currency: string }) {
  const [events, setEvents] = React.useState<TimelineWidgetEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    fetch("/api/timeline")
      .then((res) => res.json())
      .then((data) => {
        if (mounted) {
          // Get next 3 upcoming/future events (filter out past events if possible, or just slice next 3)
          const now = Date.now();
          const upcoming = (data.events ?? [])
            .filter((e: any) => new Date(e.timestamp).getTime() >= now - 86400000)
            .slice(0, 3);
          setEvents(upcoming);
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
    return <p className="text-xs text-neutral-400">Loading timeline...</p>;
  }

  if (events.length === 0) {
    return <p className="text-xs text-neutral-400">No upcoming events scheduled.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="flex justify-between items-center text-xs p-2 border border-neutral-100 dark:border-neutral-800 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50"
          >
            <div className="space-y-0.5 max-w-[70%]">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 block truncate">
                {ev.title}
              </span>
              <span className="text-[9px] text-neutral-400">
                {new Date(ev.timestamp).toLocaleDateString()}
              </span>
            </div>
            {ev.amount !== undefined && (
              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                {formatMoney(ev.amount, currency)}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="pt-1">
        <Link
          href="/timeline"
          className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
        >
          View Full Timeline <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
