"use client";

import React, { useState, useEffect } from "react";

export default function InvestmentsClient() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [dividends, setDividends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New investment form inputs
  const [name, setName] = useState("");
  const [assetClass, setAssetClass] = useState("Stocks");
  const [ticker, setTicker] = useState("");
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [fees, setFees] = useState(0);
  const [notes, setNotes] = useState("");

  // New watchlist form inputs
  const [watchName, setWatchName] = useState("");
  const [watchTicker, setWatchTicker] = useState("");
  const [watchTargetPrice, setWatchTargetPrice] = useState(0);
  const [watchPriority, setWatchPriority] = useState("Medium");

  // New dividend inputs
  const [divInvestmentId, setDivInvestmentId] = useState("");
  const [divAmount, setDivAmount] = useState(0);
  const [divReinvestment, setDivReinvestment] = useState("Payout");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [resInv, resAn, resWatch, resDiv] = await Promise.all([
        fetch("/api/investments"),
        fetch("/api/investments/analytics"),
        fetch("/api/investments/watchlist"),
        fetch("/api/investments/dividends"),
      ]);

      const dataInv = await resInv.json();
      const dataAn = await resAn.json();
      const dataWatch = await resWatch.json();
      const dataDiv = await resDiv.json();

      setInvestments(dataInv.investments || []);
      setAnalytics(dataAn || null);
      setWatchlist(dataWatch.watchlist || []);
      setDividends(dataDiv.dividends || []);
    } catch (err) {
      console.error("Failed to load investments metrics:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddInvestment(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          assetClass,
          ticker: ticker || undefined,
          purchaseDate: new Date().toISOString(),
          purchasePrice: Number(purchasePrice),
          quantity: Number(quantity),
          currentValue: Number(currentValue),
          currency,
          fees: Number(fees),
          notes: notes || undefined,
        }),
      });

      if (res.ok) {
        setName("");
        setTicker("");
        setPurchasePrice(0);
        setQuantity(0);
        setCurrentValue(0);
        setFees(0);
        setNotes("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddWatchlist(e: React.FormEvent) {
    e.preventDefault();
    if (!watchName) return;

    try {
      const res = await fetch("/api/investments/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: watchName,
          ticker: watchTicker || undefined,
          targetPrice: Number(watchTargetPrice) || undefined,
          priority: watchPriority,
        }),
      });

      if (res.ok) {
        setWatchName("");
        setWatchTicker("");
        setWatchTargetPrice(0);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteWatch(id: string) {
    try {
      const res = await fetch(`/api/investments/watchlist?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddDividend(e: React.FormEvent) {
    e.preventDefault();
    if (!divInvestmentId || divAmount <= 0) return;

    try {
      const res = await fetch("/api/investments/dividends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investmentId: divInvestmentId,
          dividendDate: new Date().toISOString(),
          amount: Number(divAmount),
          currency: "USD",
          reinvestmentStatus: divReinvestment,
        }),
      });

      if (res.ok) {
        setDivAmount(0);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500 animate-pulse text-lg">Analyzing wealth registers...</p>
      </div>
    );
  }

  const pMetrics = analytics?.metrics || {
    totalInvested: 0,
    currentValue: 0,
    profitLoss: 0,
    absoluteReturn: 0,
    percentageReturn: 0,
    diversificationScore: 1.0,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main content grid */}
      <div className="lg:col-span-2 space-y-8">
        {/* Core aggregate metrics banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Invested</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              ${pMetrics.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Portfolio Valuation</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              ${pMetrics.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className={`p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Return (Yield %)</p>
            <p className={`mt-2 text-2xl font-bold ${pMetrics.profitLoss >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              ${pMetrics.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-medium ml-1">
                ({pMetrics.percentageReturn.toFixed(2)}%)
              </span>
            </p>
          </div>
        </div>

        {/* Investment Listings Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Holding Assets</h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full dark:bg-indigo-900/30 dark:text-indigo-300">
              HHI Diversification: {pMetrics.diversificationScore}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3">Asset</th>
                  <th className="px-6 py-3">Class</th>
                  <th className="px-6 py-3">Qty</th>
                  <th className="px-6 py-3 text-right">Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-300">
                {investments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No registered assets in portfolio. Write a new transaction below.
                    </td>
                  </tr>
                ) : (
                  investments.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{inv.name}</p>
                        {inv.ticker && <span className="text-xs text-slate-500">{inv.ticker}</span>}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                        {inv.assetClass}
                      </td>
                      <td className="px-6 py-4">{inv.quantity}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                        ${inv.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add asset form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">Add holding asset</h4>
          <form onSubmit={handleAddInvestment} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-slate-500 font-semibold uppercase">Asset Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apple Stock"
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-sm text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-slate-500 font-semibold uppercase">Asset Class</label>
              <select
                value={assetClass}
                onChange={(e) => setAssetClass(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="Stocks">Stocks</option>
                <option value="ETFs">ETFs</option>
                <option value="Mutual Funds">Mutual Funds</option>
                <option value="Bonds">Bonds</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Cryptocurrency">Cryptocurrency</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-slate-500 font-semibold uppercase">Ticker (Optional)</label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="AAPL"
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-slate-500 font-semibold uppercase">Purchase Price</label>
              <input
                type="number"
                step="any"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-sm text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-slate-500 font-semibold uppercase">Quantity</label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-sm text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-slate-500 font-semibold uppercase">Current Total Value</label>
              <input
                type="number"
                step="any"
                value={currentValue}
                onChange={(e) => setCurrentValue(Number(e.target.value))}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-sm text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-slate-500 font-semibold uppercase">Fees</label>
              <input
                type="number"
                step="any"
                value={fees}
                onChange={(e) => setFees(Number(e.target.value))}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex flex-col space-y-1 md:col-span-2 justify-end">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors shadow-sm"
              >
                Log Wealth Asset Record
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column sidebar - Watchlist, Dividends, AI */}
      <div className="space-y-8">
        {/* AI composition education analysis */}
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800/40 dark:to-indigo-950/20 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">Copilot Wealth Analysis</h4>
          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {analytics?.aiExplanation || "Create an asset listing to retrieve real-time diversification analytics."}
          </div>
        </div>

        {/* Watchlist card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">Ticker Watchlist</h4>
          <div className="space-y-2">
            {watchlist.map((w) => (
              <div key={w.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg text-sm">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{w.name}</p>
                  {w.ticker && <p className="text-xs text-slate-500">Ticker: {w.ticker}</p>}
                </div>
                <div className="flex items-center space-x-2 text-right">
                  <div>
                    {w.targetPrice && <p className="font-bold">${w.targetPrice}</p>}
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${w.priority === "High" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-700"}`}>
                      {w.priority}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteWatch(w.id)}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold pl-2"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddWatchlist} className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={watchName}
                onChange={(e) => setWatchName(e.target.value)}
                placeholder="Asset Name"
                className="w-1/2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-xs"
                required
              />
              <input
                type="text"
                value={watchTicker}
                onChange={(e) => setWatchTicker(e.target.value)}
                placeholder="Ticker"
                className="w-1/2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-xs"
              />
            </div>
            <div className="flex space-x-2">
              <input
                type="number"
                value={watchTargetPrice}
                onChange={(e) => setWatchTargetPrice(Number(e.target.value))}
                placeholder="Target Price"
                className="w-1/2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-xs"
              />
              <select
                value={watchPriority}
                onChange={(e) => setWatchPriority(e.target.value)}
                className="w-1/2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-xs"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors">
              Add Watch Ticker
            </button>
          </form>
        </div>

        {/* Dividends registry card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">Dividends Log</h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {dividends.map((d) => (
              <div key={d.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900/30 rounded text-xs">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{d.investment?.name || "Holding Asset"}</p>
                  <p className="text-[10px] text-slate-500">{new Date(d.dividendDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">+${d.amount}</p>
                  <span className="text-[9px] uppercase font-bold bg-emerald-50 text-emerald-700 px-1 rounded">
                    {d.reinvestmentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddDividend} className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
            <select
              value={divInvestmentId}
              onChange={(e) => setDivInvestmentId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-xs"
              required
            >
              <option value="">Select Asset...</option>
              {investments.map((inv) => (
                <option key={inv.id} value={inv.id}>{inv.name}</option>
              ))}
            </select>
            <div className="flex space-x-2">
              <input
                type="number"
                value={divAmount}
                onChange={(e) => setDivAmount(Number(e.target.value))}
                placeholder="Dividend Amount"
                className="w-1/2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-xs"
                required
              />
              <select
                value={divReinvestment}
                onChange={(e) => setDivReinvestment(e.target.value)}
                className="w-1/2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-xs"
              >
                <option value="Payout">Payout</option>
                <option value="Reinvested">Reinvested</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors">
              Record Dividend payout
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
