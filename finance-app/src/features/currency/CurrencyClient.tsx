"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowRightLeft,
  Plus,
  RefreshCw,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

type Allocation = {
  currency: string;
  totalValueBase: number;
  percentage: number;
};

type ExchangeRate = {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: any;
  date: string | Date;
  source: string;
};

export function CurrencyClient({
  initialAllocation,
  initialRates,
  baseCurrency,
}: {
  initialAllocation: Allocation[];
  initialRates: ExchangeRate[];
  baseCurrency: string;
}) {
  const router = useRouter();
  const [allocation, setAllocation] = React.useState<Allocation[]>(initialAllocation);
  const [rates, setRates] = React.useState<ExchangeRate[]>(initialRates);

  // FX Calculator State
  const [calcAmount, setCalcAmount] = React.useState(100);
  const [calcFrom, setCalcFrom] = React.useState("EUR");
  const [calcTo, setCalcTo] = React.useState("USD");
  const [calcResult, setCalcResult] = React.useState<number | null>(null);

  // Form State
  const [fromCurrency, setFromCurrency] = React.useState("EUR");
  const [toCurrency, setToCurrency] = React.useState("USD");
  const [rate, setRate] = React.useState(1.08);

  const RATES_MAP: Record<string, number> = {
    EUR_USD: 1.08,
    GBP_USD: 1.27,
    INR_USD: 0.012,
    USD_USD: 1.0,
    USD_EUR: 1 / 1.08,
    USD_GBP: 1 / 1.27,
    USD_INR: 1 / 0.012,
  };

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    const key = `${calcFrom}_${calcTo}`;
    let conversionRate = RATES_MAP[key];

    if (!conversionRate) {
      // Bridge via USD
      const r1 = RATES_MAP[`${calcFrom}_USD`] || 1;
      const r2 = RATES_MAP[`USD_${calcTo}`] || 1;
      conversionRate = r1 * r2;
    }

    setCalcResult(calcAmount * conversionRate);
  }

  async function handleAddRate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/currency/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromCurrency, toCurrency, rate }),
    });

    if (res.ok) {
      setRate(1.0);
      refreshData();
    }
  }

  async function refreshData() {
    const [allocRes, ratesRes] = await Promise.all([
      fetch("/api/currency/allocation"),
      fetch("/api/currency/rates"),
    ]);

    const allocData = await allocRes.json();
    const ratesData = await ratesRes.json();

    setAllocation(allocData.allocation ?? []);
    setRates(ratesData.rates ?? []);
    router.refresh();
  }

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-6">
      {/* Overview components */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: FX calculator & Add rate form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <ArrowRightLeft className="h-4 w-4 text-indigo-500" /> Real-time FX Converter Desk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculate} className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">Convert Amount</label>
                    <Input type="number" value={calcAmount} onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">From Currency</label>
                    <Select value={calcFrom} onChange={(e) => setCalcFrom(e.target.value)}>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">To Currency</label>
                    <Select value={calcTo} onChange={(e) => setCalcTo(e.target.value)}>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  {calcResult !== null ? (
                    <div className="text-sm font-bold text-neutral-800 dark:text-white">
                      Result: {calcAmount} {calcFrom} ={" "}
                      <span className="text-indigo-600">
                        {calcResult.toFixed(2)} {calcTo}
                      </span>
                    </div>
                  ) : (
                    <span />
                  )}
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Convert
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Add rate card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Log Exchange Rate Override Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddRate} className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">Source Currency</label>
                    <Input value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value.toUpperCase())} required maxLength={3} />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">Target Currency</label>
                    <Input value={toCurrency} onChange={(e) => setToCurrency(e.target.value.toUpperCase())} required maxLength={3} />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">Conversion Rate</label>
                    <Input type="number" step="0.000001" value={rate} onChange={(e) => setRate(parseFloat(e.target.value) || 0)} required />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> Save Override
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column: allocations pie & rate history */}
        <div className="space-y-6">
          {/* Allocation */}
          {allocation.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Exposures Allocation</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="totalValueBase"
                        nameKey="currency"
                      >
                        {allocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip formatter={(value) => formatMoney(Number(value), baseCurrency)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full text-xs space-y-2 mt-2">
                  {allocation.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-neutral-500 uppercase font-semibold text-[10px]">{item.currency}</span>
                      </div>
                      <span className="font-bold text-neutral-800 dark:text-white">
                        {item.percentage}% ({formatMoney(item.totalValueBase, baseCurrency)})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rates History list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Exchange Rates Log</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto space-y-2.5 text-xs">
              {rates.map((r) => (
                <div
                  key={r.id}
                  className="p-2 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-between items-center"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      1 {r.fromCurrency} = {parseFloat(r.rate).toFixed(4)} {r.toCurrency}
                    </span>
                    <span className="text-[9px] text-neutral-400 block">
                      Source: {r.source} | {new Date(r.date).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant="default" className="text-[8px] bg-indigo-50 text-indigo-600 dark:bg-neutral-800 dark:text-indigo-400">
                    Active
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
