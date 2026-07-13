"use client";

import * as React from "react";
import { formatMoney } from "@/lib/currency";
import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function NetWorthWidget({ currency }: { currency: string }) {
  const [netWorth, setNetWorth] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    fetch("/api/assets/net-worth")
      .then((res) => res.json())
      .then((data) => {
        if (mounted) {
          setNetWorth(data.summary?.netWorth ?? 0);
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
    return <p className="text-xs text-neutral-400">Loading net worth summary...</p>;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Balance</span>
        <h2 className="text-2xl font-extrabold text-indigo-950 dark:text-white flex items-baseline gap-1.5">
          {formatMoney(netWorth || 0, currency)}
          <span className="text-xs text-green-600 font-semibold flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" /> Growth track
          </span>
        </h2>
      </div>

      <div className="pt-1">
        <Link
          href="/net-worth"
          className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
        >
          Manage Balance Sheet & Assets <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
