import { Metadata } from "next";
import { IntelligenceHubClient } from "@/components/intelligence-hub/intelligence-hub-client";

export const metadata: Metadata = {
  title: "Financial Intelligence Hub | IFOS",
  description: "Centralized learning portal and educational decision frameworks.",
};

export default function IntelligenceHubPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Financial Intelligence Hub
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Explore educational paths and simulate financial decisions.
        </p>
      </div>

      <IntelligenceHubClient />
    </div>
  );
}
