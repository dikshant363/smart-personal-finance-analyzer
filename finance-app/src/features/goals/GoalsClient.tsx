"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Progress } from "@/components/ui/Progress";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import { Target, TrendingUp, Calendar, AlertTriangle, Plus, ChevronDown, ChevronUp, CheckCircle, Award } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type Goal = {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline?: string | null;
  priority: string;
  status: string;
  type: string;
  estimatedMonthlyContribution: number;
  actualMonthlyContribution: number;
  expectedCompletion?: string | null;
  forecastCompletion?: string | null;
  progress: number;
  milestones: {
    id: string;
    percentage: number;
    amount: number;
    achievedAt: string | null;
    isCustom: boolean;
  }[];
  contributions: {
    id: string;
    amount: number;
    date: string;
    description: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
};

export function GoalsClient({
  goals,
  currency,
  totals,
}: {
  goals: Goal[];
  currency: string;
  totals?: { target: number; saved: number };
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Goal | null>(null);
  const [filter, setFilter] = React.useState("active");
  const [expandedGoalId, setExpandedGoalId] = React.useState<string | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [targetAmount, setTargetAmount] = React.useState("");
  const [currentAmount, setCurrentAmount] = React.useState("0");
  const [currencyInput, setCurrencyInput] = React.useState("USD");
  const [deadline, setDeadline] = React.useState("");
  const [priority, setPriority] = React.useState("medium");
  const [type, setType] = React.useState("custom");
  const [estimatedMonthlyContribution, setEstimatedMonthlyContribution] = React.useState("0");
  const [actualMonthlyContribution, setActualMonthlyContribution] = React.useState("0");
  
  // Contribution logger states
  const [contribAmount, setContribAmount] = React.useState("");
  const [contribDesc, setContribDesc] = React.useState("");
  const [logOpen, setLogOpen] = React.useState<string | null>(null);

  // Custom milestone states
  const [newMilestonePct, setNewMilestonePct] = React.useState("");
  const [milestoneOpen, setMilestoneOpen] = React.useState<string | null>(null);

  const [saving, setSaving] = React.useState(false);

  function openAdd() {
    setEditing(null);
    setName("");
    setDescription("");
    setTargetAmount("");
    setCurrentAmount("0");
    setCurrencyInput(currency);
    setDeadline("");
    setPriority("medium");
    setType("custom");
    setEstimatedMonthlyContribution("0");
    setActualMonthlyContribution("0");
    setOpen(true);
  }

  function openEdit(g: Goal) {
    setEditing(g);
    setName(g.name);
    setDescription(g.description ?? "");
    setTargetAmount(String(g.targetAmount));
    setCurrentAmount(String(g.currentAmount));
    setCurrencyInput(g.currency);
    setDeadline(g.deadline ? g.deadline.slice(0, 16) : "");
    setPriority(g.priority);
    setType(g.type);
    setEstimatedMonthlyContribution(String(g.estimatedMonthlyContribution));
    setActualMonthlyContribution(String(g.actualMonthlyContribution));
    setOpen(true);
  }

  async function submit() {
    setSaving(true);
    const body = JSON.stringify({
      name,
      description: description || null,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      currency: currencyInput,
      deadline: deadline || null,
      priority,
      type,
      estimatedMonthlyContribution: Number(estimatedMonthlyContribution),
      actualMonthlyContribution: Number(actualMonthlyContribution),
      ...(editing ? { status: editing.status } : { status: "active" }),
    });
    const headers = { "Content-Type": "application/json" };
    try {
      if (editing) {
        await fetch(`/api/goals/${editing.id}`, { method: "PATCH", headers, body });
      } else {
        await fetch("/api/goals", { method: "POST", headers, body });
      }
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, label: string) {
    if (!window.confirm(`Delete goal "${label}"?`)) return;
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleAddContribution(goalId: string) {
    if (!contribAmount) return;
    await fetch(`/api/goals/${goalId}/contributions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(contribAmount),
        description: contribDesc || null,
      }),
    });
    setContribAmount("");
    setContribDesc("");
    setLogOpen(null);
    router.refresh();
  }

  async function handleAddMilestone(goalId: string) {
    if (!newMilestonePct) return;
    await fetch(`/api/goals/${goalId}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        percentage: Number(newMilestonePct),
      }),
    });
    setNewMilestonePct("");
    setMilestoneOpen(null);
    router.refresh();
  }

  async function handleDeleteMilestone(goalId: string, milestoneId: string) {
    if (!window.confirm("Remove this milestone?")) return;
    await fetch(`/api/goals/${goalId}/milestones?milestoneId=${milestoneId}`, {
      method: "DELETE",
    });
    router.refresh();
  }

  const filtered = goals.filter((g) => {
    if (filter === "active") {
      return g.status === "active" || g.status === "behind_schedule" || g.status === "ahead_of_schedule";
    }
    return g.status === filter;
  });

  const priorityVariant: Record<string, "default" | "success" | "warning" | "danger"> = {
    low: "default",
    medium: "warning",
    high: "danger",
    critical: "danger",
  };

  const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
    planning: "default",
    active: "info",
    behind_schedule: "danger",
    ahead_of_schedule: "success",
    completed: "success",
    paused: "warning",
    archived: "default",
    cancelled: "danger",
  };

  const goalTypes = [
    { value: "emergency_fund", label: "Emergency Fund" },
    { value: "vacation", label: "Vacation" },
    { value: "vehicle", label: "Vehicle" },
    { value: "laptop", label: "Laptop" },
    { value: "education", label: "Education" },
    { value: "wedding", label: "Wedding" },
    { value: "home", label: "Home" },
    { value: "investment", label: "Investment" },
    { value: "debt_repayment", label: "Debt Repayment" },
    { value: "retirement", label: "Retirement" },
    { value: "custom", label: "Custom Goal" },
  ];

  // Client-side analytics
  const activeCount = goals.filter((g) => g.status === "active" || g.status === "behind_schedule" || g.status === "ahead_of_schedule").length;
  const completedCount = goals.filter((g) => g.status === "completed").length;
  const totalTarget = goals.reduce((sum, g) => sum + (g.status !== "archived" && g.status !== "cancelled" ? g.targetAmount : 0), 0);
  const totalSaved = goals.reduce((sum, g) => sum + (g.status !== "archived" && g.status !== "cancelled" ? g.currentAmount : 0), 0);
  const displayTarget = totals?.target ?? totalTarget;
  const displaySaved = totals?.saved ?? totalSaved;
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">Active Goals</span>
              <Target className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">{activeCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">Completed Goals</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">{completedCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">Overall Progress</span>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">{overallProgress}%</p>
            <Progress value={overallProgress} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">Total Saved</span>
              <span className="text-xs font-semibold text-neutral-400">of {formatMoney(displayTarget, currency)}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatMoney(displaySaved, currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Add Goal Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {["active", "planning", "completed", "paused", "archived"].map((s) => (
                <Button
                  key={s}
                  variant={filter === s ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilter(s)}
                  className="capitalize"
                >
                  {s === "active" ? "Active / Running" : s}
                </Button>
              ))}
            </div>
            <Button onClick={openAdd} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Target className="h-10 w-10 text-neutral-400" />}
              title="No goals yet"
              description="Create a goal to begin tracking your financial targets."
              action={<Button onClick={openAdd}>Add goal</Button>}
            />
          ) : (
            <div className="space-y-4">
              {filtered.map((g) => {
                const isExpanded = expandedGoalId === g.id;

                // Recharts Forecast Data calculation
                const chartData = [];
                const createdAtDate = new Date(g.createdAt);
                const targetVal = g.targetAmount;
                const currentVal = g.currentAmount;

                // Point 1: Start point
                chartData.push({
                  date: createdAtDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                  Actual: 0,
                  Target: 0,
                });

                // Point 2: Current progress
                chartData.push({
                  date: "Today",
                  Actual: currentVal,
                  Target: Math.round(targetVal * 0.4), // Midpoint ideal trajectory projection
                });

                // Point 3: Projected Completion
                if (g.deadline) {
                  chartData.push({
                    date: new Date(g.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    Actual: null,
                    Target: targetVal,
                  });
                }
                if (g.forecastCompletion) {
                  chartData.push({
                    date: new Date(g.forecastCompletion).toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " (Est)",
                    Actual: targetVal,
                    Target: null,
                  });
                }

                return (
                  <div
                    key={g.id}
                    className={cn(
                      "rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 transition-all bg-white dark:bg-neutral-950",
                      isExpanded && "ring-1 ring-indigo-500/30"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">
                            {g.name}
                          </span>
                          <Badge variant={statusVariant[g.status] as any} className="capitalize">
                            {g.status.replace("_", " ")}
                          </Badge>
                          <Badge variant={priorityVariant[g.priority] as any} className="capitalize">
                            {g.priority}
                          </Badge>
                          <Badge variant="default" className="capitalize bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                            {g.type.replace("_", " ")}
                          </Badge>
                        </div>
                        {g.description ? (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {g.description}
                          </p>
                        ) : null}

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                          <div>
                            <span className="font-medium">{formatMoney(g.currentAmount, g.currency)}</span>
                            <span className="text-neutral-400"> of </span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {formatMoney(g.targetAmount, g.currency)}
                            </span>
                          </div>
                          {g.deadline ? (
                            <div className="flex items-center gap-1 text-neutral-500">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Target: {new Date(g.deadline).toLocaleDateString()}</span>
                            </div>
                          ) : null}
                          {g.forecastCompletion ? (
                            <div className="flex items-center gap-1 text-neutral-500 font-medium">
                              <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                              <span>Est. Completion: {new Date(g.forecastCompletion).toLocaleDateString()}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(g)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => remove(g.id, g.name)}>
                          Delete
                        </Button>
                        <button
                          onClick={() => setExpandedGoalId(isExpanded ? null : g.id)}
                          className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                        <span>Progress</span>
                        <span>{g.progress}%</span>
                      </div>
                      <Progress value={g.progress} className="h-2" />
                    </div>

                    {/* Detailed Expanded View */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 grid gap-6 md:grid-cols-2">
                        {/* Left Column: Visualizations & Targets */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-indigo-500" /> Forecast Curve & Progress
                          </h4>

                          {/* Recharts Timeline */}
                          <div className="h-48 w-full border border-neutral-100 dark:border-neutral-800 rounded-lg p-2 bg-neutral-50/50 dark:bg-neutral-900/50">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                <YAxis tickFormatter={(val) => `${g.currency} ${val}`} tick={{ fontSize: 10 }} />
                                <Tooltip formatter={(val: number) => [formatMoney(val, g.currency), ""]} />
                                <Legend />
                                <Line type="monotone" dataKey="Actual" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="Target" stroke="#10b981" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 4 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="border border-neutral-100 dark:border-neutral-800 p-2.5 rounded-lg">
                              <span className="text-neutral-400 block">Est. Monthly Saving</span>
                              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                {formatMoney(g.estimatedMonthlyContribution, g.currency)}/mo
                              </span>
                            </div>
                            <div className="border border-neutral-100 dark:border-neutral-800 p-2.5 rounded-lg">
                              <span className="text-neutral-400 block">Actual Monthly Saving</span>
                              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                {formatMoney(g.actualMonthlyContribution, g.currency)}/mo
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Contributions & Milestones */}
                        <div className="space-y-4">
                          {/* Milestones section */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                                <Award className="h-4 w-4 text-amber-500" /> Milestones
                              </h4>
                              <button
                                onClick={() => setMilestoneOpen(milestoneOpen === g.id ? null : g.id)}
                                className="text-xs text-indigo-500 hover:text-indigo-600 font-semibold"
                              >
                                + Add Custom
                              </button>
                            </div>

                            {milestoneOpen === g.id && (
                              <div className="flex items-center gap-2 p-2 border border-neutral-100 dark:border-neutral-800 rounded-lg">
                                <Input
                                  type="number"
                                  placeholder="Milestone % (e.g. 80)"
                                  value={newMilestonePct}
                                  onChange={(e) => setNewMilestonePct(e.target.value)}
                                  className="h-8 text-xs"
                                />
                                <Button size="sm" className="h-8 text-xs px-2.5" onClick={() => handleAddMilestone(g.id)}>
                                  Save
                                </Button>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-1.5">
                              {g.milestones
                                .sort((a, b) => a.percentage - b.percentage)
                                .map((m) => (
                                  <div
                                    key={m.id}
                                    className={cn(
                                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all",
                                      m.achievedAt
                                        ? "bg-green-50/50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
                                        : "bg-neutral-50/50 border-neutral-200 text-neutral-500 dark:bg-neutral-900/50 dark:border-neutral-800"
                                    )}
                                  >
                                    <span>{m.percentage}%</span>
                                    {m.achievedAt ? (
                                      <span className="text-[10px] opacity-75">✓</span>
                                    ) : null}
                                    {m.isCustom && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteMilestone(g.id, m.id)}
                                        className="hover:text-red-500 font-bold ml-1"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Contributions log */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-green-500" /> Contributions
                              </h4>
                              <button
                                onClick={() => setLogOpen(logOpen === g.id ? null : g.id)}
                                className="text-xs text-indigo-500 hover:text-indigo-600 font-semibold"
                              >
                                + Add Contribution
                              </button>
                            </div>

                            {logOpen === g.id && (
                              <div className="space-y-2 p-3 border border-neutral-100 dark:border-neutral-800 rounded-lg">
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={contribAmount}
                                    onChange={(e) => setContribAmount(e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                  <Input
                                    placeholder="Description"
                                    value={contribDesc}
                                    onChange={(e) => setContribDesc(e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div className="flex justify-end gap-1.5">
                                  <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setLogOpen(null)}>
                                    Cancel
                                  </Button>
                                  <Button size="sm" className="h-7 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => handleAddContribution(g.id)}>
                                    Log Saving
                                  </Button>
                                </div>
                              </div>
                            )}

                            <div className="max-h-36 overflow-y-auto space-y-1.5 border border-neutral-100 dark:border-neutral-800 rounded-lg p-2 bg-neutral-50/50 dark:bg-neutral-900/50">
                              {g.contributions.length === 0 ? (
                                <p className="text-xs text-neutral-400 text-center py-4">No contributions logged yet.</p>
                              ) : (
                                g.contributions.map((c) => (
                                  <div
                                    key={c.id}
                                    className="flex justify-between items-center text-xs p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                                  >
                                    <div>
                                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                        {formatMoney(c.amount, g.currency)}
                                      </span>
                                      {c.description ? (
                                        <span className="text-neutral-400 text-[10px] ml-1.5">— {c.description}</span>
                                      ) : null}
                                    </div>
                                    <span className="text-neutral-400 text-[10px]">
                                      {new Date(c.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goal Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit Goal" : "Add Goal"}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Emergency fund" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="6 months of expenses" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="type">Goal Type</Label>
              <Select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                {goalTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="target">Target Amount</Label>
              <Input id="target" type="number" step="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="10000" />
            </div>
            <div>
              <Label htmlFor="current">Current Amount</Label>
              <Input id="current" type="number" step="0.01" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="estimated">Est. Monthly Contribution</Label>
              <Input id="estimated" type="number" step="0.01" value={estimatedMonthlyContribution} onChange={(e) => setEstimatedMonthlyContribution(e.target.value)} placeholder="500" />
            </div>
            <div>
              <Label htmlFor="actual">Actual Monthly Contribution</Label>
              <Input id="actual" type="number" step="0.01" value={actualMonthlyContribution} onChange={(e) => setActualMonthlyContribution(e.target.value)} placeholder="500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" value={currencyInput} onChange={(e) => setCurrencyInput(e.target.value)} placeholder="USD" />
            </div>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submit} disabled={saving || !name || !targetAmount}>
              {editing ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
