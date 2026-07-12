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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  PieChart as PieIcon,
  LineChart as LineIcon,
  ShieldAlert,
  Lightbulb,
} from "lucide-react";

type Asset = {
  id: string;
  name: string;
  type: string;
  currentValue: any;
  purchaseValue: any;
  purchaseDate: string | Date;
  appreciationRate: any;
  currency: string;
  ownership: string;
  notes: string | null;
};

type Summary = {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
};

type Allocation = {
  type: string;
  totalValue: number;
  percentage: number;
};

type Projection = {
  month: string;
  projectedAssets: number;
  projectedLiabilities: number;
  projectedNetWorth: number;
};

export function NetWorthClient({
  initialSummary,
  initialAllocation,
  initialProjection,
  initialAssets,
  currency,
}: {
  initialSummary: Summary;
  initialAllocation: Allocation[];
  initialProjection: Projection[];
  initialAssets: Asset[];
  currency: string;
}) {
  const router = useRouter();
  const [summary, setSummary] = React.useState<Summary>(initialSummary);
  const [allocation, setAllocation] = React.useState<Allocation[]>(initialAllocation);
  const [projection, setProjection] = React.useState<Projection[]>(initialProjection);
  const [assets, setAssets] = React.useState<Asset[]>(initialAssets);
  
  const [isAdding, setIsAdding] = React.useState(false);

  // Form State
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("SavingsAccount");
  const [currentValue, setCurrentValue] = React.useState(0);
  const [purchaseValue, setPurchaseValue] = React.useState(0);
  const [purchaseDate, setPurchaseDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [appreciationRate, setAppreciationRate] = React.useState(2.0);
  const [ownership, setOwnership] = React.useState("100");
  const [notes, setNotes] = React.useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        currentValue,
        purchaseValue,
        purchaseDate,
        appreciationRate,
        ownership,
        notes,
      }),
    });

    if (res.ok) {
      setIsAdding(false);
      resetForm();
      refreshData();
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
    if (res.ok) {
      refreshData();
    }
  }

  async function refreshData() {
    const [netRes, assetsRes] = await Promise.all([
      fetch("/api/assets/net-worth"),
      fetch("/api/assets"),
    ]);

    const netData = await netRes.json();
    const assetsData = await assetsRes.json();

    setSummary(netData.summary ?? { totalAssets: 0, totalLiabilities: 0, netWorth: 0 });
    setAllocation(netData.allocation ?? []);
    setProjection(netData.projection ?? []);
    setAssets(assetsData.assets ?? []);
    router.refresh();
  }

  function resetForm() {
    setName("");
    setType("SavingsAccount");
    setCurrentValue(0);
    setPurchaseValue(0);
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setAppreciationRate(2.0);
    setOwnership("100");
    setNotes("");
  }

  // AI Insights Generation client-side helper
  const primaryAlloc = allocation[0];
  const isHighRisk = primaryAlloc && primaryAlloc.percentage > 50;

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-neutral-900 dark:to-neutral-950 border-indigo-100 dark:border-neutral-800">
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Total Net Worth</span>
          </CardHeader>
          <CardContent>
            <h2 className="text-3xl font-extrabold text-indigo-950 dark:text-white">
              {formatMoney(summary.netWorth, currency)}
            </h2>
            <p className="text-[10px] text-neutral-400 mt-1">Assets minus Liabilities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-bold text-green-600">Total Asset Portfolio</span>
          </CardHeader>
          <CardContent>
            <h2 className="text-3xl font-extrabold text-neutral-800 dark:text-white">
              {formatMoney(summary.totalAssets, currency)}
            </h2>
            <p className="text-[10px] text-neutral-400 mt-1">Sum of cash, holdings & property</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase font-bold text-red-500">Active Liabilities</span>
          </CardHeader>
          <CardContent>
            <h2 className="text-3xl font-extrabold text-neutral-800 dark:text-white">
              {formatMoney(summary.totalLiabilities, currency)}
            </h2>
            <p className="text-[10px] text-neutral-400 mt-1">Debts, loans & card balances</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: assets list */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Registered Assets</CardTitle>
              <Button
                size="sm"
                onClick={() => setIsAdding(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Asset
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex justify-between items-center p-3 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{asset.name}</span>
                      <Badge variant="info" className="text-[8px] px-1 py-0 uppercase">
                        {asset.type}
                      </Badge>
                      <span className="text-[9px] text-neutral-400">{asset.ownership}% Ownership</span>
                    </div>
                    <p className="text-[10px] text-neutral-400">
                      Growth Appreciation: {asset.appreciationRate}%/yr | Notes: {asset.notes || "None"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="font-bold text-xs block text-neutral-800 dark:text-neutral-200">
                        {formatMoney(parseFloat(asset.currentValue), currency)}
                      </span>
                      <span className="text-[9px] text-neutral-400 block">
                        Cost: {formatMoney(parseFloat(asset.purchaseValue), currency)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-500 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Sell/Remove asset"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Projection chart */}
          {projection.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <LineIcon className="h-4 w-4 text-indigo-500" /> 12-Month Net Worth Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projection} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-100 dark:stroke-neutral-800" />
                      <XAxis dataKey="month" className="text-[10px] fill-neutral-400" />
                      <YAxis className="text-[10px] fill-neutral-400" />
                      <Tooltip contentStyle={{ fontSize: "11px" }} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Line type="monotone" dataKey="projectedNetWorth" stroke="#4f46e5" strokeWidth={2.5} name="Simulated Net Worth" />
                      <Line type="monotone" dataKey="projectedAssets" stroke="#10b981" strokeWidth={1.5} name="Assets Path" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: allocation pie & AI insights */}
        <div className="space-y-6">
          {/* Allocation */}
          {allocation.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <PieIcon className="h-4 w-4 text-indigo-500" /> Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="totalValue"
                        nameKey="type"
                      >
                        {allocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatMoney(Number(value), currency)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full text-xs space-y-2 mt-2">
                  {allocation.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-neutral-500 uppercase font-semibold text-[10px]">{item.type}</span>
                      </div>
                      <span className="font-bold text-neutral-800 dark:text-white">
                        {item.percentage}% ({formatMoney(item.totalValue, currency)})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Insights Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-amber-500" /> Portfolio Diversification AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-4">
              <div className={cn(
                "p-3 rounded-lg border flex items-start gap-2.5 leading-relaxed",
                isHighRisk
                  ? "bg-red-50/50 border-red-100 text-red-800 dark:bg-red-950/20 dark:border-red-950/30 dark:text-red-300"
                  : "bg-green-50/50 border-green-100 text-green-800 dark:bg-green-950/20 dark:border-green-950/30 dark:text-green-300"
              )}>
                {isHighRisk ? (
                  <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold uppercase text-[9px] block mb-1">
                    Risk Classification: {isHighRisk ? "High Exposure" : "Balanced exposure"}
                  </span>
                  <p className="text-[10px] text-neutral-600 dark:text-neutral-400">
                    {isHighRisk
                      ? `Over 50% of your holdings is clustered in '${primaryAlloc.type}'. Sector corrections will deeply strain your Net Worth status.`
                      : "Your portfolio shows healthy diversification across checking accounts, mutual funds, and cash holds. Structural risks are low."}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-neutral-400 block text-[9px] uppercase tracking-wider">Strategic Recommendations</span>
                <ul className="list-disc pl-4 text-neutral-500 space-y-1 text-[10px]">
                  {isHighRisk ? (
                    <>
                      <li>Transfer margins from checking to balanced equity index index trackers.</li>
                      <li>Consult premium assets classes like gold to stabilize appreciation rates.</li>
                    </>
                  ) : (
                    <>
                      <li>Reinvest compound margins monthly into high interest mutual fund portfolios.</li>
                      <li>Review allocations every 90 days.</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Dialog */}
      {isAdding && (
        <Dialog open={isAdding} onClose={() => setIsAdding(false)} title="Register New Asset">
          <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Asset Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Gold coins or Chase Checking" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Asset Type</label>
                <Select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="Cash">Liquid Cash</option>
                  <option value="SavingsAccount">Savings Account</option>
                  <option value="CheckingAccount">Checking Account</option>
                  <option value="FixedDeposit">Fixed Deposit</option>
                  <option value="Gold">Physical Gold</option>
                  <option value="RealEstate">Real Estate Property</option>
                  <option value="Vehicle">Vehicle Valuation</option>
                  <option value="Stock">Direct Stocks</option>
                  <option value="MutualFund">Mutual Funds / ETFs</option>
                  <option value="Crypto">Cryptocurrency Portfolio</option>
                  <option value="Custom">Custom Asset type</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Current Valuation</label>
                <Input type="number" value={currentValue} onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)} required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Purchase Cost</label>
                <Input type="number" value={purchaseValue} onChange={(e) => setPurchaseValue(parseFloat(e.target.value) || 0)} required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Purchase Date</label>
                <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Appreciation Rate (% per year)</label>
                <Input type="number" step="0.01" value={appreciationRate} onChange={(e) => setAppreciationRate(parseFloat(e.target.value) || 0)} required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Ownership Share (%)</label>
                <Input type="number" min="1" max="100" value={ownership} onChange={(e) => setOwnership(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                placeholder="Institutional information or references..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Add to Balance Sheet</Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
