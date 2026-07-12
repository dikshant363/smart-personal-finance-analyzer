export type NavItem = { href: string; label: string; icon: string; group?: string };

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/transactions", label: "Transactions", icon: "ArrowLeftRight" },
  { href: "/categories", label: "Categories", icon: "Tags" },
  { href: "/budgets", label: "Budgets", icon: "Wallet" },
  { href: "/goals", label: "Goals", icon: "Target" },
  { href: "/emergency-fund", label: "Emergency Fund", icon: "Shield" },
  { href: "/documents", label: "Receipt Scanner", icon: "FileText" },
  { href: "/exchange", label: "Data Exchange", icon: "Database" },
  { href: "/automation", label: "Automation", icon: "Cpu" },
  { href: "/insights", label: "Insights", icon: "Sparkles" },
  { href: "/score", label: "Health Score", icon: "Activity" },
  { href: "/spending", label: "Spending Intelligence", icon: "LineChart" },
  { href: "/recommendations", label: "Recommendations", icon: "Lightbulb" },
  { href: "/forecasts", label: "Forecasts", icon: "TrendingUp" },
  { href: "/ai-insights", label: "AI Insights", icon: "Sparkles" },
  { href: "/profile", label: "Profile", icon: "User" },
  { href: "/settings", label: "Settings", icon: "Settings" },
];
