"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";

type Budget = {
  id: string;
  name: string;
  amount: number;
  period: "Weekly" | "Monthly" | "Yearly";
  categoryId: string | null;
  category: { name: string; color: string } | null;
  spent: number;
  remaining: number;
  percent: number;
};

type Category = { id: string; name: string; color: string };

export function BudgetsClient({
  budgets,
  categories,
  currency,
}: {
  budgets: Budget[];
  categories: Category[];
  currency: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Budget | null>(null);
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [period, setPeriod] = React.useState<"Weekly" | "Monthly" | "Yearly">("Monthly");
  const [categoryId, setCategoryId] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);

  function openAdd() {
    setEditing(null);
    setName("");
    setAmount("");
    setPeriod("Monthly");
    setCategoryId("");
    setOpen(true);
  }

  function openEdit(b: Budget) {
    setEditing(b);
    setName(b.name);
    setAmount(String(b.amount));
    setPeriod(b.period);
    setCategoryId(b.categoryId ?? "");
    setOpen(true);
  }

  async function submit() {
    setSaving(true);
    const body = JSON.stringify({
      name,
      amount: Number(amount),
      period,
      categoryId: categoryId || null,
    });
    const headers = { "Content-Type": "application/json" };
    try {
      if (editing) {
        await fetch(`/api/budgets/${editing.id}`, { method: "PUT", headers, body });
      } else {
        await fetch("/api/budgets", { method: "POST", headers, body });
      }
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, label: string) {
    if (!window.confirm(`Delete "${label}"?`)) return;
    await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    router.refresh();
  }

  function barColor(percent: number) {
    if (percent < 80) return "bg-green-500";
    if (percent < 100) return "bg-amber-500";
    return "bg-red-500";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budgets</CardTitle>
        <Button onClick={openAdd} size="sm">Add budget</Button>
      </CardHeader>
      <CardContent>
        {budgets.length === 0 ? (
          <EmptyState title="No budgets yet" description="Create a budget to track your spending." action={<Button onClick={openAdd}>Add budget</Button>} />
        ) : (
          <div className="space-y-4">
            {budgets.map((b) => (
              <div key={b.id} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">{b.name}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                      {b.category ? (
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: b.category.color + "33", color: b.category.color }}
                        >
                          {b.category.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100">
                          Overall
                        </span>
                      )}
                      <span>{b.period}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(b)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => remove(b.id, b.name)}>Delete</Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-neutral-600 dark:text-neutral-300">Budget: {formatMoney(b.amount, currency)}</span>
                  <span className="text-neutral-600 dark:text-neutral-300">Spent: {formatMoney(b.spent, currency)}</span>
                  <span className={cn(b.remaining < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400")}>
                    Remaining: {formatMoney(b.remaining, currency)}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800">
                  <div className={cn("h-2 rounded-full", barColor(b.percent))} style={{ width: `${b.percent}%` }} />
                </div>
                <div className="mt-1 text-right text-xs text-neutral-500 dark:text-neutral-400">{b.percent}%</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit budget" : "Add budget"}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Groceries" />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500" />
          </div>
          <div>
            <Label htmlFor="period">Period</Label>
            <Select id="period" value={period} onChange={(e) => setPeriod(e.target.value as "Weekly" | "Monthly" | "Yearly")}>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Overall</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submit} disabled={saving || !name || !amount}>
              {editing ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </Dialog>
    </Card>
  );
}
