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
  TrendingDown,
  AlertTriangle,
  Plus,
  Trash2,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

type Liability = {
  id: string;
  name: string;
  type: string;
  originalAmount: any;
  outstandingBalance: any;
  interestRate: any;
  lender: string;
  emiAmount: any;
  repaymentFrequency: string;
  nextDueDate: string | Date;
  startDate: string | Date;
  endDate: string | Date;
  notes: string | null;
  status: string;
};

type Overview = {
  totalDebt: number;
  monthlyEmiTotal: number;
  debtToIncomeRatio: number;
  remainingPayments: number;
  projectedPayoffMonths: number;
};

type StrategySim = {
  strategy: string;
  payoffMonths: number;
  totalInterestPaid: number;
  interestSaved: number;
  timeSavedMonths: number;
};

type Strategies = {
  avalanche: StrategySim;
  snowball: StrategySim;
  equal: StrategySim;
};

export function DebtClient({
  initialOverview,
  initialHealthScore,
  initialStrategies,
  initialLiabilities,
  currency,
}: {
  initialOverview: Overview;
  initialHealthScore: number;
  initialStrategies: Strategies;
  initialLiabilities: Liability[];
  currency: string;
}) {
  const router = useRouter();
  const [overview, setOverview] = React.useState<Overview>(initialOverview);
  const [healthScore, setHealthScore] = React.useState<number>(initialHealthScore);
  const [strategies, setStrategies] = React.useState<Strategies>(initialStrategies);
  const [liabilities, setLiabilities] = React.useState<Liability[]>(initialLiabilities);
  
  const [isAdding, setIsAdding] = React.useState(false);
  const [extraRepayment, setExtraRepayment] = React.useState(200);

  // Form State
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("CreditCard");
  const [originalAmount, setOriginalAmount] = React.useState(0);
  const [outstandingBalance, setOutstandingBalance] = React.useState(0);
  const [interestRate, setInterestRate] = React.useState(12.0);
  const [lender, setLender] = React.useState("");
  const [emiAmount, setEmiAmount] = React.useState(0);
  const [repaymentFrequency, setRepaymentFrequency] = React.useState("Monthly");
  const [nextDueDate, setNextDueDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [startDate, setStartDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = React.useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/liabilities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        originalAmount,
        outstandingBalance,
        interestRate,
        lender,
        emiAmount,
        repaymentFrequency,
        nextDueDate,
        startDate,
        endDate,
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
    const res = await fetch(`/api/liabilities/${id}`, { method: "DELETE" });
    if (res.ok) {
      refreshData();
    }
  }

  async function refreshData() {
    const [simRes, liabsRes] = await Promise.all([
      fetch(`/api/liabilities/simulate?extra=${extraRepayment}`),
      fetch("/api/liabilities"),
    ]);

    const simData = await simRes.json();
    const liabsData = await liabsRes.json();

    setOverview(simData.overview ?? { totalDebt: 0, monthlyEmiTotal: 0, debtToIncomeRatio: 0, remainingPayments: 0, projectedPayoffMonths: 0 });
    setHealthScore(simData.healthScore ?? 100);
    setStrategies(simData.strategies ?? initialStrategies);
    setLiabilities(liabsData.liabilities ?? []);
    router.refresh();
  }

  React.useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraRepayment]);

  function resetForm() {
    setName("");
    setType("CreditCard");
    setOriginalAmount(0);
    setOutstandingBalance(0);
    setInterestRate(12.0);
    setLender("");
    setEmiAmount(0);
    setRepaymentFrequency("Monthly");
    setNextDueDate(new Date().toISOString().split("T")[0]);
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  }

  return (
    <div className="space-y-6">
      {/* Overview stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-red-50 to-white dark:from-neutral-900 dark:to-neutral-950 border-red-100 dark:border-neutral-800">
          <CardHeader className="pb-1.5">
            <span className="text-[10px] uppercase font-bold text-red-600">Total Outstanding Debt</span>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-extrabold text-red-950 dark:text-white">
              {formatMoney(overview.totalDebt, currency)}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1.5">
            <span className="text-[10px] uppercase font-bold text-neutral-400">Monthly Emi Total</span>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-extrabold text-neutral-800 dark:text-white">
              {formatMoney(overview.monthlyEmiTotal, currency)}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1.5">
            <span className="text-[10px] uppercase font-bold text-neutral-400">Debt-to-Income Ratio</span>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-extrabold text-neutral-800 dark:text-white">
              {overview.debtToIncomeRatio}%
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1.5">
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Debt Health Score</span>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {healthScore}/100
            </h2>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: strategy simulation compare panels */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Repayment Strategy Accelerator Simulator</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400">Extra Monthly Repayment:</span>
                <input
                  type="number"
                  value={extraRepayment}
                  onChange={(e) => setExtraRepayment(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded text-xs border bg-transparent dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {/* Avalanche */}
              <div className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl space-y-2 text-xs relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-xl" />
                <span className="font-bold text-neutral-800 dark:text-neutral-200">Avalanche</span>
                <p className="text-[10px] text-neutral-400 leading-normal">Focuses extra repayment on highest interest rates first.</p>
                <div className="pt-2 space-y-1">
                  <p>Payoff: <strong>{strategies.avalanche.payoffMonths} months</strong></p>
                  <p className="text-green-600">Saved Interest: <strong>{formatMoney(strategies.avalanche.interestSaved, currency)}</strong></p>
                  <p className="text-indigo-600">Time Saved: <strong>{strategies.avalanche.timeSavedMonths} months</strong></p>
                </div>
              </div>

              {/* Snowball */}
              <div className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl space-y-2 text-xs relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 rounded-t-xl" />
                <span className="font-bold text-neutral-800 dark:text-neutral-200">Snowball</span>
                <p className="text-[10px] text-neutral-400 leading-normal">Focuses extra repayment on smallest balances first.</p>
                <div className="pt-2 space-y-1">
                  <p>Payoff: <strong>{strategies.snowball.payoffMonths} months</strong></p>
                  <p className="text-green-600">Saved Interest: <strong>{formatMoney(strategies.snowball.interestSaved, currency)}</strong></p>
                  <p className="text-indigo-600">Time Saved: <strong>{strategies.snowball.timeSavedMonths} months</strong></p>
                </div>
              </div>

              {/* Equal */}
              <div className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl space-y-2 text-xs relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 rounded-t-xl" />
                <span className="font-bold text-neutral-800 dark:text-neutral-200">Equal Distribution</span>
                <p className="text-[10px] text-neutral-400 leading-normal">Distributes extra payment equally across all active debts.</p>
                <div className="pt-2 space-y-1">
                  <p>Payoff: <strong>{strategies.equal.payoffMonths} months</strong></p>
                  <p className="text-green-600">Saved Interest: <strong>{formatMoney(strategies.equal.interestSaved, currency)}</strong></p>
                  <p className="text-indigo-600">Time Saved: <strong>{strategies.equal.timeSavedMonths} months</strong></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active debts list */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Debt & Liability Accounts</CardTitle>
              <Button
                size="sm"
                onClick={() => setIsAdding(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Debt Account
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {liabilities.map((d) => {
                const isHighInterest = parseFloat(d.interestRate) >= 15;
                return (
                  <div
                    key={d.id}
                    className="flex justify-between items-center p-3 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{d.name}</span>
                        <Badge variant="danger" className="text-[8px] px-1 py-0 uppercase">
                          {d.type}
                        </Badge>
                        <span className="text-[9px] text-neutral-400">Lender: {d.lender}</span>
                        {isHighInterest && (
                          <Badge variant="danger" className="text-[8px] px-1 py-0 border-none bg-red-100 text-red-700 font-bold uppercase">
                            <AlertTriangle className="h-2 w-2 mr-0.5 inline" /> High Interest
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        Interest Rate: {d.interestRate}%/yr | Monthly EMI: {formatMoney(parseFloat(d.emiAmount), currency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="font-bold text-xs block text-red-600">
                          {formatMoney(parseFloat(d.outstandingBalance), currency)}
                        </span>
                        <span className="text-[9px] text-neutral-400 block">
                          Original: {formatMoney(parseFloat(d.originalAmount), currency)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Close account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right column: AI Debt Advice check panels */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-indigo-500" /> Debt Analysis & Advice
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-4">
              <div className="bg-indigo-50/50 dark:bg-neutral-900/50 border p-3 rounded-lg flex gap-2.5 leading-relaxed">
                <CheckCircle className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase text-[9px] block mb-1">Repayment Advisory</span>
                  <p className="text-[10px] text-neutral-600 dark:text-neutral-400">{strategies.avalanche.interestSaved > 0 ? `We suggest adopting the Avalanche strategy. By allocating an extra ${extraRepayment}/mo to your highest interest items, you'll save ${formatMoney(strategies.avalanche.interestSaved, currency)} and pay off your debts ${strategies.avalanche.timeSavedMonths} months sooner!` : "Your debt overhead is minimal. Keep up standard repayment terms."}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-neutral-400 block text-[9px] uppercase tracking-wider">AI Warnings Checklist</span>
                <ul className="list-disc pl-4 text-neutral-500 space-y-1 text-[10px]">
                  <li>Debt Health rating stands at {healthScore}/100.</li>
                  {overview.debtToIncomeRatio > 35 ? (
                    <li className="text-red-500 font-semibold">Warning: Debt-to-income ratio exceeds 35% threshold limit.</li>
                  ) : (
                    <li>Debt service ratios are within comfortable margins.</li>
                  )}
                  {liabilities.some((d) => parseFloat(d.interestRate) >= 15) && (
                    <li className="text-red-500 font-semibold">Alert: Credit card items with high interest rates detected. Pay off immediately.</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Dialog */}
      {isAdding && (
        <Dialog open={isAdding} onClose={() => setIsAdding(false)} title="Register New Debt Account">
          <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Liability Account Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Student Loan or Visa Card" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Liability Type</label>
                <Select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="CreditCard">Credit Card</option>
                  <option value="PersonalLoan">Personal Loan</option>
                  <option value="HomeLoan">Home Loan</option>
                  <option value="VehicleLoan">Vehicle Loan</option>
                  <option value="EducationLoan">Education Loan</option>
                  <option value="Mortgage">Mortgage</option>
                  <option value="BNPL">BNPL (Buy Now Pay Later)</option>
                  <option value="Custom">Custom Debt</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Original Loan Principal</label>
                <Input type="number" value={originalAmount} onChange={(e) => setOriginalAmount(parseFloat(e.target.value) || 0)} required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Current Outstanding Balance</label>
                <Input type="number" value={outstandingBalance} onChange={(e) => setOutstandingBalance(parseFloat(e.target.value) || 0)} required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Interest Rate (% per year)</label>
                <Input type="number" step="0.01" value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)} required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t pt-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Lender/Institution</label>
                <Input value={lender} onChange={(e) => setLender(e.target.value)} required placeholder="Chase, Federal Loans..." />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Monthly EMI Payment</label>
                <Input type="number" value={emiAmount} onChange={(e) => setEmiAmount(parseFloat(e.target.value) || 0)} required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Repayment Frequency</label>
                <Select value={repaymentFrequency} onChange={(e) => setRepaymentFrequency(e.target.value)}>
                  <option value="Monthly">Monthly</option>
                  <option value="Biweekly">Biweekly</option>
                  <option value="Weekly">Weekly</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t pt-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Next Payment Due Date</label>
                <Input type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Expected End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setNextDueDate(e.target.value)} required />
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
              <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Add Loan/Card Account</Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
