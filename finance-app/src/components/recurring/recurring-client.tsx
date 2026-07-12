"use client";

import * as React from "react";
import type { DetectedRecurringItem } from "@/lib/recurring";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CreditCard,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Plus,
  RefreshCw,
  Trash2,
  Edit2,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type RecurringItem = {
  id: string;
  name: string;
  categoryId: string | null;
  category: { name: string } | null;
  type: "Income" | "Expense";
  frequency: string;
  amount: number;
  expectedNextDate: string;
  lastPaidDate: string | null;
  status: string;
  confidence: number;
  isDetected: boolean;
};

type RecurringAnalytics = {
  monthlyRecurringExpenses: number;
  yearlyRecurringExpenses: number;
  recurringIncome: number;
  recurringExpenseRatio: number;
  largestRecurringExpenses: { name: string; amount: number; frequency: string }[];
  upcomingObligationsCount: number;
  missedPaymentsCount: number;
};

type SubscriptionOptimization = {
  recurringItemId: string;
  name: string;
  type: string;
  title: string;
  summary: string;
  explanation: string;
  potentialSavings: number;
};

// DetectedRecurringItem is imported from @/lib/recurring

export function RecurringClient({
  initialItems,
  initialAnalytics,
  initialOptimizations,
  forecast,
  initialDetected,
  categories,
  currency,
}: {
  initialItems: RecurringItem[];
  initialAnalytics: RecurringAnalytics;
  initialOptimizations: SubscriptionOptimization[];
  forecast: { monthName: string; recurringExpenses: number; recurringIncome: number }[];
  initialDetected: DetectedRecurringItem[];
  categories: { id: string; name: string }[];
  currency: string;
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<RecurringItem[]>(initialItems);
  const [analytics, setAnalytics] = React.useState<RecurringAnalytics>(initialAnalytics);
  const [optimizations, setOptimizations] = React.useState<SubscriptionOptimization[]>(initialOptimizations);
  const [detected, setDetected] = React.useState<DetectedRecurringItem[]>(initialDetected);

  // Modal / Form states
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<RecurringItem | null>(null);
  const [name, setName] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [type, setType] = React.useState<"Income" | "Expense">("Expense");
  const [frequency, setFrequency] = React.useState("Monthly");
  const [amount, setAmount] = React.useState("");
  const [expectedNextDate, setExpectedNextDate] = React.useState("");
  const [lastPaidDate, setLastPaidDate] = React.useState("");
  const [status, setStatus] = React.useState("Active");
  const [saving, setSaving] = React.useState(false);

  // Scanner modal states
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);
  const [selectedDetected, setSelectedDetected] = React.useState<Record<number, boolean>>({});

  // Calendar visual state
  const [upcomingCalendar, setUpcomingCalendar] = React.useState<any[]>([]);
  const [loadingCalendar, setLoadingCalendar] = React.useState(true);

  React.useEffect(() => {
    fetchCalendarData();
  }, []);

  async function fetchCalendarData() {
    setLoadingCalendar(true);
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      const res = await fetch(`/api/recurring/calendar?start=${start}&end=${end}`);
      const data = await res.json();
      setUpcomingCalendar(data.upcoming ?? []);
    } finally {
      setLoadingCalendar(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setName("");
    setCategoryId("");
    setType("Expense");
    setFrequency("Monthly");
    setAmount("");
    setExpectedNextDate("");
    setLastPaidDate("");
    setStatus("Active");
    setOpen(true);
  }

  function openEdit(item: RecurringItem) {
    setEditing(item);
    setName(item.name);
    setCategoryId(item.categoryId ?? "");
    setType(item.type);
    setFrequency(item.frequency);
    setAmount(String(item.amount));
    setExpectedNextDate(item.expectedNextDate.slice(0, 10));
    setLastPaidDate(item.lastPaidDate ? item.lastPaidDate.slice(0, 10) : "");
    setStatus(item.status);
    setOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    const body = JSON.stringify({
      name,
      categoryId: categoryId || null,
      type,
      frequency,
      amount: Number(amount),
      expectedNextDate: new Date(expectedNextDate).toISOString(),
      lastPaidDate: lastPaidDate ? new Date(lastPaidDate).toISOString() : null,
      status,
    });

    const headers = { "Content-Type": "application/json" };
    try {
      if (editing) {
        await fetch(`/api/recurring/${editing.id}`, { method: "PATCH", headers, body });
      } else {
        await fetch("/api/recurring", { method: "POST", headers, body });
      }
      setOpen(false);
      refreshData();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, label: string) {
    if (!window.confirm(`Delete recurring item "${label}"?`)) return;
    await fetch(`/api/recurring/${id}`, { method: "DELETE" });
    refreshData();
  }

  async function triggerScan() {
    setScanning(true);
    setScannerOpen(true);
    try {
      const res = await fetch("/api/recurring/detect");
      const data = await res.json();
      setDetected(data.detected ?? []);
      const initialSelection: Record<number, boolean> = {};
      (data.detected ?? []).forEach((_: any, idx: number) => {
        initialSelection[idx] = true;
      });
      setSelectedDetected(initialSelection);
    } finally {
      setScanning(false);
    }
  }

  async function confirmBulkDetected() {
    const toConfirm = detected.filter((_, idx) => selectedDetected[idx]);
    if (toConfirm.length === 0) {
      setScannerOpen(false);
      return;
    }

    await fetch("/api/recurring/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: toConfirm }),
    });

    setScannerOpen(false);
    refreshData();
  }

  async function refreshData() {
    const res = await fetch("/api/recurring");
    const data = await res.json();
    setItems(data.items ?? []);
    setAnalytics(data.analytics ?? initialAnalytics);
    setOptimizations(data.optimizations ?? []);
    fetchCalendarData();
    router.refresh();
  }

  const priorityVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
    Active: "info",
    Paused: "warning",
    Completed: "success",
    Cancelled: "default",
    Overdue: "danger",
  };

  return (
    <div className="space-y-6">
      {/* Analytics widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">Monthly Recurring Bills</span>
              <CreditCard className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">{formatMoney(analytics.monthlyRecurringExpenses, currency)}</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">Yearly Commitment</span>
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">{formatMoney(analytics.yearlyRecurringExpenses, currency)}</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">Recurring Expense Ratio</span>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">{analytics.recurringExpenseRatio}%</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">Upcoming (30 days)</span>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">{analytics.upcomingObligationsCount} Payments</p>
            {analytics.missedPaymentsCount > 0 && (
              <span className="text-[10px] text-red-500 font-semibold">{analytics.missedPaymentsCount} Overdue/Missed</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main panel split */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Subscriptions list */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Active Subscriptions & Commitments</CardTitle>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="outline" onClick={triggerScan} className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Auto-Scan
                </Button>
                <Button size="sm" onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add Manual
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <EmptyState
                  icon={<CreditCard className="h-8 w-8 text-neutral-400" />}
                  title="No recurring transactions found"
                  description="Manually create a subscription or run the auto-scanner to extract them from transaction history."
                  action={<Button onClick={openAdd}>Add subscription</Button>}
                />
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 hover:shadow-sm transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                            {item.name}
                          </span>
                          <Badge variant={priorityVariant[item.status] as any} className="text-[10px] px-1.5 py-0 capitalize">
                            {item.status}
                          </Badge>
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300">
                            {item.frequency}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 text-xs text-neutral-400">
                          <span>Category: {item.category?.name || "Uncategorized"}</span>
                          <span>Next Date: {new Date(item.expectedNextDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={cn("font-bold text-sm", item.type === "Income" ? "text-green-600" : "text-neutral-800 dark:text-neutral-200")}>
                          {item.type === "Income" ? "+" : "-"}{formatMoney(item.amount, currency)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => remove(item.id, item.name)}
                            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar timeline visual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-indigo-500" /> Upcoming Payment Calendar (Current Month)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCalendar ? (
                <p className="text-xs text-neutral-400">Loading timeline...</p>
              ) : upcomingCalendar.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">No upcoming bills this month.</p>
              ) : (
                <div className="relative border-l border-neutral-200 dark:border-neutral-800 pl-4 ml-2 space-y-4">
                  {upcomingCalendar.map((item, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className={cn(
                        "absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-neutral-900",
                        item.status === "Overdue" ? "bg-red-500" : item.status === "Paid" ? "bg-green-500" : "bg-indigo-500"
                      )} />
                      <div className="flex justify-between items-start text-xs bg-neutral-50/50 dark:bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{item.name}</span>
                          <span className="text-[10px] text-neutral-400 block">{item.categoryName}</span>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">{formatMoney(item.amount, currency)}</span>
                          <span className="text-[10px] text-neutral-400 block">{new Date(item.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Optimizations, Projections, Analytics */}
        <div className="space-y-6">
          {/* Monthly commitment Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">6-Month Commitments Projections</CardTitle>
            </CardHeader>
            <CardContent className="h-44 p-0.5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="monthName" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={(val) => `${currency} ${val}`} />
                  <Tooltip formatter={(val: number) => formatMoney(val, currency)} />
                  <Legend />
                  <Area type="monotone" name="Obligations" dataKey="recurringExpenses" stroke="#ef4444" fill="#fecaca" fillOpacity={0.2} strokeWidth={1.5} />
                  <Area type="monotone" name="Recurring Income" dataKey="recurringIncome" stroke="#10b981" fill="#a7f3d0" fillOpacity={0.2} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Optimizations recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-amber-500" /> Optimizations Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[380px] overflow-y-auto">
              {optimizations.length === 0 ? (
                <p className="text-xs text-neutral-400 py-6 text-center">All set! No optimizations needed.</p>
              ) : (
                optimizations.map((opt, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">
                        {opt.title}
                      </span>
                      <Badge variant="success" className="text-[9px] px-1 py-0 font-bold">
                        Save {formatMoney(opt.potentialSavings, currency)}/yr
                      </Badge>
                    </div>
                    <p className="text-[10px] text-neutral-500 leading-relaxed">{opt.explanation}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manual Add / Edit Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit Recurring Commitment" : "Add Recurring Commitment"}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="subName">Name</Label>
            <Input id="subName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Netflix, Rent, Salary..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="subType">Type</Label>
              <Select id="subType" value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="subCat">Category</Label>
              <Select id="subCat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="subFreq">Frequency</Label>
              <Select id="subFreq" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Biweekly">Biweekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Semi-Annual">Semi-Annual</option>
                <option value="Annual">Annual</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="subAmt">Amount</Label>
              <Input id="subAmt" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="15.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="subNext">Expected Next Date</Label>
              <Input id="subNext" type="date" value={expectedNextDate} onChange={(e) => setExpectedNextDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="subLast">Last Paid Date</Label>
              <Input id="subLast" type="date" value={lastPaidDate} onChange={(e) => setLastPaidDate(e.target.value)} />
            </div>
          </div>

          {editing && (
            <div>
              <Label htmlFor="subStatus">Status</Label>
              <Select id="subStatus" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Overdue">Overdue</option>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit} disabled={saving || !name || !amount || !expectedNextDate}>
              {editing ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Auto-scanner Results Dialog */}
      <Dialog open={scannerOpen} onClose={() => setScannerOpen(false)} title="Auto-Scan Detected Recurring Subscriptions">
        <div className="space-y-3">
          {scanning ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
              <p className="text-xs text-neutral-400">Scanning transaction history logs...</p>
            </div>
          ) : detected.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-6">
              No new recurring patterns detected in the last 180 days of transaction data.
            </p>
          ) : (
            <>
              <p className="text-xs text-neutral-400 mb-2">
                We detected the following recurring billing structures in your transaction logs:
              </p>
              <div className="max-h-60 overflow-y-auto space-y-2.5">
                {detected.map((det, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 border border-neutral-100 dark:border-neutral-800 rounded-lg hover:bg-neutral-50/50"
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedDetected[idx]}
                      onChange={(e) =>
                        setSelectedDetected({ ...selectedDetected, [idx]: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500 shrink-0"
                    />
                    <div className="flex-1 space-y-0.5 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{det.name}</span>
                        <Badge variant="success" className="text-[8px] px-1 py-0">
                          {Math.round(det.confidence * 100)}% Confidence
                        </Badge>
                      </div>
                      <div className="text-[10px] text-neutral-400 flex justify-between items-center">
                        <span>{det.frequency} equivalent</span>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">
                          {formatMoney(det.amount, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <Button variant="outline" size="sm" onClick={() => setScannerOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={confirmBulkDetected} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Add Selected
                </Button>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
}
