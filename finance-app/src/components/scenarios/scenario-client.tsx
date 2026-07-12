"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  Plus,
  CheckCircle,
  HelpCircle,
  Trash2,
  GitCompare,
  Lightbulb,
} from "lucide-react";

type Scenario = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  startDate: string | Date;
  durationMonths: number;
  priority: string;
  estimatedCost: any;
  expectedIncomeImpact: any;
  expectedExpenseImpact: any;
  status: string;
};

type Comparison = {
  scenarioId: string;
  name: string;
  type: string;
  durationMonths: number;
  cashFlowImpactMonthly: number;
  savingsImpactMonthly: number;
  simulatedSavingsTotal: number;
  simulatedHealthScore: number;
  simulatedEmergencyFundScore: number;
  completionProbability: number;
  risks: string[];
  goalDelays: string[];
  aiExplanation: {
    advantages: string[];
    disadvantages: string[];
    tradeoffs: string;
    preparationAdvice: string;
    alternativeStrategy: string;
  };
};

export function ScenarioClient({
  initialScenarios,
  initialComparisons,
  currency,
}: {
  initialScenarios: Scenario[];
  initialComparisons: Comparison[];
  currency: string;
}) {
  const router = useRouter();
  const [comparisons, setComparisons] = React.useState<Comparison[]>(initialComparisons);
  const [isAdding, setIsAdding] = React.useState(false);

  // Form State
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("BuyHouse");
  const [description, setDescription] = React.useState("");
  const [startDate, setStartDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [durationMonths, setDurationMonths] = React.useState(24);
  const [priority, setPriority] = React.useState("medium");
  const [estimatedCost, setEstimatedCost] = React.useState(0);
  const [expectedIncomeImpact, setExpectedIncomeImpact] = React.useState(0);
  const [expectedExpenseImpact, setExpectedExpenseImpact] = React.useState(0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        description,
        startDate,
        durationMonths,
        priority,
        estimatedCost,
        expectedIncomeImpact,
        expectedExpenseImpact,
      }),
    });

    if (res.ok) {
      setIsAdding(false);
      resetForm();
      refreshComparisons();
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/scenarios/${id}`, { method: "DELETE" });
    if (res.ok) {
      refreshComparisons();
    }
  }

  async function refreshComparisons() {
    const res = await fetch("/api/scenarios/simulate");
    const data = await res.json();
    setComparisons(data.comparisons ?? []);
    router.refresh();
  }

  function resetForm() {
    setName("");
    setType("BuyHouse");
    setDescription("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setDurationMonths(24);
    setPriority("medium");
    setEstimatedCost(0);
    setExpectedIncomeImpact(0);
    setExpectedExpenseImpact(0);
  }

  // Generate chart data representing savings trend over 24 months for comparisons
  const chartData = Array.from({ length: 25 }, (_, monthIndex) => {
    const point: any = { month: `M${monthIndex}` };
    const baseSavings = 5000 + 800 * monthIndex;
    point["Baseline (Steady)"] = baseSavings;

    comparisons.forEach((comp) => {
      // simulatedSavingsTotal over months
      // If monthIndex starts, subtract estimatedCost upfront.
      const scenarioAccumulation = comp.savingsImpactMonthly * monthIndex;
      const initialCostOffset = monthIndex >= 1 ? comp.durationMonths >= monthIndex ? comp.savingsImpactMonthly * monthIndex : comp.savingsImpactMonthly * comp.durationMonths : 0;
      // Simple projection:
      const totalSimulated = 5000 + comp.savingsImpactMonthly * monthIndex - (monthIndex >= 2 ? comp.simulatedSavingsTotal < 0 ? 5000 : 0 : 0);
      point[comp.name] = Math.max(0, 5000 + comp.savingsImpactMonthly * monthIndex - (monthIndex >= 1 ? baseSavings - comp.simulatedSavingsTotal : 0));
    });

    return point;
  });

  return (
    <div className="space-y-6">
      {/* Header and triggers */}
      <div className="flex justify-between items-center pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <p className="text-xs text-neutral-400">
          Model future life decisions to analyze health resilience, emergency buffers, and surplus margins.
        </p>
        <Button
          size="sm"
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Scenario
        </Button>
      </div>

      {/* Comparisons Matrix Table */}
      <div className="grid gap-6 lg:grid-cols-3">
        {comparisons.map((comp) => (
          <Card key={comp.scenarioId} className="border-neutral-100 dark:border-neutral-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-semibold">{comp.name}</CardTitle>
                <Badge variant="info" className="text-[8px] px-1 py-0 uppercase">{comp.type}</Badge>
              </div>
              <button
                onClick={() => handleDelete(comp.scenarioId)}
                className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                title="Delete scenario"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div>
                  <span className="text-neutral-400 text-[10px] block">Surplus Impact</span>
                  <span className={cn("font-bold text-sm", comp.cashFlowImpactMonthly >= 0 ? "text-green-600" : "text-red-600")}>
                    {comp.cashFlowImpactMonthly >= 0 ? "+" : ""}{formatMoney(comp.cashFlowImpactMonthly, currency)}/mo
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] block">Probability Success</span>
                  <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                    {comp.completionProbability}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div>
                  <span className="text-neutral-400 text-[10px] block">Simulated Health</span>
                  <Badge variant={comp.simulatedHealthScore > 65 ? "success" : "warning"} className="text-[10px] font-bold px-1.5 py-0.5 mt-0.5">
                    {comp.simulatedHealthScore}/100
                  </Badge>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] block">Simulated Emergency</span>
                  <Badge variant={comp.simulatedEmergencyFundScore > 60 ? "success" : "danger"} className="text-[10px] font-bold px-1.5 py-0.5 mt-0.5">
                    {comp.simulatedEmergencyFundScore}/100
                  </Badge>
                </div>
              </div>

              {/* Risks & Goal delays */}
              {comp.risks.length > 0 && (
                <div className="space-y-1.5 bg-red-50/50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-100/50 dark:border-red-950/30">
                  <span className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-1 text-[9px] uppercase">
                    <AlertTriangle className="h-3 w-3" /> Simulation Risks
                  </span>
                  <ul className="list-disc pl-3 text-[9px] text-red-600 dark:text-red-400 space-y-0.5 leading-relaxed">
                    {comp.risks.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI trade-offs panel */}
              <div className="space-y-3 pt-2">
                <span className="font-semibold text-neutral-500 block uppercase text-[9px] tracking-wider">AI Trade-offs & Analysis</span>
                <div className="space-y-2 leading-relaxed text-[10px]">
                  <div>
                    <span className="font-semibold text-green-700 dark:text-green-400">Advantages:</span>
                    <ul className="list-disc pl-3 text-neutral-600 dark:text-neutral-400 space-y-0.5">
                      {comp.aiExplanation.advantages.map((ad, idx) => (
                        <li key={idx}>{ad}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-red-700 dark:text-red-400">Disadvantages:</span>
                    <ul className="list-disc pl-3 text-neutral-600 dark:text-neutral-400 space-y-0.5">
                      {comp.aiExplanation.disadvantages.map((ad, idx) => (
                        <li key={idx}>{ad}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-900 p-2 rounded border">
                    <p className="text-neutral-500"><strong className="text-neutral-700 dark:text-neutral-300">Preparation advice:</strong> {comp.aiExplanation.preparationAdvice}</p>
                    <p className="text-neutral-500 mt-1"><strong className="text-neutral-700 dark:text-neutral-300">Strategy:</strong> {comp.aiExplanation.alternativeStrategy}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Savings Projection chart comparing scenarios */}
      {comparisons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <GitCompare className="h-4 w-4 text-indigo-500" /> 24-Month Savings Path Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-100 dark:stroke-neutral-800" />
                  <XAxis dataKey="month" className="text-[10px] fill-neutral-400" />
                  <YAxis className="text-[10px] fill-neutral-400" />
                  <Tooltip contentStyle={{ fontSize: "11px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="Baseline (Steady)" stroke="#a3a3a3" strokeDasharray="5 5" strokeWidth={1.5} />
                  {comparisons.map((comp, idx) => {
                    const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];
                    return (
                      <Line
                        key={comp.scenarioId}
                        type="monotone"
                        dataKey={comp.name}
                        stroke={colors[idx % colors.length]}
                        strokeWidth={2}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      {isAdding && (
        <Dialog open={isAdding} onClose={() => setIsAdding(false)} title="Create New Life Scenario">
          <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Scenario Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Buy a Tesla" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Scenario Type</label>
                <Select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="BuyHouse">Buying a House</option>
                  <option value="BuyVehicle">Buying a Vehicle</option>
                  <option value="Retirement">Retirement Track</option>
                  <option value="Startup">Business Startup</option>
                  <option value="CareerChange">Career Change</option>
                  <option value="Custom">Custom Event</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                placeholder="Model details and assumptions..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Duration (Months)</label>
                <Input type="number" value={durationMonths} onChange={(e) => setDurationMonths(parseInt(e.target.value) || 12)} required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Priority</label>
                <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t pt-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Estimated Upfront Cost</label>
                <Input type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)} required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Monthly Income Impact</label>
                <Input type="number" value={expectedIncomeImpact} onChange={(e) => setExpectedIncomeImpact(parseFloat(e.target.value) || 0)} required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Monthly Expense Impact</label>
                <Input type="number" value={expectedExpenseImpact} onChange={(e) => setExpectedExpenseImpact(parseFloat(e.target.value) || 0)} required />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Run Simulator</Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
