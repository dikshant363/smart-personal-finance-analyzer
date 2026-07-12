"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Wallet,
  Sparkles,
  User,
  Settings,
  LogOut,
  Activity,
  LineChart,
  Lightbulb,
  TrendingUp,
  Target,
  FileText,
  Database,
  Cpu,
} from "lucide-react";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const iconMap = {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Wallet,
  Sparkles,
  User,
  Settings,
  Activity,
  LineChart,
  Lightbulb,
  TrendingUp,
  Target,
  FileText,
  Database,
  Cpu,
} as const;

type IconName = keyof typeof iconMap;

export function AppShell({
  user,
  children,
}: {
  user: { id: string; email: string; name: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="px-4 py-5 font-semibold text-lg">Finance Analyzer</div>
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon as IconName] ?? LayoutDashboard;
            const active = pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            );
          })}
        </nav>
      </aside>

      <div className="md:pl-64">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="md:hidden font-semibold">Finance Analyzer</div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">
              {user.name ?? user.email}
            </span>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
