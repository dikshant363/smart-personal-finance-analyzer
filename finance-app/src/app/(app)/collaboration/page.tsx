import { Metadata } from "next";
import CollaborationClient from "@/features/collaboration/CollaborationClient";

export const metadata: Metadata = {
  title: "Professional Collaboration & Review | Smart Personal Finance Analyzer",
  description: "Securely share summaries, invite financial planners/accountants, audit permission scopes, and structure discussion logs.",
};

export default function CollaborationPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Collaboration Desk
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Model, check, and confirm plans with advisors using granular permissions, comment channels, and complete auditable access parameters.
        </p>
      </div>
      <CollaborationClient />
    </div>
  );
}
