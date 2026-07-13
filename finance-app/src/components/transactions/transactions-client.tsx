"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";

type Transaction = {
  id: string;
  type: "Income" | "Expense";
  amount: number;
  currency: string;
  description: string | null;
  date: string;
  category: { name: string; color: string } | null;
  categoryId: string | null;
  amountBase?: number;
  baseCurrency?: string;
  rate?: number | null;
  converted?: boolean;
};

type Category = {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string | null;
};

type TransactionsClientProps = {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
};

export function TransactionsClient({
  transactions,
  categories,
  currency,
}: TransactionsClientProps) {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = React.useState<"All" | "Income" | "Expense">("All");
  const [catFilter, setCatFilter] = React.useState<string>("all");
  const [month, setMonth] = React.useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Transaction | null>(null);

  const [formType, setFormType] = React.useState<"Income" | "Expense">("Expense");
  const [amount, setAmount] = React.useState("");
  const [catId, setCatId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));

  const filtered = React.useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== "All" && tx.type !== typeFilter) return false;
      if (catFilter !== "all" && tx.categoryId !== catFilter) return false;
      if (!tx.date.startsWith(month)) return false;
      return true;
    });
  }, [transactions, typeFilter, catFilter, month]);

  const openCreate = () => {
    setEditing(null);
    setFormType("Expense");
    setAmount("");
    setCatId("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setDialogOpen(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    setFormType(tx.type);
    setAmount(String(tx.amount));
    setCatId(tx.categoryId || "");
    setDescription(tx.description || "");
    setDate(tx.date.slice(0, 10));
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      type: formType,
      amount: parseFloat(amount),
      currency,
      categoryId: catId || null,
      description: description || undefined,
      date: new Date(date).toISOString(),
    };

    const url = editing ? `/api/transactions/${editing.id}` : "/api/transactions";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to save transaction");
      return;
    }

    handleClose();
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this transaction?")) return;
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Failed to delete transaction");
      return;
    }
    router.refresh();
  };

  const typeCategories = categories.filter((c) => c.type === formType);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "All" | "Income" | "Expense")}
        >
          <option value="All">All Types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </Select>

        <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-auto"
        />

        <Button onClick={openCreate} className="ml-auto">
          <Plus className="h-4 w-4" />
          Add transaction
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState title="No transactions yet" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Date</TH>
                  <TH>Description</TH>
                  <TH>Category</TH>
                  <TH>Type</TH>
                  <TH className="text-right">Amount</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((tx) => (
                  <TR key={tx.id}>
                    <TD>{new Date(tx.date).toLocaleDateString()}</TD>
                    <TD>{tx.description || "—"}</TD>
                    <TD>
                      {tx.category ? (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: tx.category.color + "20",
                            color: tx.category.color,
                          }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: tx.category.color }}
                          />
                          {tx.category.name}
                        </span>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </TD>
                    <TD>
                      <Badge variant={tx.type === "Income" ? "success" : "danger"}>
                        {tx.type}
                      </Badge>
                    </TD>
                    <TD
                      className={cn(
                        "text-right font-medium",
                        tx.type === "Income" && "text-green-600 dark:text-green-400"
                      )}
                    >
                      <div className="flex flex-col items-end">
                        <span>{formatMoney(tx.amount, tx.currency)}</span>
                        {tx.converted && tx.amountBase !== undefined && tx.baseCurrency && tx.baseCurrency !== tx.currency ? (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            ≈ {formatMoney(tx.amountBase, tx.baseCurrency)}
                            {tx.rate != null ? ` @ ${tx.rate.toFixed(4)}` : ""}
                          </span>
                        ) : null}
                      </div>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(tx)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tx.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        title={editing ? "Edit transaction" : "Add transaction"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={formType === "Income" ? "primary" : "outline"}
              onClick={() => setFormType("Income")}
              className="flex-1"
            >
              Income
            </Button>
            <Button
              type="button"
              variant={formType === "Expense" ? "primary" : "outline"}
              onClick={() => setFormType("Expense")}
              className="flex-1"
            >
              Expense
            </Button>
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select id="category" value={catId} onChange={(e) => setCatId(e.target.value)}>
              <option value="">None</option>
              {typeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
