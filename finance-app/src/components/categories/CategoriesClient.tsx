"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";

type Category = { id: string; name: string; type: "Income" | "Expense"; color: string; icon: string };

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<"Income" | "Expense">("Expense");
  const [color, setColor] = React.useState("#6366f1");
  const [icon, setIcon] = React.useState("tag");
  const [saving, setSaving] = React.useState(false);

  function openAdd() {
    setEditing(null);
    setName("");
    setType("Expense");
    setColor("#6366f1");
    setIcon("tag");
    setOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setName(c.name);
    setType(c.type);
    setColor(c.color);
    setIcon(c.icon);
    setOpen(true);
  }

  async function submit() {
    setSaving(true);
    const body = JSON.stringify({ name, type, color, icon });
    const headers = { "Content-Type": "application/json" };
    try {
      if (editing) {
        await fetch(`/api/categories/${editing.id}`, { method: "PUT", headers, body });
      } else {
        await fetch("/api/categories", { method: "POST", headers, body });
      }
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: Category) {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your categories</CardTitle>
        <Button onClick={openAdd} size="sm">Add category</Button>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <EmptyState title="No categories yet" description="Create a category to organize your transactions." />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Type</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {categories.map((c) => (
                <TR key={c.id}>
                  <TD>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </TD>
                  <TD>
                    <Badge variant={c.type === "Income" ? "success" : "danger"}>
                      {c.type}
                    </Badge>
                  </TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => remove(c)}>
                        Delete
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit category" : "Add category"}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Groceries" />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select id="type" value={type} onChange={(e) => setType(e.target.value as "Income" | "Expense")}>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="color">Color</Label>
            <Input id="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="icon">Icon</Label>
            <Input id="icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="tag" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submit} disabled={saving || !name}>
              {editing ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </Dialog>
    </Card>
  );
}
