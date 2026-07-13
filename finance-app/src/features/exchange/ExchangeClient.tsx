"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  Download,
  Upload,
  Database,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Printer,
  ChevronRight,
} from "lucide-react";

type ExchangeAudit = {
  id: string;
  action: string;
  format: string;
  dataset: string;
  status: string;
  recordCount: number;
  errorMessage: string | null;
  createdAt: string | Date;
};

export function ExchangeClient({
  initialAudits,
  categories,
  currency,
}: {
  initialAudits: ExchangeAudit[];
  categories: { id: string; name: string }[];
  currency: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"import" | "export" | "backup" | "report" | "audit">("import");
  const [audits, setAudits] = React.useState<ExchangeAudit[]>(initialAudits);

  // --- Import States ---
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [importLoading, setImportLoading] = React.useState(false);
  const [importPreview, setImportPreview] = React.useState<any | null>(null);
  const [mergeOption, setMergeOption] = React.useState<"skip" | "merge">("skip");
  const [importing, setImporting] = React.useState(false);

  // --- Export States ---
  const [exportFormat, setExportFormat] = React.useState<"csv" | "json">("csv");
  const [exportStart, setExportStart] = React.useState("");
  const [exportEnd, setExportEnd] = React.useState("");
  const [exportCategory, setExportCategory] = React.useState("all");

  // --- Backup/Restore States ---
  const [restoreFile, setRestoreFile] = React.useState<File | null>(null);
  const [restorePayload, setRestorePayload] = React.useState<any | null>(null);
  const [restoreOptions, setRestoreOptions] = React.useState({
    restoreProfile: true,
    restoreCategories: true,
    restoreTransactions: true,
    restoreBudgets: true,
    restoreGoals: true,
    restoreRecurringItems: true,
  });
  const [restoring, setRestoring] = React.useState(false);

  // --- PDF Printable Report States ---
  const [reportData, setReportData] = React.useState<any | null>(null);
  const [reportLoading, setReportLoading] = React.useState(false);

  // --- Handlers ---
  async function handleImportPreview(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setImportFile(file);
    setImportLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/exchange/import/preview", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setImportPreview(data);
    } finally {
      setImportLoading(false);
    }
  }

  async function executeImport() {
    if (!importPreview) return;
    setImporting(true);
    try {
      const res = await fetch("/api/exchange/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: importPreview.previewRows,
          mergeOption,
        }),
      });
      const data = await res.json();
      alert(`Successfully imported ${data.importedCount} transactions!`);
      setImportFile(null);
      setImportPreview(null);
      refreshAudits();
    } finally {
      setImporting(false);
    }
  }

  function executeExport() {
    let url = `/api/exchange/export?format=${exportFormat}`;
    if (exportStart) url += `&startDate=${exportStart}`;
    if (exportEnd) url += `&endDate=${exportEnd}`;
    if (exportCategory) url += `&categoryId=${exportCategory}`;
    window.open(url, "_blank");
    setTimeout(refreshAudits, 1000);
  }

  function downloadBackup() {
    window.open("/api/exchange/backup", "_blank");
    setTimeout(refreshAudits, 1000);
  }

  async function handleRestoreFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setRestoreFile(file);
    const content = await file.text();
    try {
      setRestorePayload(JSON.parse(content));
    } catch {
      alert("Invalid JSON format");
      setRestoreFile(null);
    }
  }

  async function executeRestore() {
    if (!restorePayload) return;
    setRestoring(true);
    try {
      const res = await fetch("/api/exchange/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backup: restorePayload,
          options: restoreOptions,
        }),
      });
      const data = await res.json();
      const s = data.summary;
      alert(
        `Restore complete!\n- Categories: ${s.categoriesImported}\n- Transactions: ${s.transactionsImported}\n- Budgets: ${s.budgetsImported}\n- Goals: ${s.goalsImported}\n- Recurring: ${s.recurringItemsImported}`
      );
      setRestoreFile(null);
      setRestorePayload(null);
      refreshAudits();
    } finally {
      setRestoring(false);
    }
  }

  async function generatePrintReport() {
    setReportLoading(true);
    try {
      const res = await fetch("/api/exchange/report");
      const data = await res.json();
      setReportData(data);
    } finally {
      setReportLoading(false);
    }
  }

  function triggerPrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !reportData) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Smart Personal Finance Analyzer - Financial Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937; padding: 40px; line-height: 1.5; }
            h1 { font-size: 26px; border-bottom: 2px solid #6366f1; padding-bottom: 8px; color: #312e81; margin-bottom: 5px; }
            .date { font-size: 11px; color: #9ca3af; margin-bottom: 30px; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
            .card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background-color: #fafafa; }
            .card-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #6b7280; margin-bottom: 5px; }
            .card-value { font-size: 20px; font-weight: bold; color: #111827; }
            .section { margin-top: 30px; }
            .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; color: #312e81; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th { text-align: left; background-color: #f3f4f6; padding: 8px; font-weight: bold; border-bottom: 1px solid #e5e7eb; }
            td { padding: 8px; border-bottom: 1px solid #f3f4f6; }
            .score { font-size: 32px; font-weight: bold; color: #10b981; }
            .recommendation { font-size: 12px; margin-bottom: 10px; padding: 10px; border-left: 3px solid #f59e0b; background-color: #fffbeb; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Financial Performance Statement</h1>
          <div class="date">Report generated: ${new Date(reportData.timestamp).toLocaleString()}</div>

          <div class="grid">
            <div class="card">
              <div class="card-title">Total Income (All-Time)</div>
              <div class="card-value">${formatMoney(reportData.summary.totalIncome, currency)}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Expense (All-Time)</div>
              <div class="card-value">${formatMoney(reportData.summary.totalExpense, currency)}</div>
            </div>
            <div class="card">
              <div class="card-title">Net Savings</div>
              <div class="card-value" style="color: ${reportData.summary.netSavings >= 0 ? "green" : "red"}">
                ${formatMoney(reportData.summary.netSavings, currency)}
              </div>
            </div>
            <div class="card">
              <div class="card-title">Financial Health Score</div>
              <div class="score">${reportData.financialHealth.score} <span style="font-size: 14px; font-weight: normal; color: #6b7280;">(${reportData.financialHealth.tier})</span></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Active Budgets & Targets</div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Monthly Target Limit</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.budgets.length === 0 ? "<tr><td colspan='2'>No active budgets</td></tr>" : reportData.budgets.map((b: any) => `
                  <tr>
                    <td>${b.categoryName}</td>
                    <td>${formatMoney(b.limit, currency)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Financial Goals Progress</div>
            <table>
              <thead>
                <tr>
                  <th>Goal Name</th>
                  <th>Progress Amount</th>
                  <th>Target Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.goals.length === 0 ? "<tr><td colspan='4'>No active goals</td></tr>" : reportData.goals.map((g: any) => `
                  <tr>
                    <td>${g.name}</td>
                    <td>${formatMoney(g.currentAmount, currency)}</td>
                    <td>${formatMoney(g.targetAmount, currency)}</td>
                    <td>${g.status}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">AI Financial Optimization Recommendations</div>
            ${reportData.recommendations.length === 0 ? "<p style='font-size: 12px; color: #6b7280;'>All clean! No optimizations recommended.</p>" : reportData.recommendations.map((r: any) => `
              <div class="recommendation">
                <strong>${r.title}</strong>
                <p style="margin: 3px 0 0 0; color: #4b5563;">${r.summary}</p>
              </div>
            `).join("")}
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  async function refreshAudits() {
    const res = await fetch("/api/exchange");
    const data = await res.json();
    setAudits(data.documents || data.audits || []);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        {(["import", "export", "backup", "report", "audit"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold capitalize border-b-2 -mb-[2px] transition-all",
              activeTab === tab
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === "import" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Bulk File Import (CSV / JSON)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!importPreview ? (
              <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center cursor-pointer hover:bg-neutral-50/50 transition-all flex flex-col items-center justify-center space-y-2">
                <Upload className="h-8 w-8 text-neutral-400" />
                <span className="text-xs text-neutral-500 block">Drag & drop CSV/JSON files here or click to browse</span>
                <Label htmlFor="importInput" className="cursor-pointer">
                  <Button variant="outline" size="sm" type="button" className="pointer-events-none mt-1">
                    Select File
                  </Button>
                  <input
                    id="importInput"
                    type="file"
                    accept=".csv,.json"
                    onChange={handleImportPreview}
                    className="hidden"
                  />
                </Label>
                {importLoading && (
                  <div className="flex items-center gap-1.5 text-xs text-indigo-500 pt-1">
                    <RefreshCw className="h-3 w-3 animate-spin" /> Previewing file structure...
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-lg border border-neutral-100 dark:border-neutral-800 text-xs">
                  <div>
                    <span className="font-semibold block">File: {importFile?.name}</span>
                    <span className="text-neutral-400">
                      Rows detected: {importPreview.summary.totalRows} ({importPreview.summary.validRows} valid, {importPreview.summary.invalidRows} errors)
                    </span>
                  </div>
                  {importPreview.exactDuplicateCount + importPreview.probableDuplicateCount > 0 && (
                    <Badge variant="warning" className="flex items-center gap-0.5">
                      <AlertTriangle className="h-3 w-3" />{" "}
                      {importPreview.exactDuplicateCount + importPreview.probableDuplicateCount} Duplicates
                    </Badge>
                  )}
                </div>

                {/* Validation Errors Feed */}
                {importPreview.validationErrors.length > 0 && (
                  <div className="p-3 border border-red-200 bg-red-50/50 dark:bg-red-950/10 rounded-lg space-y-1.5">
                    <span className="text-xs font-semibold text-red-700 dark:text-red-400 block">
                      Validation Warnings found:
                    </span>
                    <div className="max-h-24 overflow-y-auto space-y-1 text-[10px] text-red-600">
                      {importPreview.validationErrors.map((err: any, idx: number) => (
                        <p key={idx}>
                          Row {err.row}: Field &quot;{err.field}&quot; - {err.message}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Import Confirmation Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mergeOpt">Duplicate Handling</Label>
                    <Select id="mergeOpt" value={mergeOption} onChange={(e) => setMergeOption(e.target.value as any)}>
                      <option value="skip">Skip duplicates (Recommended)</option>
                      <option value="merge">Merge (Force overwrite/add all)</option>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setImportPreview(null)} className="w-full">
                      Reset
                    </Button>
                    <Button size="sm" onClick={executeImport} disabled={importing} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                      Confirm Import
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "export" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Custom Filter Data Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="expStart">Start Date</Label>
                <Input id="expStart" type="date" value={exportStart} onChange={(e) => setExportStart(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="expEnd">End Date</Label>
                <Input id="expEnd" type="date" value={exportEnd} onChange={(e) => setExportEnd(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="expCat">Category</Label>
                <Select id="expCat" value={exportCategory} onChange={(e) => setExportCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Export Format:</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={(exportFormat === "csv" ? "default" : "outline") as any}
                    onClick={() => setExportFormat("csv")}
                  >
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    variant={(exportFormat === "json" ? "default" : "outline") as any}
                    onClick={() => setExportFormat("json")}
                  >
                    JSON
                  </Button>
                </div>
              </div>
              <Button onClick={executeExport} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
                <Download className="h-4 w-4" /> Export Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "backup" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Backup Application Datasets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-neutral-400 leading-relaxed">
                Download a complete secure backup of your financial metrics, goals, recurring contracts, budgets, categories, and settings as a portable JSON package.
              </p>
              <Button onClick={downloadBackup} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5">
                <Database className="h-4 w-4" /> Create Full Backup
              </Button>
            </CardContent>
          </Card>

          {/* Restore */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Restore Application from Backup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!restorePayload ? (
                <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-6 text-center cursor-pointer hover:bg-neutral-50/50">
                  <Label htmlFor="restoreInput" className="cursor-pointer text-xs text-neutral-500 block">
                    Upload a backup JSON file to start...
                    <input
                      id="restoreInput"
                      type="file"
                      accept=".json"
                      onChange={handleRestoreFileChange}
                      className="hidden"
                    />
                  </Label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-xs space-y-1 p-2.5 bg-neutral-50/50 rounded-lg border border-neutral-100">
                    <span className="font-semibold block">Backup Metadata:</span>
                    <span className="text-neutral-400 block">Version: {restorePayload.version}</span>
                    <span className="text-neutral-400 block">Timestamp: {new Date(restorePayload.timestamp).toLocaleString()}</span>
                  </div>

                  {/* Restores datasets options checklist */}
                  <div className="space-y-2 text-xs">
                    <span className="font-semibold block">Restore Options:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restoreOptions.restoreProfile}
                          onChange={(e) => setRestoreOptions({ ...restoreOptions, restoreProfile: e.target.checked })}
                          className="rounded text-indigo-600"
                        />
                        <span>Currency / Profile Settings</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restoreOptions.restoreCategories}
                          onChange={(e) => setRestoreOptions({ ...restoreOptions, restoreCategories: e.target.checked })}
                          className="rounded text-indigo-600"
                        />
                        <span>Categories</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restoreOptions.restoreTransactions}
                          onChange={(e) => setRestoreOptions({ ...restoreOptions, restoreTransactions: e.target.checked })}
                          className="rounded text-indigo-600"
                        />
                        <span>Transactions</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restoreOptions.restoreBudgets}
                          onChange={(e) => setRestoreOptions({ ...restoreOptions, restoreBudgets: e.target.checked })}
                          className="rounded text-indigo-600"
                        />
                        <span>Budgets</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restoreOptions.restoreGoals}
                          onChange={(e) => setRestoreOptions({ ...restoreOptions, restoreGoals: e.target.checked })}
                          className="rounded text-indigo-600"
                        />
                        <span>Goals</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restoreOptions.restoreRecurringItems}
                          onChange={(e) => setRestoreOptions({ ...restoreOptions, restoreRecurringItems: e.target.checked })}
                          className="rounded text-indigo-600"
                        />
                        <span>Recurring Items</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setRestorePayload(null)} className="w-full">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={executeRestore} disabled={restoring} className="bg-red-600 hover:bg-red-700 text-white w-full">
                      Execute Restore
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "report" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">PDF Financial Performance Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-neutral-400 leading-relaxed">
              Compile a complete formatted document summarizing budget achievements, saving goals progress, emergency readiness logs, and smart AI tips ready to print or save to PDF.
            </p>

            {!reportData ? (
              <Button onClick={generatePrintReport} disabled={reportLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {reportLoading ? "Compiling data..." : "Generate Performance Statement"}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50 text-xs space-y-2">
                  <div className="flex justify-between font-bold border-b pb-1.5">
                    <span>Performance Metric</span>
                    <span>Summary value</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Total Income (all-time)</span>
                    <span className="font-semibold">{formatMoney(reportData.summary.totalIncome, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Total Expense (all-time)</span>
                    <span className="font-semibold">{formatMoney(reportData.summary.totalExpense, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Financial Health Score</span>
                    <span className="font-bold text-green-600">{reportData.financialHealth.score} / 100</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setReportData(null)}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={triggerPrint} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
                    <Printer className="h-4 w-4" /> Print or Save as PDF
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "audit" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Data Operations History Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {audits.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-6">No operations history logged yet.</p>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {audits.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold uppercase text-neutral-700 dark:text-neutral-200">
                          {item.action}
                        </span>
                        <Badge variant="default" className="text-[9px] px-1 py-0 bg-neutral-100 text-neutral-500 dark:bg-neutral-800">
                          {item.format}
                        </Badge>
                        <Badge variant={item.status === "success" ? "success" : "danger"} className="text-[9px] px-1 py-0 capitalize">
                          {item.status}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-neutral-400 block">
                        Dataset: {item.dataset} | Records Affected: {item.recordCount}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
