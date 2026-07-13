import { Metadata } from "next";
import RiskClient from "@/components/risk/risk-client";

export const metadata: Metadata = {
  title: "Risk Management & Insurance | Smart Personal Finance Analyzer",
  description: "Track insurance policies, calculate protection coverage gaps, view liquid emergency reserves, and audit carrier details.",
};

export default function RiskPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Risk & Protection Desk
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Monitor your coverage thresholds, list active policies, and evaluate risk mitigation factors.
        </p>
      </div>
      <RiskClient />
    </div>
  );
}
