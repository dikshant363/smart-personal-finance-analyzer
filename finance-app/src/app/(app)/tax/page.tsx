import { Metadata } from "next";
import TaxClient from "@/components/tax/TaxClient";

export const metadata: Metadata = {
  title: "Tax Intelligence & Planning | Smart Personal Finance Analyzer",
  description: "Map deductible categories, calculate taxable income approximations, track receipts, and structure tax preparation worksheets.",
};

export default function TaxPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Tax Desk
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Analyze taxable yield parameters, list mappings, and audit documentation logs for preparation reporting.
        </p>
      </div>
      <TaxClient />
    </div>
  );
}
