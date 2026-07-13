"use client";

import React, { useState, useEffect } from "react";

export default function TaxClient() {
  const [records, setRecords] = useState<any[]>([]);
  const [report, setReport] = useState<any | null>(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [taxYear, setTaxYear] = useState(2026);
  const [loading, setLoading] = useState(true);

  // New record form inputs
  const [jurisdiction, setJurisdiction] = useState("US-CA");
  const [type, setType] = useState("Income");
  const [category, setCategory] = useState("Employment Income");
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [documentId, setDocumentId] = useState("");

  useEffect(() => {
    fetchTaxData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxYear]);

  async function fetchTaxData() {
    try {
      setLoading(true);
      const res = await fetch(`/api/tax?taxYear=${taxYear}`);
      const data = await res.json();
      setRecords(data.records || []);
      setReport(data.report || null);
      setAiExplanation(data.aiExplanation || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddRecord(e: React.FormEvent) {
    e.preventDefault();
    if (amount <= 0) return;

    try {
      const res = await fetch("/api/tax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taxYear: Number(taxYear),
          jurisdiction,
          type,
          category,
          amount: Number(amount),
          currency,
          notes: notes || undefined,
          tags: tags || undefined,
          documentId: documentId || undefined,
        }),
      });

      if (res.ok) {
        setAmount(0);
        setNotes("");
        setTags("");
        setDocumentId("");
        fetchTaxData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500 animate-pulse text-lg">Compiling tax deduction parameters...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main content area */}
      <div className="lg:col-span-2 space-y-8">
        {/* Core summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Estimated Income</p>
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              ${report?.totalIncome.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Deductible Expenses</p>
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              ${report?.totalExpenses.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Deductible Donations</p>
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              ${report?.totalDonations.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Net Taxable Estimate</p>
            <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">
              ${report?.netTaxableIncomeEstimate.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Records list */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Tax Mapping Entries</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setTaxYear(2025)}
                className={`text-xs px-2.5 py-1 rounded-lg ${taxYear === 2025 ? "bg-slate-200 text-slate-900" : "text-slate-500"}`}
              >
                2025
              </button>
              <button
                onClick={() => setTaxYear(2026)}
                className={`text-xs px-2.5 py-1 rounded-lg ${taxYear === 2026 ? "bg-slate-200 text-slate-900" : "text-slate-500"}`}
              >
                2026
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 font-semibold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Document status</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No tax mapping entries reported for this year. Log a record below.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        {r.category}
                      </td>
                      <td className="px-6 py-4">{r.type}</td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${r.documentId ? "text-emerald-600" : "text-amber-600"}`}>
                          {r.documentId ? "✓ Linked" : "Missing Document"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-slate-100">
                        ${r.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Record Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-4">Add Tax-Relevant Record</h4>
          <form onSubmit={handleAddRecord} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Jurisdiction</label>
              <input
                type="text"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="US-CA"
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Record Type</label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setCategory(e.target.value === "Income" ? "Employment Income" : "Business Expenses");
                }}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
              >
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
                <option value="Donation">Donation</option>
                <option value="Investment">Investment</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Document ID Link (Optional)</label>
              <input
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="doc_w2_xyz"
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex flex-col space-y-1 justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors shadow-sm"
              >
                Log Tax Mapping
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sidebar checklists and AI explanations */}
      <div className="space-y-8">
        {/* AI report diagnostic advice box */}
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800/40 dark:to-indigo-950/20 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Copilot Tax Explanation</h4>
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {aiExplanation}
          </div>
        </div>

        {/* Documentation checks checklist card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Document checklist audits</h4>
          <div className="space-y-3">
            {report?.checklist.map((c: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg text-xs">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{c.category}</p>
                  <p className="text-[10px] text-slate-500">{c.recordsCount} items mapped</p>
                </div>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                  c.hasDocuments
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}>
                  {c.hasDocuments ? "Verified" : "Missing Docs"}
                </span>
              </div>
            ))}
            {report?.checklist.length === 0 && (
              <p className="text-xs text-slate-500">No categories recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
