import { Metadata } from "next";
import DeveloperClient from "@/components/developer/DeveloperClient";

export const metadata: Metadata = {
  title: "Developer command deck | Smart Personal Finance Analyzer",
  description: "Configure third-party plug-ins, list event listener webhooks, register extensions, and toggle Developer sandbox modes.",
};

export default function DeveloperPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Developer Command Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Build and integrate custom widgets, document processors, or webhook callbacks using secure extension registries.
        </p>
      </div>
      <DeveloperClient />
    </div>
  );
}
