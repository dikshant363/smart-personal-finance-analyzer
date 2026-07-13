"use client";

import React, { useState, useEffect } from "react";

export default function RetirementClient() {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedDetails, setSelectedDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // New retirement plan form inputs
  const [name, setName] = useState("");
  const [profileType, setProfileType] = useState("Traditional");
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [expectedExpenses, setExpectedExpenses] = useState(3000);
  const [expectedReturn, setExpectedReturn] = useState(0.07);
  const [expectedInflation, setExpectedInflation] = useState(0.025);
  const [withdrawalStrategy, setWithdrawalStrategy] = useState("Safe Withdrawal (4%)");
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPlanId) {
      fetchPlanDetails(selectedPlanId);
    } else {
      setSelectedDetails(null);
    }
  }, [selectedPlanId]);

  async function fetchPlans() {
    try {
      setLoading(true);
      const res = await fetch("/api/retirement");
      const data = await res.json();
      setPlans(data.plans || []);
      if (data.plans?.length > 0 && !selectedPlanId) {
        setSelectedPlanId(data.plans[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlanDetails(id: string) {
    try {
      const res = await fetch(`/api/retirement/${id}`);
      const data = await res.json();
      setSelectedDetails(data || null);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await fetch("/api/retirement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          profileType,
          currentAge: Number(currentAge),
          retirementAge: Number(retirementAge),
          lifeExpectancy: Number(lifeExpectancy),
          currentSavings: Number(currentSavings),
          monthlyContribution: Number(monthlyContribution),
          expectedExpenses: Number(expectedExpenses),
          expectedReturn: Number(expectedReturn),
          expectedInflation: Number(expectedInflation),
          withdrawalStrategy,
          currency,
        }),
      });

      if (res.ok) {
        setName("");
        const data = await res.json();
        await fetchPlans();
        setSelectedPlanId(data.plan.id);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeletePlan(id: string) {
    try {
      const res = await fetch(`/api/retirement/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSelectedPlanId("");
        fetchPlans();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500 animate-pulse text-lg">Simulating long term compound interest vectors...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar - Plan Selection and Add Form */}
      <div className="space-y-8">
        {/* Plan Selector */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">Select Retirement Scenario</h4>
          <div className="flex flex-col space-y-2">
            {plans.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPlanId === p.id
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/30"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{p.profileType} Profile</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlan(p.id);
                    }}
                    className="text-slate-400 hover:text-rose-600 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {plans.length === 0 && (
              <p className="text-xs text-slate-500">No retirement scenarios registered. Create one below.</p>
            )}
          </div>
        </div>

        {/* Add Plan Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">New Scenario Settings</h4>
          <form onSubmit={handleAddPlan} className="space-y-3 text-xs">
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Plan Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Early Retirement"
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col space-y-1">
                <label className="text-slate-500 font-semibold uppercase">Profile Type</label>
                <select
                  value={profileType}
                  onChange={(e) => setProfileType(e.target.value)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="Traditional">Traditional</option>
                  <option value="Early">Early</option>
                  <option value="Semi">Semi</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-slate-500 font-semibold uppercase">Current Age</label>
                <input
                  type="number"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col space-y-1">
                <label className="text-slate-500 font-semibold uppercase">Retirement Age</label>
                <input
                  type="number"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(Number(e.target.value))}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-slate-500 font-semibold uppercase">Life Expectancy</label>
                <input
                  type="number"
                  value={lifeExpectancy}
                  onChange={(e) => setLifeExpectancy(Number(e.target.value))}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col space-y-1">
                <label className="text-slate-500 font-semibold uppercase">Savings</label>
                <input
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(Number(e.target.value))}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-slate-500 font-semibold uppercase">Monthly Contribution</label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Expected Monthly Expenses</label>
              <input
                type="number"
                value={expectedExpenses}
                onChange={(e) => setExpectedExpenses(Number(e.target.value))}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col space-y-1">
                <label className="text-slate-500 font-semibold uppercase">Expected Return (e.g. 0.07)</label>
                <input
                  type="number"
                  step="0.001"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-slate-500 font-semibold uppercase">Inflation (e.g. 0.02)</label>
                <input
                  type="number"
                  step="0.001"
                  value={expectedInflation}
                  onChange={(e) => setExpectedInflation(Number(e.target.value))}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Model Scenario
            </button>
          </form>
        </div>
      </div>

      {/* Main calculation details and projection logs */}
      <div className="lg:col-span-2 space-y-8">
        {selectedDetails ? (
          <>
            {/* Quick Metrics Header */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Projected Nest Egg</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                  ${selectedDetails.metrics.projectedNestEgg.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Target (25x Expenses)</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                  ${(selectedDetails.metrics.annualExpensesAtRetirement * 25).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Withdrawal Span</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedDetails.metrics.withdrawalDurationYears} Years
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Target Status</p>
                <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                  selectedDetails.metrics.isFundingSufficient
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                }`}>
                  {selectedDetails.metrics.isFundingSufficient ? "Sufficient" : "Gap Deficit"}
                </span>
              </div>
            </div>

            {/* AI Advisor Guidance box */}
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800/40 dark:to-indigo-950/20 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-sm">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3">AI Retirement Diagnostic Analysis</h4>
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedDetails.aiExplanation}
              </div>
            </div>

            {/* Projection trajectory grid */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Compounding Trajectory Ledger</h4>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/40 text-[10px] font-semibold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-6 py-3">Age</th>
                      <th className="px-6 py-3">Year</th>
                      <th className="px-6 py-3 text-right">Contributions</th>
                      <th className="px-6 py-3 text-right">Simulated Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs text-slate-700 dark:text-slate-300">
                    {selectedDetails.trajectory.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="px-6 py-3 font-semibold">{p.age}</td>
                        <td className="px-6 py-3">{p.year}</td>
                        <td className="px-6 py-3 text-right">${p.contribution.toLocaleString()}</td>
                        <td className="px-6 py-3 text-right font-bold text-slate-900 dark:text-slate-100">
                          ${p.savings.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-64">
            <p className="text-slate-500 text-sm">Select or create a scenario on the left panel to begin projections.</p>
          </div>
        )}
      </div>
    </div>
  );
}
