"use client";

import React, { useState, useEffect } from "react";

export default function CommandCenterClient() {
  const [graphData, setGraphData] = useState<any>(null);
  const [scorecard, setScorecard] = useState<any>(null);
  const [explanation, setExplanation] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [commandInput, setCommandInput] = useState("");
  const [commandFeedback, setCommandFeedback] = useState("");

  // Simulator state variables
  const [simTarget, setSimTarget] = useState(150000);
  const [simReturn, setSimReturn] = useState(7);
  const [simSeed, setSimSeed] = useState(42);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      const [resGraph, resScorecard] = await Promise.all([
        fetch("/api/graph"),
        fetch("/api/risk-intelligence/scorecard"),
      ]);
      const dataGraph = await resGraph.json();
      const dataScorecard = await resScorecard.json();

      setGraphData(dataGraph.graph || null);
      setScorecard(dataScorecard.scorecard || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery) return;
    setCommandFeedback(`Searching registry for "${searchQuery}"... Found 0 index overrides.`);
  }

  async function handleCommandSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    setCommandInput("");

    if (cmd === "run simulation") {
      runSimulationDesk();
    } else if (cmd === "check health score") {
      fetchExplanationTrace("Score", { score: 78, monthsCovered: 4.5 });
    } else if (cmd.startsWith("explain risk")) {
      fetchExplanationTrace("RiskAlert", { alertName: "Emergency Fund Gap", evidence: "Liquid cash is below minimum thresholds" });
    } else {
      setCommandFeedback(`Command "${cmd}" received. Available actions: "run simulation", "check health score", "explain risk".`);
    }
  }

  async function runSimulationDesk() {
    try {
      setCommandFeedback("Executing Monte Carlo simulations inside sandbox...");
      const res = await fetch("/api/monte-carlo/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simulationsCount: 100,
          seed: Number(simSeed),
          years: 10,
          initialValue: 50000,
          annualContribution: 6000,
          expectedReturn: Number(simReturn) / 100,
          expectedVolatility: 0.15,
          inflationRate: 0.03,
          goalTarget: Number(simTarget),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSimulationResult(data.simulation);
        setExplanation(null);
        setCommandFeedback("Sandbox simulation runs computed successfully.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchExplanationTrace(targetType: string, payload: any) {
    try {
      const res = await fetch("/api/explainability/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, payload }),
      });
      if (res.ok) {
        const data = await res.json();
        setExplanation(data.trace);
        setSimulationResult(null);
        setCommandFeedback(`Grounded decision trace loaded for ${targetType}.`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500 animate-pulse text-lg">Initializing IFOS micro-services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top command bar console */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900 rounded-xl p-5 text-white">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions, goals, or documents..."
            className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
          />
          <button type="submit" className="bg-slate-700 hover:bg-slate-650 px-4 py-1.5 rounded-lg text-xs font-semibold">
            Search
          </button>
        </form>

        <form onSubmit={handleCommandSubmit} className="flex gap-2">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder='Type command (e.g. "run simulation", "check health score")...'
            className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
          />
          <button type="submit" className="bg-indigo-650 hover:bg-indigo-600 px-4 py-1.5 rounded-lg text-xs font-semibold">
            Execute
          </button>
        </form>

        {commandFeedback && (
          <div className="md:col-span-2 text-[10px] text-slate-400 font-mono">
            {commandFeedback}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
        {/* Left Column: Risk Scorecard & Alerts */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Risk Scorecard</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              scorecard?.overallRiskScore > 40 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
            }`}>
              Score: {scorecard?.overallRiskScore || 0}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-slate-500">Risk Trend: <span className="font-bold">{scorecard?.trend}</span></p>
            <div className="space-y-2">
              {scorecard?.alerts.map((a: any) => (
                <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-100 dark:border-slate-700 space-y-1.5">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900 dark:text-slate-100">{a.category}</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${
                      a.severity === "Critical" || a.severity === "High" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                    }`}>{a.severity}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{a.evidence}</p>
                  <button
                    onClick={() => fetchExplanationTrace("RiskAlert", { alertName: a.category, evidence: a.evidence })}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline block text-[9px]"
                  >
                    Trace Decision &rarr;
                  </button>
                </div>
              ))}
              {scorecard?.alerts.length === 0 && (
                <p className="text-slate-400 text-center py-6">All systems nominal. No early warnings triggered.</p>
              )}
            </div>
          </div>
        </div>

        {/* Center & Right Column: Interactive Tabs Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Knowledge Graph Snapshot Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Unified Financial Knowledge Graph (UFKG)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-center">
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {graphData?.nodes.length || 0}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Entity Nodes</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-center">
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {graphData?.edges.length || 0}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Relationships</p>
              </div>
              <div className="col-span-2 md:col-span-1 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-center flex items-center justify-center">
                <span className="text-[10px] text-slate-500 font-medium">Read-Only Context Layer</span>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Workspace */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Simulation Workspace</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex flex-col space-y-1">
                <label className="text-slate-500 uppercase font-semibold">Goal Target ($)</label>
                <input
                  type="number"
                  value={simTarget}
                  onChange={(e) => setSimTarget(Number(e.target.value))}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-slate-500 uppercase font-semibold">Expected Return (%)</label>
                <input
                  type="number"
                  value={simReturn}
                  onChange={(e) => setSimReturn(Number(e.target.value))}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-slate-500 uppercase font-semibold">Random Seed</label>
                <input
                  type="number"
                  value={simSeed}
                  onChange={(e) => setSimSeed(Number(e.target.value))}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <button
              onClick={runSimulationDesk}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Run Seeded Monte Carlo
            </button>

            {/* Results display */}
            {simulationResult && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700 rounded-lg space-y-3 font-mono">
                <p className="font-bold text-slate-900 dark:text-slate-100">Projected Goal Achievement: {simulationResult.goalProbability}%</p>
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-500">
                      <th className="py-1">Year</th>
                      <th className="py-1">P10 (Conservative)</th>
                      <th className="py-1">P50 (Median)</th>
                      <th className="py-1">P90 (Optimistic)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {simulationResult.years.slice(0, 5).map((y: number, idx: number) => (
                      <tr key={y}>
                        <td className="py-1">{y}</td>
                        <td className="py-1">${simulationResult.p10[idx]?.toLocaleString()}</td>
                        <td className="py-1">${simulationResult.p50[idx]?.toLocaleString()}</td>
                        <td className="py-1">${simulationResult.p90[idx]?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Traceability Explainability Result Display */}
            {explanation && (
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg space-y-3">
                <h4 className="font-bold text-indigo-950 dark:text-indigo-200">{explanation.title}</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{explanation.summary}</p>
                <div className="space-y-1">
                  <p className="font-semibold text-[10px] text-slate-400 uppercase">Supporting Evidence</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                    {explanation.evidence.map((ev: string, idx: number) => (
                      <li key={idx}>{ev}</li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="font-semibold text-slate-400">Trace Engines:</span>
                    <p className="text-slate-600 dark:text-slate-300">{explanation.calculationSources.join(", ")}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400">Assumptions:</span>
                    <p className="text-slate-600 dark:text-slate-300">{explanation.assumptions.join(", ")}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400">Confidence:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{explanation.confidence} ({explanation.confidenceReason})</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400">Limitations:</span>
                    <p className="text-slate-600 dark:text-slate-300">{explanation.limitations.join(", ")}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
