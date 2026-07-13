import { Metadata } from "next";
import InvestmentsClient from "@/components/investments/investments-client";

export const metadata: Metadata = {
  title: "Investment & Wealth Management | Smart Personal Finance Analyzer",
  description: "Monitor and analyze your asset portfolios, target prices, absolute yield performance, dividends, and diversification metrics.",
};

export default function InvestmentsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Wealth Desk
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Model, check, and optimize your portfolios across multiple asset classes with absolute yield tracking.
        </p>
      </div>
      <InvestmentsClient />
    </div>
  );
}
