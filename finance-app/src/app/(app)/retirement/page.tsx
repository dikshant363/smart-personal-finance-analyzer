import { Metadata } from "next";
import RetirementClient from "@/components/retirement/retirement-client";

export const metadata: Metadata = {
  title: "Retirement & Long-Term Planning | Smart Personal Finance Analyzer",
  description: "Model retirement nest egg scenarios, simulate Safe Withdrawal rates, compound returns, and calculate projected gap milestones.",
};

export default function RetirementPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Retirement & Long-Term Desk
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Create side-by-side comparative models to project withdrawal durations, nested budgets, and accumulation timelines.
        </p>
      </div>
      <RetirementClient />
    </div>
  );
}
