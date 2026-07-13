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
  FileText,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Trash2,
  Check,
  Eye,
} from "lucide-react";

type ProcessedDocument = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  extractedData: any;
  confidenceScore: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export function DocumentClient({
  initialDocuments,
  categories,
  currency,
}: {
  initialDocuments: ProcessedDocument[];
  categories: { id: string; name: string }[];
  currency: string;
}) {
  const router = useRouter();
  const [documents, setDocuments] = React.useState<ProcessedDocument[]>(initialDocuments);
  const [loading, setLoading] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Review states
  const [reviewDoc, setReviewDoc] = React.useState<ProcessedDocument | null>(null);
  const [revMerchant, setRevMerchant] = React.useState("");
  const [revTotal, setRevTotal] = React.useState("");
  const [revDate, setRevDate] = React.useState("");
  const [revTax, setRevTax] = React.useState("");
  const [revDiscount, setRevDiscount] = React.useState("");
  const [revCurrency, setRevCurrency] = React.useState("USD");
  const [revCategoryId, setRevCategoryId] = React.useState("");
  const [savingReview, setSavingReview] = React.useState(false);

  // Stats
  const queueCount = documents.filter((d) => d.status === "processing" || d.status === "review_required").length;
  const confirmedCount = documents.filter((d) => d.status === "confirmed").length;
  const avgAccuracy = documents.length > 0
    ? Math.round(
        (documents.reduce((sum, d) => sum + d.confidenceScore, 0) / documents.length) * 100
      )
    : 100;

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Upload failed");
      }

      refreshData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function startReview(doc: ProcessedDocument) {
    const data = doc.extractedData || {};
    setReviewDoc(doc);
    setRevMerchant(data.merchant || "");
    setRevTotal(data.total ? String(data.total) : "");
    setRevDate(data.date ? data.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setRevTax(data.tax ? String(data.tax) : "0");
    setRevDiscount(data.discount ? String(data.discount) : "0");
    setRevCurrency(data.currency || currency);
    setRevCategoryId("");
  }

  async function handleSaveReviewAndConfirm() {
    if (!reviewDoc) return;
    setSavingReview(true);

    const updatedData = {
      ...reviewDoc.extractedData,
      merchant: revMerchant,
      total: Number(revTotal),
      date: new Date(revDate).toISOString(),
      tax: Number(revTax),
      discount: Number(revDiscount),
      currency: revCurrency,
    };

    try {
      // 1. Update the document with fields edited by user
      await fetch(`/api/documents/${reviewDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedData: updatedData }),
      });

      // 2. Post to confirm endpoint to generate transaction
      const res = await fetch(`/api/documents/${reviewDoc.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: revCategoryId || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || "Failed to confirm transaction");
        return;
      }

      setReviewDoc(null);
      refreshData();
    } finally {
      setSavingReview(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Remove this scan history?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    refreshData();
  }

  async function refreshData() {
    const res = await fetch("/api/documents");
    const data = await res.json();
    setDocuments(data.documents ?? []);
    router.refresh();
  }

  const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
    uploaded: "default",
    processing: "info",
    review_required: "warning",
    confirmed: "success",
    failed: "danger",
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">Processing Queue</span>
              <RefreshCw className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">{queueCount} Scans</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">Average OCR Accuracy</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">{avgAccuracy}%</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">Total Confirmed</span>
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-bold">{confirmedCount} Uploads</p>
          </CardContent>
        </Card>
      </div>

      {/* Drag and Drop File Target */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 bg-white dark:bg-neutral-950",
          dragOver ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10" : "border-neutral-200 dark:border-neutral-800"
        )}
      >
        <Upload className="h-10 w-10 text-neutral-400" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-neutral-700 dark:text-neutral-300">Drag & drop receipt image or PDF</p>
          <p className="text-neutral-400 text-xs">JPEG, PNG, WEBP, or PDF up to 5MB</p>
        </div>
        <Label htmlFor="fileInput" className="cursor-pointer">
          <Button variant="outline" size="sm" type="button" className="pointer-events-none">
            Choose File
          </Button>
          <input
            id="fileInput"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
        </Label>

        {loading && (
          <div className="flex items-center gap-1.5 text-xs text-indigo-500 font-semibold pt-2">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Scanning document...</span>
          </div>
        )}

        {errorMsg && (
          <p className="text-xs text-red-500 font-semibold pt-2 flex items-center gap-1 justify-center">
            <XCircle className="h-3.5 w-3.5" /> {errorMsg}
          </p>
        )}
      </div>

      {/* Scans list & reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Processing Pipeline History</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8 text-neutral-400" />}
              title="No scanned documents"
              description="Upload your receipts to scan and save transaction records automatically."
            />
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 hover:shadow-sm transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {doc.fileName}
                      </span>
                      <Badge variant={statusVariant[doc.status] as any} className="text-[10px] px-1.5 py-0 capitalize">
                        {doc.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300">
                        Accuracy: {Math.round(doc.confidenceScore * 100)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      <span>Size: {Math.round(doc.fileSize / 1024)} KB</span>
                      <span>Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {doc.status === "review_required" && (
                      <Button size="sm" onClick={() => startReview(doc)} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> Review
                      </Button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      {reviewDoc && (
        <Dialog open={!!reviewDoc} onClose={() => setReviewDoc(null)} title="Review Extracted Receipt Parameters">
          <div className="space-y-3.5">
            <p className="text-xs text-neutral-400">
              Check accuracy and assign a category to confirm this transaction. Fields with low OCR confidence are highlighted.
            </p>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="revMerc" className="flex items-center gap-1">
                    Merchant Name
                    {reviewDoc.extractedData?.merchantConfidence < 0.8 && (
                      <span className="text-amber-500 flex items-center gap-0.5 text-[10px] font-semibold">
                        <AlertTriangle className="h-3 w-3" /> Low Confidence
                      </span>
                    )}
                  </Label>
                </div>
                <Input
                  id="revMerc"
                  value={revMerchant}
                  onChange={(e) => setRevMerchant(e.target.value)}
                  className={cn(reviewDoc.extractedData?.merchantConfidence < 0.8 && "border-amber-500 focus-visible:ring-amber-500")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="revAmt" className="flex items-center gap-1 mb-1">
                    Total Amount
                    {reviewDoc.extractedData?.totalConfidence < 0.8 && (
                      <span className="text-amber-500 flex items-center gap-0.5 text-[10px] font-semibold">
                        <AlertTriangle className="h-3 w-3" /> Low
                      </span>
                    )}
                  </Label>
                  <Input
                    id="revAmt"
                    type="number"
                    step="0.01"
                    value={revTotal}
                    onChange={(e) => setRevTotal(e.target.value)}
                    className={cn(reviewDoc.extractedData?.totalConfidence < 0.8 && "border-amber-500 focus-visible:ring-amber-500")}
                  />
                </div>
                <div>
                  <Label htmlFor="revDate" className="flex items-center gap-1 mb-1">
                    Receipt Date
                    {reviewDoc.extractedData?.dateConfidence < 0.8 && (
                      <span className="text-amber-500 flex items-center gap-0.5 text-[10px] font-semibold">
                        <AlertTriangle className="h-3 w-3" /> Low
                      </span>
                    )}
                  </Label>
                  <Input
                    id="revDate"
                    type="date"
                    value={revDate}
                    onChange={(e) => setRevDate(e.target.value)}
                    className={cn(reviewDoc.extractedData?.dateConfidence < 0.8 && "border-amber-500 focus-visible:ring-amber-500")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="revTax" className="mb-1 block">Tax</Label>
                  <Input id="revTax" type="number" step="0.01" value={revTax} onChange={(e) => setRevTax(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="revDisc" className="mb-1 block">Discount</Label>
                  <Input id="revDisc" type="number" step="0.01" value={revDiscount} onChange={(e) => setRevDiscount(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="revCurr" className="mb-1 block">Currency</Label>
                  <Input id="revCurr" value={revCurrency} onChange={(e) => setRevCurrency(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="revCat" className="mb-1 block">Category</Label>
                  <Select id="revCat" value={revCategoryId} onChange={(e) => setRevCategoryId(e.target.value)}>
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <Button variant="outline" size="sm" onClick={() => setReviewDoc(null)}>Cancel</Button>
              <Button size="sm" onClick={handleSaveReviewAndConfirm} disabled={savingReview || !revMerchant || !revTotal} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
                <Check className="h-4 w-4" /> Save & Confirm Transaction
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
