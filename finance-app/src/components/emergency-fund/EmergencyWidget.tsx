"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Shield, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatMoney } from "@/lib/currency";

interface EmergencyFundData {
  metrics: {
    readinessScore: number;
    readinessCategory: string;
    coverageDurationMonths: number;
    currentEmergencyFund: number;
    emergencyFundTarget: number;
  };
  recommendations: {
    title: string;
    summary: string;
  }[];
}

export default function EmergencyWidget({ currency }: { currency: string }) {
  const [data, setData] = React.useState<EmergencyFundData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    fetch("/api/emergency-fund")
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
    return <p className="text-xs text-neutral-400">Loading emergency metrics...</p>;
  }

  if (!data) {
    return <p className="text-xs text-neutral-400">No emergency data.</p>;
  }

  const { metrics, recommendations } = data;
  const coveragePercent = Math.min(100, Math.round((metrics.currentEmergencyFund / metrics.emergencyFundTarget) * 100) || 0);

  const categoryColor: Record<string, string> = {
    Excellent: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400",
    Good: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400",
    Moderate: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
    Low: "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400",
    Critical: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            {metrics.readinessScore}
          </span>
          <span className="text-xs text-neutral-400">/ 100 Readiness</span>
        </div>
        <Badge className={categoryColor[metrics.readinessCategory]}>{metrics.readinessCategory}</Badge>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-neutral-500">
          <span>{metrics.coverageDurationMonths} Months Covered</span>
          <span>{coveragePercent}%</span>
        </div>
        <Progress value={coveragePercent} className="h-1.5" />
      </div>

      {recommendations.length > 0 && (
        <div className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {recommendations[0].title}
            </p>
            <p className="text-[10px] text-neutral-400">{recommendations[0].summary}</p>
          </div>
        </div>
      )}

      <div className="pt-1">
        <Link
          href="/emergency-fund"
          className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
        >
          Open Planner <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
