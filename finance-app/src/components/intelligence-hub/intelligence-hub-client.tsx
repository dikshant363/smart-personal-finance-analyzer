"use client";

import { useState } from "react";
import { LEARNING_PATHS, computeRentVsBuy } from "@/lib/intelligence";

export function IntelligenceHubClient() {
  const [rentMonthly, setRentMonthly] = useState(1800);
  const [buyPrice, setBuyPrice] = useState(300000);
  const [downPayment, setDownPayment] = useState(60000);
  const [years, setYears] = useState(7);

  const simulation = computeRentVsBuy({ rentMonthly, buyPrice, downPayment, years });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Learning Paths */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
          Structured Learning Pathways
        </h2>
        <div className="space-y-6">
          {LEARNING_PATHS.map((path) => (
            <div key={path.id} className="border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0">
              <h3 className="font-medium text-slate-800 dark:text-slate-200 text-lg">
                {path.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                {path.description}
              </p>
              <div className="space-y-2">
                {path.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="h-5 w-5 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 font-semibold text-xs">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rent vs Buy Decision Framework */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
          Decision Simulator: Rent vs. Buy
        </h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Monthly Rent ($)
            </label>
            <input
              type="number"
              value={rentMonthly}
              onChange={(e) => setRentMonthly(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Purchase Price ($)
            </label>
            <input
              type="number"
              value={buyPrice}
              onChange={(e) => setBuyPrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Down Payment ($)
              </label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Duration (Years)
              </label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Cumulative Rent Cost:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">${simulation.totalRentCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Cumulative Buy Cost:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">${simulation.totalBuyCost.toLocaleString()}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-medium text-blue-600 dark:text-blue-400">
            {simulation.advice}
          </div>
        </div>
      </div>
    </div>
  );
}
