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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import { Target } from "lucide-react";

type Goal = {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline?: string | null;
  priority: string;
  status: string;
  progress: number;
};

export function GoalsClient({
  goals,
  currency,
}: {
  goals: Goal[];
  currency: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Goal | null>(null);
  const [filter, setFilter] = React.useState("active");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [targetAmount, setTargetAmount] = React.useState("");
  const [currentAmount, setCurrentAmount] = React.useState("0");
  const [currencyInput, setCurrencyInput] = React.useState("USD");
  const [deadline, setDeadline] = React.useState("");
  const [priority, setPriority] = React.useState("medium");
  const [saving, setSaving] = React.useState(false);

  function openAdd() {
    setEditing(null);
    setName("");
    setDescription("");
    setTargetAmount("");
    setCurrentAmount("0");
    setCurrencyInput("USD");
    setDeadline("");
    setPriority("medium");
    setOpen(true);
  }

  function openEdit(g: Goal) {
    setEditing(g);
    setName(g.name);
    setDescription(g.description ?? "");
    setTargetAmount(String(g.targetAmount));
    setCurrentAmount(String(g.currentAmount));
    setCurrencyInput(g.currency);
    setDeadline(g.deadline ? g.deadline.slice(0, 16) : "");
    setPriority(g.priority);
    setOpen(true);
  }

  async function submit() {
    setSaving(true);
    const body = JSON.stringify({
      name,
      description: description || null,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      currency: currencyInput,
      deadline: deadline || null,
      priority,
      ...(editing ? { status: editing.status } : { status: "active" }),
    });
    const headers = { "Content-Type": "application/json" };
    try {
      if (editing) {
        await fetch(`/api/goals/${editing.id}`, { method: "PATCH", headers, body });
      } else {
        await fetch("/api/goals", { method: "POST", headers, body });
      }
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, label: string) {
    if (!window.confirm(`Delete goal "${label}"?`)) return;
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const filtered = goals.filter((g) => g.status === filter);

  const priorityVariant: Record<string, "default" | "success" | "warning" | "danger"> = {
    low: "default",
    medium: "warning",
    high: "danger",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goals</CardTitle>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {["active", "completed", "archived"].map((s) => (
              <Button
                key={s}
                variant={filter === s ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
          <Button onClick={openAdd} size="sm">
            Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Target className="h-10 w-10" />}
            title="No goals yet"
            description="Create a goal to track your progress."
            action={<Button onClick={openAdd}>Add goal</Button>}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((g) => (
              <div
                key={g.id}
                className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {g.name}
                    </p>
                    {g.description ? (
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {g.description}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-neutral-600 dark:text-neutral-300">
                        {formatMoney(g.targetAmount, g.currency)}
                      </span>
                      <span className="text-neutral-500">of</span>
                      <span className="text-neutral-600 dark:text-neutral-300">
                        {formatMoney(g.currentAmount, g.currency)}
                      </span>
                      {g.deadline ? (
                        <span className="text-neutral-500">
                          — {new Date(g.deadline).toLocaleDateString()}
                        </span>
                      ) : null}
                      <Badge variant={priorityVariant[g.priority] as any}>
                        {g.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(g)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => remove(g.id, g.name)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                    <span>Progress</span>
                    <span>{g.progress}%</span>
                  </div>
                  <Progress value={g.progress} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit goal" : "Add goal"}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Emergency fund" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="6 months of expenses" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="target">Target Amount</Label>
              <Input id="target" type="number" step="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="10000" />
            </div>
            <div>
              <Label htmlFor="current">Current Amount</Label>
              <Input id="current" type="number" step="0.01" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" value={currencyInput} onChange={(e) => setCurrencyInput(e.target.value)} placeholder="USD" />
            </div>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submit} disabled={saving || !name || !targetAmount}>
              {editing ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </Dialog>
    </Card>
  );
}
