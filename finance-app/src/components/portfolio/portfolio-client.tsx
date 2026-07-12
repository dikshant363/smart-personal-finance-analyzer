"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  Wallet,
  Plus,
  Trash2,
  ArrowRightLeft,
  Briefcase,
  HelpCircle,
  Building,
} from "lucide-react";

type PortfolioSummary = {
  portfolioId: string;
  name: string;
  description: string | null;
  totalBalance: number;
  accountsCount: number;
};

type Account = {
  id: string;
  portfolioId: string | null;
  name: string;
  institution: string;
  type: string;
  currency: string;
  openingBalance: any;
  currentBalance: any;
  status: string;
  owner: string;
};

type PortfolioRaw = {
  id: string;
  name: string;
  description: string | null;
};

export function PortfolioClient({
  initialPortfoliosSummary,
  initialAccounts,
  allPortfoliosRaw,
  currency,
}: {
  initialPortfoliosSummary: PortfolioSummary[];
  initialAccounts: Account[];
  allPortfoliosRaw: PortfolioRaw[];
  currency: string;
}) {
  const router = useRouter();
  const [portfolios, setPortfolios] = React.useState<PortfolioSummary[]>(initialPortfoliosSummary);
  const [accounts, setAccounts] = React.useState<Account[]>(initialAccounts);
  
  const [isAddingPortfolio, setIsAddingPortfolio] = React.useState(false);
  const [isAddingAccount, setIsAddingAccount] = React.useState(false);
  const [isTransferring, setIsTransferring] = React.useState(false);

  // Portfolio Form State
  const [pName, setPName] = React.useState("");
  const [pDesc, setPDesc] = React.useState("");

  // Account Form State
  const [accName, setAccName] = React.useState("");
  const [accInstitution, setAccInstitution] = React.useState("");
  const [accType, setAccType] = React.useState("Checking");
  const [accOpening, setAccOpening] = React.useState(0);
  const [accCurrent, setAccCurrent] = React.useState(0);
  const [accPortfolioId, setAccPortfolioId] = React.useState(allPortfoliosRaw[0]?.id || "");
  const [accOwner, setAccOwner] = React.useState("Self");

  // Transfer Form State
  const [fromAccountId, setFromAccountId] = React.useState("");
  const [toAccountId, setToAccountId] = React.useState("");
  const [transferAmount, setTransferAmount] = React.useState(0);
  const [transferError, setTransferError] = React.useState<string | null>(null);

  async function handleAddPortfolio(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/portfolios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: pName, description: pDesc }),
    });

    if (res.ok) {
      setIsAddingPortfolio(false);
      setPName("");
      setPDesc("");
      refreshData();
    }
  }

  async function handleAddAccount(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: accName,
        institution: accInstitution,
        type: accType,
        openingBalance: accOpening,
        currentBalance: accCurrent,
        portfolioId: accPortfolioId || undefined,
        owner: accOwner,
      }),
    });

    if (res.ok) {
      setIsAddingAccount(false);
      resetAccountForm();
      refreshData();
    }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    setTransferError(null);

    const res = await fetch("/api/accounts/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromAccountId, toAccountId, amount: transferAmount }),
    });

    if (res.ok) {
      setIsTransferring(false);
      setFromAccountId("");
      setToAccountId("");
      setTransferAmount(0);
      refreshData();
    } else {
      const data = await res.json();
      setTransferError(data.message || "Failed to execute balance transfer.");
    }
  }

  async function handleDeleteAccount(id: string) {
    const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    if (res.ok) {
      refreshData();
    }
  }

  async function refreshData() {
    const [portRes, accsRes] = await Promise.all([
      fetch("/api/portfolios"),
      fetch("/api/accounts"),
    ]);

    const portData = await portRes.json();
    const accsData = await accsRes.json();

    setPortfolios(portData.portfolios ?? []);
    setAccounts(accsData.accounts ?? []);
    router.refresh();
  }

  function resetAccountForm() {
    setAccName("");
    setAccInstitution("");
    setAccType("Checking");
    setAccOpening(0);
    setAccCurrent(0);
    setAccPortfolioId(allPortfoliosRaw[0]?.id || "");
    setAccOwner("Self");
  }

  return (
    <div className="space-y-6">
      {/* Header and tools */}
      <div className="flex justify-between items-center pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <p className="text-xs text-neutral-400">
          Structure bank accounts and digital wallets into portfolios and transfer funds safely.
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsTransferring(true)}
            className="flex items-center gap-1.5"
          >
            <ArrowRightLeft className="h-4 w-4" /> Transfer Funds
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddingPortfolio(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> New Portfolio
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddingAccount(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> New Account
          </Button>
        </div>
      </div>

      {/* Portfolio overview blocks */}
      <div className="grid gap-4 md:grid-cols-3">
        {portfolios.map((p) => (
          <Card key={p.portfolioId} className="border-neutral-100 dark:border-neutral-800 shadow-sm relative overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/50">
            <CardHeader className="pb-1.5">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Portfolio</span>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-indigo-500" /> {p.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-2xl font-extrabold text-neutral-800 dark:text-white">
                {formatMoney(p.totalBalance, currency)}
              </h2>
              <p className="text-[10px] text-neutral-400 mt-1">{p.accountsCount} active accounts linked</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Accounts list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Financial Accounts Registry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex justify-between items-center p-3.5 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 text-xs"
            >
              <div className="flex gap-3">
                <div className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-xl shrink-0 mt-0.5">
                  <Building className="h-4 w-4 text-neutral-400" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{acc.name}</span>
                    <Badge variant="info" className="text-[8px] px-1 py-0 uppercase">
                      {acc.type}
                    </Badge>
                    <span className="text-[9px] text-neutral-400">Institution: {acc.institution}</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">Owner: {acc.owner} | Currency: {acc.currency}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="font-bold text-xs block text-neutral-800 dark:text-neutral-200">
                    {formatMoney(parseFloat(acc.currentBalance), currency)}
                  </span>
                  <span className="text-[9px] text-neutral-400 block">
                    Opening: {formatMoney(parseFloat(acc.openingBalance), currency)}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteAccount(acc.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Archive account"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Transfer Drawer Dialog */}
      {isTransferring && (
        <Dialog open={isTransferring} onClose={() => setIsTransferring(false)} title="Balance Transfer between Accounts">
          <form onSubmit={handleTransfer} className="space-y-3.5 text-xs">
            {transferError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 font-semibold text-[10px]">
                {transferError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Source Account (From)</label>
                <Select value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} required>
                  <option value="">Select account...</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatMoney(parseFloat(acc.currentBalance), currency)})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Destination Account (To)</label>
                <Select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} required>
                  <option value="">Select account...</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} disabled={acc.id === fromAccountId}>
                      {acc.name} ({formatMoney(parseFloat(acc.currentBalance), currency)})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Transfer Amount</label>
              <Input type="number" step="0.01" value={transferAmount} onChange={(e) => setTransferAmount(parseFloat(e.target.value) || 0)} required />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsTransferring(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Execute Transfer</Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* New Portfolio Dialog */}
      {isAddingPortfolio && (
        <Dialog open={isAddingPortfolio} onClose={() => setIsAddingPortfolio(false)} title="Create New Account Portfolio">
          <form onSubmit={handleAddPortfolio} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Portfolio Name</label>
              <Input value={pName} onChange={(e) => setPName(e.target.value)} required placeholder="e.g. Shared Family Vault" />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Description</label>
              <Input value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Manage common asset pools..." />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsAddingPortfolio(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Create Portfolio</Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* New Account Dialog */}
      {isAddingAccount && (
        <Dialog open={isAddingAccount} onClose={() => setIsAddingAccount(false)} title="Register New Account">
          <form onSubmit={handleAddAccount} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Account Name</label>
                <Input value={accName} onChange={(e) => setAccName(e.target.value)} required placeholder="e.g. Chase Checkings" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Institution</label>
                <Input value={accInstitution} onChange={(e) => setAccInstitution(e.target.value)} required placeholder="e.g. Chase Bank, Self" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Account Type</label>
                <Select value={accType} onChange={(e) => setAccType(e.target.value)}>
                  <option value="Checking">Checking Account</option>
                  <option value="Savings">Savings Account</option>
                  <option value="CashWallet">Digital Wallet / Cash</option>
                  <option value="Crypto">Crypto Wallet</option>
                  <option value="Investment">Investment Portfolio</option>
                  <option value="Custom">Custom account</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Opening Balance</label>
                <Input type="number" value={accOpening} onChange={(e) => setAccOpening(parseFloat(e.target.value) || 0)} required />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Current Balance</label>
                <Input type="number" value={accCurrent} onChange={(e) => setAccCurrent(parseFloat(e.target.value) || 0)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Portfolio Group</label>
                <Select value={accPortfolioId} onChange={(e) => setAccPortfolioId(e.target.value)}>
                  {allPortfoliosRaw.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Owner Name</label>
                <Input value={accOwner} onChange={(e) => setAccOwner(e.target.value)} required />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsAddingAccount(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Register Account</Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
