import { Metadata } from "next";
import CommandCenterClient from "@/features/command-center/CommandCenterClient";

export const metadata: Metadata = {
  title: "IFOS Command Center | Smart Personal Finance Analyzer",
  description: "Unified operating desk combining knowledge graphs, risk assessments, digital twin simulations, and command palettes.",
};

export default function CommandCenterPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          IFOS Command Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          The central intelligence desk orchestrating graphs, simulators, risk modules, and quick action consoles.
        </p>
      </div>
      <CommandCenterClient />
    </div>
  );
}
