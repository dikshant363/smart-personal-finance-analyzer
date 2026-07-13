"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import {
  Wifi,
  WifiOff,
  CloudLightning,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
} from "lucide-react";

type OfflineSyncAction = {
  id: string;
  action: string;
  payload: string;
  status: string;
  createdAt: string | Date;
};

type Category = {
  id: string;
  name: string;
};

export function OfflineClient({
  initialQueue,
  categories,
}: {
  initialQueue: OfflineSyncAction[];
  categories: Category[];
}) {
  const router = useRouter();
  const [queue, setQueue] = React.useState<OfflineSyncAction[]>(initialQueue);
  const [isOnline, setIsOnline] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Form State
  const [desc, setDesc] = React.useState("");
  const [amount, setAmount] = React.useState(0);
  const [type, setType] = React.useState("Expense");
  const [categoryId, setCategoryId] = React.useState(categories[0]?.id || "");

  async function handleAddAction(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      description: desc,
      amount,
      type,
      categoryId,
      date: new Date().toISOString(),
    };

    const res = await fetch("/api/offline/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CreateTransaction", payload }),
    });

    if (res.ok) {
      setDesc("");
      setAmount(0);
      refreshQueue();
    }
  }

  async function handleSync() {
    setIsSyncing(true);
    const res = await fetch("/api/offline/sync", { method: "POST" });
    if (res.ok) {
      refreshQueue();
    }
    setIsSyncing(false);
  }

  async function refreshQueue() {
    const res = await fetch("/api/offline/queue");
    if (res.ok) {
      const data = await res.json();
      setQueue(data.queue ?? []);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Banner */}
      <div
        className={cn(
          "p-4 border rounded-2xl flex justify-between items-center transition-all text-xs",
          isOnline
            ? "border-green-100 bg-green-50/30 text-green-800 dark:bg-neutral-900/10 dark:text-green-400"
            : "border-amber-100 bg-amber-50/30 text-amber-800 dark:bg-neutral-900/10 dark:text-amber-500"
        )}
      >
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi className="h-6 w-6 text-green-600 dark:text-green-400 animate-pulse" />
          ) : (
            <WifiOff className="h-6 w-6 text-amber-600 dark:text-amber-500 animate-bounce" />
          )}
          <div>
            <span className="font-bold text-sm block">
              Simulation Status: {isOnline ? "Online Mode" : "Offline Mode"}
            </span>
            <p className="text-[10px] opacity-80 leading-normal">
              {isOnline
                ? "The application has fully functioning active database and API network channels."
                : "Network calls are paused. Actions are stored in the Offline Queue and will sync when you toggle Online."}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const nextMode = !isOnline;
            setIsOnline(nextMode);
            if (nextMode) {
              handleSync();
            }
          }}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0",
            isOnline
              ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
              : "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
          )}
        >
          {isOnline ? "Go Offline" : "Go Online"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Add offline actions form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Log Offline Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAction} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">Description</label>
                    <Input value={desc} onChange={(e) => setDesc(e.target.value)} required placeholder="Groceries, Fuel, Bills..." />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">Amount</label>
                    <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">Type</label>
                    <Select value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="Expense">Expense</option>
                      <option value="Income">Income</option>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">Category</label>
                    <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  {!isOnline && (
                    <Badge variant="danger" className="text-[9px] uppercase tracking-wide">
                      <CloudLightning className="h-3 w-3 mr-0.5 inline" /> Local Queue Mode
                    </Badge>
                  )}
                  <span />
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> Queue Transaction
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column: sync queue and triggers */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Offline Action Queue</CardTitle>
              <Button
                size="sm"
                onClick={handleSync}
                disabled={isSyncing || !isOnline}
                className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 text-[10px]"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")} /> Process Queue
              </Button>
            </CardHeader>
            <CardContent className="max-h-[350px] overflow-y-auto space-y-2.5 text-xs">
              {queue.length === 0 && (
                <div className="text-center py-6 text-neutral-400 space-y-1.5">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                  <p className="font-semibold">Queue is empty</p>
                  <p className="text-[10px]">No pending offline actions waiting for sync.</p>
                </div>
              )}
              {queue.map((item) => {
                const payloadObj = JSON.parse(item.payload);
                return (
                  <div
                    key={item.id}
                    className="p-3 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {payloadObj.description}
                      </span>
                      <p className="text-[9px] text-neutral-400">
                        Action: {item.action} | Amount: {payloadObj.amount}
                      </p>
                    </div>
                    <Badge variant="default" className="text-[8px] bg-indigo-50 text-indigo-600 dark:bg-neutral-800 dark:text-indigo-400">
                      {item.status}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
