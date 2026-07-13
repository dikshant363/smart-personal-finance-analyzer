"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
  Calendar,
  Users,
  RefreshCw,
  LayoutGrid,
  Shield,
  Code,
  WifiOff,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

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
  Calendar,
  Users,
  RefreshCw,
  LayoutGrid,
  Shield,
  Code,
  WifiOff,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  // Key navigation items shown directly on mobile bottom nav
  const mobilePrimaryItems = [
    { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/transactions", label: "Transactions", icon: "ArrowLeftRight" },
    { href: "/copilot", label: "Copilot", icon: "Sparkles" },
    { href: "/command-center", label: "Command Center", icon: "LayoutGrid" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 flex flex-col md:flex-row">
      {/* 1. Large Displays & Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="px-4 py-5 font-semibold text-lg border-b border-neutral-200 dark:border-neutral-800">
          Finance Operating System
        </div>
        <nav className="flex-1 overflow-y-auto space-y-1 px-2 py-4 custom-scrollbar">
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
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
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

      {/* 2. Tablet Navigation Rail (medium screens) */}
      <aside className="hidden md:flex lg:hidden fixed inset-y-0 left-0 w-20 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex h-16 items-center justify-center border-b border-neutral-200 dark:border-neutral-800">
          <Activity className="h-6 w-6 text-indigo-600" />
        </div>
        <nav className="flex-1 overflow-y-auto py-4 space-y-4 items-center flex flex-col custom-scrollbar">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon as IconName] ?? LayoutDashboard;
            const active = pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                  active
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                )}
              >
                <Icon className="h-5 w-5" />
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col md:pl-20 lg:pl-64 min-h-screen pb-16 md:pb-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white/80 backdrop-blur-md px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="font-semibold text-lg flex items-center gap-2">
            <span className="text-indigo-600">Smart</span> Personal Finance
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-neutral-600 dark:text-neutral-300">
              {user.name ?? user.email}
            </span>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      {/* 3. Mobile Bottom Navigation Bar (small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-t border-neutral-200 dark:bg-neutral-900/90 dark:border-neutral-800 flex items-center justify-around z-40 px-2 pb-safe">
        {mobilePrimaryItems.map((item) => {
          const Icon = iconMap[item.icon as IconName] ?? LayoutDashboard;
          const active = pathname.startsWith(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors",
                active
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-neutral-500 hover:text-indigo-500"
              )}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span>{item.label.split(" ")[0]}</span>
            </a>
          );
        })}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium text-neutral-500 hover:text-indigo-500"
        >
          <Menu className="h-5 w-5 mb-0.5" />
          <span>More</span>
        </button>
      </div>

      {/* Mobile Drawer/Modal for Full Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex flex-col md:hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
            <span className="font-bold text-lg text-white">All Workspaces & Desk Modules</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-full bg-neutral-900 text-neutral-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon as IconName] ?? LayoutDashboard;
              const active = pathname.startsWith(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all",
                    active
                      ? "bg-indigo-950/60 border border-indigo-500/30 text-indigo-300"
                      : "bg-neutral-900/40 border border-neutral-800/40 text-neutral-300 hover:bg-neutral-800/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-indigo-400" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
