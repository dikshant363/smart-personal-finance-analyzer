"use client";

import React, { useState, useEffect } from "react";

export default function RiskClient() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [loading, setLoading] = useState(true);

  // New policy form inputs
  const [name, setName] = useState("");
  const [carrier, setCarrier] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [category, setCategory] = useState("Life");
  const [coverageAmount, setCoverageAmount] = useState(0);
  const [premiumAmount, setPremiumAmount] = useState(0);
  const [billingFrequency, setBillingFrequency] = useState("Monthly");
  const [startDate, setStartDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchRiskData();
  }, []);

  async function fetchRiskData() {
    try {
      setLoading(true);
      const res = await fetch("/api/risk");
      const data = await res.json();
      setPolicies(data.policies || []);
      setSummary(data.summary || null);
      setAiExplanation(data.aiExplanation || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPolicy(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !carrier || coverageAmount <= 0) return;

    try {
      const res = await fetch("/api/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          carrier,
          policyNumber: policyNumber || undefined,
          category,
          coverageAmount: Number(coverageAmount),
          premiumAmount: Number(premiumAmount),
          billingFrequency,
          startDate: startDate || undefined,
          expirationDate: expirationDate || undefined,
          beneficiaries: beneficiaries || undefined,
          notes: notes || undefined,
        }),
      });

      if (res.ok) {
        setName("");
        setCarrier("");
        setPolicyNumber("");
        setCoverageAmount(0);
        setPremiumAmount(0);
        setStartDate("");
        setExpirationDate("");
        setBeneficiaries("");
        setNotes("");
        fetchRiskData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeletePolicy(id: string) {
    try {
      const res = await fetch(`/api/risk/${id}`, { method: "DELETE" });
      if (res.ok) fetchRiskData();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500 animate-pulse text-lg">Evaluating financial vulnerability indices...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main ledger and metrics */}
      <div className="lg:col-span-2 space-y-8">
        {/* Recommended vs Actual visual cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Life Insurance Gap</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-400">Actual: ${summary.lifeInsuranceActual.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Rec: ${summary.lifeInsuranceRecommended.toLocaleString()}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  summary.lifeInsuranceGap === 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {summary.lifeInsuranceGap === 0 ? "Protected" : `Gap: $${summary.lifeInsuranceGap.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Income Protection (LTD)</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-400">Actual: ${summary.disabilityActual.toLocaleString()}/mo</p>
                  <p className="text-xs text-slate-400">Rec: ${summary.disabilityRecommended.toLocaleString()}/mo</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  summary.disabilityGap === 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {summary.disabilityGap === 0 ? "Protected" : `Gap: $${summary.disabilityGap.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Emergency Fund Reserves</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-400">Actual: ${summary.emergencyFundActual.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Rec: ${summary.emergencyFundRecommended.toLocaleString()}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  summary.emergencyFundGap === 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {summary.emergencyFundGap === 0 ? "Protected" : `Gap: $${summary.emergencyFundGap.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Policies Ledger */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Insurance Policies Ledger</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 font-semibold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3">Policy Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Premium Details</th>
                  <th className="px-6 py-3 text-right">Coverage Value</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                {policies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No protection policy logs registered. Create a policy below.
                    </td>
                  </tr>
                ) : (
                  policies.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        <p>{p.name}</p>
                        <span className="text-[10px] text-slate-400 font-normal">{p.carrier} | {p.policyNumber || "No No."}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{p.category}</td>
                      <td className="px-6 py-4">
                        ${p.premiumAmount.toLocaleString()} / {p.billingFrequency.toLowerCase()}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-slate-100">
                        ${p.coverageAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeletePolicy(p.id)}
                          className="text-rose-500 hover:text-rose-700 font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Policy Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-4">Add Protection Policy</h4>
          <form onSubmit={handleAddPolicy} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Policy Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Group Life"
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Carrier / Issuer</label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="MetLife"
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Policy Number</label>
              <input
                type="text"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                placeholder="ML-19409"
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
              >
                <option value="Life">Life</option>
                <option value="Health">Health</option>
                <option value="Disability">Disability</option>
                <option value="Property">Property</option>
                <option value="Liability">Liability</option>
                <option value="Auto">Auto</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Coverage Amount</label>
              <input
                type="number"
                value={coverageAmount}
                onChange={(e) => setCoverageAmount(Number(e.target.value))}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Premium Amount</label>
              <input
                type="number"
                value={premiumAmount}
                onChange={(e) => setPremiumAmount(Number(e.target.value))}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Billing Frequency</label>
              <select
                value={billingFrequency}
                onChange={(e) => setBillingFrequency(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
                <option value="One-Time">One-Time</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Beneficiary</label>
              <input
                type="text"
                value={beneficiaries}
                onChange={(e) => setBeneficiaries(e.target.value)}
                placeholder="Spouse / Children"
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex flex-col space-y-1 justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors shadow-sm"
              >
                Log Protection Policy
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sidebar explanation */}
      <div className="space-y-8">
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800/40 dark:to-indigo-950/20 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Copilot Protection Analysis</h4>
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {aiExplanation}
          </div>
        </div>
      </div>
    </div>
  );
}
