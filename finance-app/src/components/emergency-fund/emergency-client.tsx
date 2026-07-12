"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  Settings,
  Activity,
  Play,
  HeartPulse,
  Wrench,
  UserX,
  CreditCard,
  History,
  CheckCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type EmergencyMetrics = {
  monthlyEssentialExpenses: number;
  emergencyFundTarget: number;
  currentEmergencyFund: number;
  coverageDurationMonths: number;
  savingsRate: number;
  monthlyContribution: number;
  completionForecastMonths: number | null;
  completionForecastDate: string | Date | null;
  readinessScore: number;
  readinessCategory: string;
};

type HistoryLog = {
  id: string;
  month: string;
  coverageMonths: number;
  readinessScore: number;
  currentReserve: number;
  essentialExpenses: number;
};

type CategoryBreakdown = {
  categoryName: string;
  amount: number;
  percentage: number;
};

type Recommendation = {
  type: string;
  title: string;
  summary: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  potentialSavings: number;
};

type ForecastPoint = {
  monthName: string;
  projectedReserve: number;
  projectedCoverageMonths: number;
};

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function EmergencyClient({
  initialSettings,
  initialMetrics,
  history,
  breakdown,
  recommendations,
  forecast,
  currency,
}: {
  initialSettings: any;
  initialMetrics: EmergencyMetrics;
  history: HistoryLog[];
  breakdown: CategoryBreakdown[];
  recommendations: Recommendation[];
  forecast: ForecastPoint[];
  currency: string;
}) {
  const router = useRouter();
  const [targetMonths, setTargetMonths] = React.useState(initialSettings.targetMonths);
  const [customEssential, setCustomEssential] = React.useState(
    initialSettings.customEssentialExpenses ? String(initialSettings.customEssentialExpenses) : ""
  );
  const [customReserve, setCustomReserve] = React.useState(
    initialSettings.customReserve ? String(initialSettings.customReserve) : ""
  );
  
  const [metrics, setMetrics] = React.useState<EmergencyMetrics>(initialMetrics);
  const [updatingSettings, setUpdatingSettings] = React.useState(false);

  // Simulator states
  const [simulationScenario, setSimulationScenario] = React.useState("job_loss");
  const [simulationValue, setSimulationValue] = React.useState("");
  const [simulationResult, setSimulationResult] = React.useState<any | null>(null);
  const [simulating, setSimulating] = React.useState(false);

  async function handleSaveSettings() {
    setUpdatingSettings(true);
    try {
      const res = await fetch("/api/emergency-fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetMonths: Number(targetMonths),
          customEssentialExpenses: customEssential ? Number(customEssential) : null,
          customReserve: customReserve ? Number(customReserve) : null,
        }),
      });
      const data = await res.json();
      if (data.metrics) {
        setMetrics(data.metrics);
      }
      router.refresh();
    } finally {
      setUpdatingSettings(false);
    }
  }

  async function handleRunSimulation() {
    setSimulating(true);
    try {
      const res = await fetch("/api/emergency-fund/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: simulationScenario,
          paramValue: simulationValue ? Number(simulationValue) : undefined,
        }),
      });
      const data = await res.json();
      setSimulationResult(data.result);
    } finally {
      setSimulating(false);
    }
  }

  const categoryColor: Record<string, string> = {
    Excellent: "text-green-500 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    Good: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800",
    Moderate: "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
    Low: "text-orange-500 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
    Critical: "text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  };

  const difficultyBadge: Record<string, "success" | "warning" | "danger"> = {
    easy: "success",
    medium: "warning",
    hard: "danger",
  };

  const scenarioMeta: Record<string, { label: string; icon: any; placeholder: string }> = {
    job_loss: { label: "Job Loss (6 Months)", icon: UserX, placeholder: "N/A" },
    medical_emergency: { label: "Medical Emergency", icon: HeartPulse, placeholder: "Cost in " + currency },
    unexpected_repair: { label: "Unexpected Home/Auto Repair", icon: Wrench, placeholder: "Cost in " + currency },
    income_reduction: { label: "Income Reduction (%)", icon: AlertTriangle, placeholder: "Reduction percentage (e.g. 20)" },
    large_expense: { label: "Large One-Time Purchase", icon: CreditCard, placeholder: "Cost in " + currency },
    income_pause: { label: "Temporary Income Pause", icon: Play, placeholder: "Duration in months (e.g. 3)" },
  };

  return (
    <div className="space-y-6">
      {/* Top row status */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Readiness radial card */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-indigo-500" /> Emergency Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              {/* Radial Score */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="54" strokeWidth="8" stroke="#f3f4f6" fill="transparent" className="dark:stroke-neutral-800" />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  strokeWidth="8"
                  stroke={metrics.readinessScore >= 70 ? "#10b981" : metrics.readinessScore >= 50 ? "#f59e0b" : "#ef4444"}
                  fill="transparent"
                  strokeDasharray={339.3}
                  strokeDashoffset={339.3 - (339.3 * metrics.readinessScore) / 100}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-200">
                  {metrics.readinessScore}
                </span>
                <span className="text-neutral-400 text-xs block">/ 100</span>
              </div>
            </div>
            <div className="mt-4 text-center space-y-1">
              <Badge className={cn("text-xs font-semibold capitalize px-2.5 py-0.5 border", categoryColor[metrics.readinessCategory])}>
                {metrics.readinessCategory}
              </Badge>
              <p className="text-[10px] text-neutral-400">
                Preparedness Score
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Coverage months summary */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-blue-500" /> Coverage Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-4xl font-extrabold text-neutral-800 dark:text-neutral-200">
                {metrics.coverageDurationMonths}
              </span>
              <span className="text-neutral-400 text-sm font-semibold ml-1">Months</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Coverage progress</span>
                <span>{Math.round((metrics.currentEmergencyFund / metrics.emergencyFundTarget) * 100) || 0}%</span>
              </div>
              <Progress value={(metrics.currentEmergencyFund / metrics.emergencyFundTarget) * 100} className="h-2" />
              <div className="flex justify-between text-[10px] text-neutral-400 pt-1">
                <span>Saved: {formatMoney(metrics.currentEmergencyFund, currency)}</span>
                <span>Target: {formatMoney(metrics.emergencyFundTarget, currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget overview details */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-green-500" /> Core Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-400">Essential Expenses</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {formatMoney(metrics.monthlyEssentialExpenses, currency)}/mo
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-400">Monthly Contribution</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {formatMoney(metrics.monthlyContribution, currency)}/mo
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Estimated Completion</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {metrics.completionForecastMonths !== null
                  ? metrics.completionForecastMonths === 0
                    ? "Completed"
                    : `${metrics.completionForecastMonths} Months`
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target Planning / Configure Card */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Settings className="h-4 w-4" /> Configure Planner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Target Duration (Months)</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {[3, 6, 9, 12].map((m) => (
                  <Button
                    key={m}
                    variant={targetMonths === m ? "primary" : "outline"}
                    size="sm"
                    className="h-8 text-xs p-0"
                    onClick={() => setTargetMonths(m)}
                  >
                    {m}M
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customMonths">Custom Target Months</Label>
              <Input
                id="customMonths"
                type="number"
                value={targetMonths}
                onChange={(e) => setTargetMonths(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customEssential">Custom Monthly Expenses</Label>
              <Input
                id="customEssential"
                placeholder="Fallback dynamic calculation"
                value={customEssential}
                onChange={(e) => setCustomEssential(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customReserve">Custom Cash Reserve</Label>
              <Input
                id="customReserve"
                placeholder="Fallback dynamic calculation"
                value={customReserve}
                onChange={(e) => setCustomReserve(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <Button onClick={handleSaveSettings} disabled={updatingSettings} className="w-full mt-2" size="sm">
              {updatingSettings ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Essential Expenses Categories Pie Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Essential Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 items-center">
            {breakdown.length === 0 ? (
              <p className="text-xs text-neutral-400 py-10 text-center md:col-span-2">No essential expenses detected in history.</p>
            ) : (
              <>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="amount"
                        nameKey="categoryName"
                      >
                        {breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => formatMoney(val, currency)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {breakdown.map((b, index) => (
                    <div key={b.categoryName} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">{b.categoryName}</span>
                      </div>
                      <span className="text-neutral-400 font-semibold">{formatMoney(b.amount, currency)} ({b.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Visualizations row: Forecast curve and History trend */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">12-Month Forecast Projections</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReserve" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="monthName" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(val) => `${currency} ${val}`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val: number) => formatMoney(val, currency)} />
                <Legend />
                <Area type="monotone" name="Projected Cash Reserve" dataKey="projectedReserve" stroke="#6366f1" fillOpacity={1} fill="url(#colorReserve)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Readiness and reserve history log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <History className="h-4 w-4" /> Preparedness History Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {history.length === 0 ? (
              <p className="text-xs text-neutral-400 py-10 text-center">No historical entries logged yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(val) => `${currency} ${val}`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip formatter={(val: number) => val} />
                  <Legend />
                  <Bar yAxisId="left" name="Emergency Cash" dataKey="currentReserve" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" name="Readiness Score" dataKey="readinessScore" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Simulator Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Stress Test Scenario Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="scenarioSelect">Select Scenario</Label>
              <Select id="scenarioSelect" value={simulationScenario} onChange={(e) => setSimulationScenario(e.target.value)}>
                {Object.keys(scenarioMeta).map((s) => (
                  <option key={s} value={s}>
                    {scenarioMeta[s].label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="simVal">{scenarioMeta[simulationScenario].placeholder}</Label>
              <Input
                id="simVal"
                type="number"
                disabled={simulationScenario === "job_loss"}
                placeholder="Enter input values"
                value={simulationScenario === "job_loss" ? "" : simulationValue}
                onChange={(e) => setSimulationValue(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <Button onClick={handleRunSimulation} disabled={simulating} className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5">
              {simulating ? "Simulating..." : "Stress Test"}
            </Button>
          </div>

          {/* Simulation Results Output */}
          {simulationResult && (
            <div className="mt-4 p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">Simulation Output</span>
                <Badge variant={simulationResult.financialRisk === "Critical" || simulationResult.financialRisk === "High" ? "danger" : "warning"} className="uppercase">
                  {simulationResult.financialRisk} Risk
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block">Remaining Cash</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    {formatMoney(simulationResult.cashRemaining, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block">New Coverage Duration</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    {simulationResult.monthsCovered} Months
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Recovery Timeframe</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    {simulationResult.recoveryTimelineMonths !== null
                      ? `${simulationResult.recoveryTimelineMonths} Months`
                      : "Continuous"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-neutral-400 text-xs block font-semibold">Suggested Actions</span>
                <ul className="list-disc pl-5 text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5">
                  {simulationResult.suggestedActions.map((act: string, index: number) => (
                    <li key={index}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-indigo-500" /> Actions to Improve Resilience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">
              Your financial resilience is excellent! No recommendations required at this time.
            </p>
          ) : (
            recommendations.map((r, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl hover:shadow-sm transition-all"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                      {r.title}
                    </span>
                    <Badge variant={difficultyBadge[r.difficulty] as any} className="capitalize">
                      {r.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{r.summary}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{r.explanation}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
