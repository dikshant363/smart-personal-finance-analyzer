"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  RefreshCw,
  Upload,
  Layers,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

type SyncHistory = {
  id: string;
  provider: string;
  status: string;
  startedAt: string | Date;
  completedAt: string | Date | null;
  durationMs: number | null;
  itemsImported: number;
  duplicatesFound: number;
  warningsCount: number;
  errorsCount: number;
  logMessage: string | null;
};

export function ConnectorClient({
  initialHistory,
  connectedAccountsCount,
  currency,
}: {
  initialHistory: SyncHistory[];
  connectedAccountsCount: number;
  currency: string;
}) {
  const router = useRouter();
  const [history, setHistory] = React.useState<SyncHistory[]>(initialHistory);
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Manual uploads states
  const [csvData, setCsvData] = React.useState("date,amount,description,type,category\n2026-07-10,150.00,Costco Grocery,Expense,Food\n2026-07-11,80.00,Shell Gas,Expense,Gas");
  const [jsonData, setJsonData] = React.useState('[\n  {"date": "2026-07-10", "amount": 45.00, "description": "Netflix Subscription", "type": "Expense", "category": "Entertainment"}\n]');

  async function handleSync(provider: "Mock" | "CSV" | "JSON", payload?: string) {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/connectors/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, payload }),
      });

      if (res.ok) {
        refreshHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  }

  async function refreshHistory() {
    const res = await fetch("/api/connectors/history");
    if (res.ok) {
      const data = await res.json();
      setHistory(data.history ?? []);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid gap-4 md:grid-cols-4 text-xs">
        <Card>
          <CardHeader className="pb-1">
            <span className="font-bold text-neutral-400">Connected Accounts</span>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-extrabold text-neutral-800 dark:text-white">
              {connectedAccountsCount} Accounts
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <span className="font-bold text-neutral-400">Sync Status</span>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-extrabold text-green-600 flex items-center gap-1.5">
              <CheckCircle className="h-5 w-5" /> Healthy
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <span className="font-bold text-neutral-400">Recent Imports count</span>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-extrabold text-neutral-800 dark:text-white">
              {history.reduce((sum, item) => sum + item.itemsImported, 0)} Items
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Active feeds</span>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              3 Adapters
            </h2>
          </CardContent>
        </Card>
      </div>

      {/* Sync tools triggers */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Sync Trigger card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Automatic Feeds & Webhooks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs leading-relaxed">
              <div className="p-4 border rounded-xl flex justify-between items-center bg-white dark:bg-neutral-950">
                <div className="space-y-1">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">Mock Bank Feed (Plaid Emulator)</span>
                  <p className="text-[10px] text-neutral-400 max-w-sm">Connects to simulated sandbox bank endpoints to pull new checkings/card transactions instantly.</p>
                </div>
                <Button
                  onClick={() => handleSync("Mock")}
                  disabled={isSyncing}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5"
                >
                  <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} /> Sync Banking Feed
                </Button>
              </div>

              {/* CSV upload manual */}
              <div className="p-4 border rounded-xl space-y-3 bg-white dark:bg-neutral-950">
                <div className="space-y-1">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">Manual CSV Import Payload</span>
                  <p className="text-[10px] text-neutral-400">Paste raw text matching format: <code>date,amount,description,type,category</code>.</p>
                </div>
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-[10px] font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSync("CSV", csvData)}
                    disabled={isSyncing}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1"
                  >
                    <Upload className="h-3.5 w-3.5" /> Import CSV Payload
                  </Button>
                </div>
              </div>

              {/* JSON upload manual */}
              <div className="p-4 border rounded-xl space-y-3 bg-white dark:bg-neutral-950">
                <div className="space-y-1">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">Manual JSON Import Payload</span>
                  <p className="text-[10px] text-neutral-400">Paste json arrays containing transaction attributes.</p>
                </div>
                <textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-[10px] font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSync("JSON", jsonData)}
                    disabled={isSyncing}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1"
                  >
                    <Upload className="h-3.5 w-3.5" /> Import JSON Payload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: sync logs feed */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-500" /> Synchronization Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto space-y-3 text-[10px]">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">Provider: {item.provider}</span>
                    <Badge variant={item.status === "Completed" ? "success" : item.status === "Started" ? "info" : "danger"}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-normal">{item.logMessage}</p>
                  <div className="flex justify-between pt-1 text-[9px] text-neutral-400 border-t border-dashed">
                    <span>Imported: {item.itemsImported} | Dups: {item.duplicatesFound}</span>
                    <span>Duration: {item.durationMs ?? 0}ms</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
