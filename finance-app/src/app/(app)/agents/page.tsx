import { Metadata } from "next";
import AgentClient from "@/components/agent/agent-client";

export const metadata: Metadata = {
  title: "AI Agent Orchestrator | Smart Personal Finance Analyzer",
  description: "Leverage specialized context-aware AI agents for budget coaching, retirement plans, and tax checkouts.",
};

export default function AgentsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Agent Command Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Interact with specialized agents that construct query context directly from database sources.
        </p>
      </div>
      <AgentClient />
    </div>
  );
}
