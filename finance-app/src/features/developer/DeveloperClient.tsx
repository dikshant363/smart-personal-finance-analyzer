"use client";

import React, { useState, useEffect } from "react";

export default function DeveloperClient() {
  const [extensions, setExtensions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Extension Form Inputs
  const [extId, setExtId] = useState("");
  const [extName, setExtName] = useState("");
  const [extVersion, setExtVersion] = useState("1.0.0");
  const [extAuthor, setExtAuthor] = useState("");
  const [extDesc, setExtDesc] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [permTx, setPermTx] = useState(true);
  const [permBudgets, setPermBudgets] = useState(false);
  const [permGoals, setPermGoals] = useState(false);

  useEffect(() => {
    fetchExtensions();
  }, []);

  async function fetchExtensions() {
    try {
      setLoading(true);
      const res = await fetch("/api/developer/extensions");
      const data = await res.json();
      setExtensions(data.extensions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleInstallExtension(e: React.FormEvent) {
    e.preventDefault();
    if (!extId || !extName || !extAuthor) return;

    const perms: string[] = [];
    if (permTx) perms.push("read:transactions");
    if (permBudgets) perms.push("read:budgets");
    if (permGoals) perms.push("read:goals");

    try {
      const res = await fetch("/api/developer/extensions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: extId,
          name: extName,
          version: extVersion,
          author: extAuthor,
          description: extDesc || undefined,
          permissions: perms,
          webhookUrl: webhookUrl || undefined,
        }),
      });

      if (res.ok) {
        setExtId("");
        setExtName("");
        setExtAuthor("");
        setExtDesc("");
        setWebhookUrl("");
        fetchExtensions();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === "Enabled" ? "Disabled" : "Enabled";
    try {
      const res = await fetch(`/api/developer/extensions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) fetchExtensions();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUninstall(id: string) {
    try {
      const res = await fetch(`/api/developer/extensions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) fetchExtensions();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500 animate-pulse text-lg">Initializing sandbox registries...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Installed Extensions Ledger */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Registered Developer Extensions</h3>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
              SANDBOX MODE: ACTIVE
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 font-semibold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3">Extension</th>
                  <th className="px-6 py-3">Permissions</th>
                  <th className="px-6 py-3">Webhook Url</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                {extensions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No extensions registered in active namespace. Initialize a manifest on the right panel.
                    </td>
                  </tr>
                ) : (
                  extensions.map((ext) => (
                    <tr key={ext.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        <p>{ext.name}</p>
                        <span className="text-[9px] text-slate-400 font-normal">
                          ID: {ext.id} | v{ext.version} by {ext.author}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                        <div className="flex flex-wrap gap-1">
                          {ext.permissions.split(",").map((p: string, idx: number) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[8px]">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[150px]" title={ext.webhookUrl}>
                        {ext.webhookUrl || "None"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(ext.id, ext.status)}
                          className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                            ext.status === "Enabled"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {ext.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleUninstall(ext.id)}
                          className="text-rose-500 hover:text-rose-700 font-bold"
                        >
                          Uninstall
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Example SDK Usage Code Block */}
        <div className="bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-xs space-y-3">
          <p className="text-slate-400 uppercase font-bold text-[10px]">Integration SDK Reference Guide</p>
          <pre className="overflow-x-auto text-[10px] leading-relaxed">
{`import { triggerWebhookEvent } from "@/lib/sdk";

// Invoke event notification inside core business services
await triggerWebhookEvent(userId, "Transaction Created", {
  id: "tx_1849",
  amount: 450.00,
  category: "Business Expenses"
});`}
          </pre>
        </div>
      </div>

      {/* Right Column - Manifest Creator Form */}
      <div className="space-y-8 text-xs">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Register Extension Manifest</h4>
          <form onSubmit={handleInstallExtension} className="space-y-3">
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Extension ID</label>
              <input
                type="text"
                value={extId}
                onChange={(e) => setExtId(e.target.value)}
                placeholder="my-custom-widget"
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Extension Name</label>
              <input
                type="text"
                value={extName}
                onChange={(e) => setExtName(e.target.value)}
                placeholder="Custom Dashboard Widget"
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col space-y-1">
                <label className="text-slate-500 font-semibold uppercase">Version</label>
                <input
                  type="text"
                  value={extVersion}
                  onChange={(e) => setExtVersion(e.target.value)}
                  placeholder="1.0.0"
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-slate-500 font-semibold uppercase">Author</label>
                <input
                  type="text"
                  value={extAuthor}
                  onChange={(e) => setExtAuthor(e.target.value)}
                  placeholder="Dev Org"
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-slate-500 font-semibold uppercase">Webhook Target URL</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.my-widget.com/webhook"
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold uppercase block">Scope Permissions Required</label>
              <div className="space-y-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={permTx}
                    onChange={(e) => setPermTx(e.target.checked)}
                  />
                  <span>Read Transactions</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={permBudgets}
                    onChange={(e) => setPermBudgets(e.target.checked)}
                  />
                  <span>Read Budgets</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={permGoals}
                    onChange={(e) => setPermGoals(e.target.checked)}
                  />
                  <span>Read Goals</span>
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors shadow-sm"
            >
              Register Sandbox Manifest
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
