"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import {
  Bell,
  Cpu,
  Clock,
  Play,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Trash2,
  Check,
} from "lucide-react";

type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string | Date;
};

type WorkflowJob = {
  id: string;
  name: string;
  triggerType: string;
  triggerName: string;
  status: string;
  runCount: number;
  lastRun: string | Date | null;
  nextRun: string | Date | null;
  errorMessage: string | null;
};

type WorkflowHistory = {
  id: string;
  jobName: string;
  actionType: string;
  status: string;
  durationMs: number;
  errorMessage: string | null;
  createdAt: string | Date;
};

export function AutomationClient({
  initialNotifications,
  initialJobs,
  initialHistory,
}: {
  initialNotifications: Notification[];
  initialJobs: WorkflowJob[];
  initialHistory: WorkflowHistory[];
}) {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<Notification[]>(initialNotifications);
  const [jobs, setJobs] = React.useState<WorkflowJob[]>(initialJobs);
  const [history, setHistory] = React.useState<WorkflowHistory[]>(initialHistory);
  
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [runningScheduler, setRunningScheduler] = React.useState(false);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    refreshData();
  }

  async function dismiss(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    refreshData();
  }

  async function runScheduler() {
    setRunningScheduler(true);
    try {
      await fetch("/api/automation/jobs/run", { method: "POST" });
      refreshData();
    } finally {
      setRunningScheduler(false);
    }
  }

  async function refreshData() {
    const [notifRes, jobsRes, histRes] = await Promise.all([
      fetch(`/api/notifications?unread=${unreadOnly}`),
      fetch("/api/automation/jobs"),
      fetch("/api/automation/history"),
    ]);

    const notifData = await notifRes.json();
    const jobsData = await jobsRes.json();
    const histData = await histRes.json();

    setNotifications(notifData.notifications ?? []);
    setJobs(jobsData.jobs ?? []);
    setHistory(histData.history ?? []);
    router.refresh();
  }

  React.useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadOnly]);

  const notifVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
    info: "info",
    warning: "warning",
    critical: "danger",
    success: "success",
    achievement: "success",
    recommendation: "warning",
    reminder: "info",
  };

  const statusColor: Record<string, string> = {
    pending: "text-neutral-400",
    running: "text-indigo-500 animate-pulse",
    success: "text-green-500",
    failed: "text-red-500",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left panel: Notification Center */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-indigo-500" /> Notifications Feed
            </CardTitle>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs cursor-pointer text-neutral-500">
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Unread Only</span>
              </label>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ? (
              <EmptyState
                icon={<Bell className="h-8 w-8 text-neutral-400" />}
                title="All clear!"
                description="No active notifications or alerts."
              />
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "p-4 border rounded-xl flex items-start justify-between gap-4 transition-all bg-white dark:bg-neutral-950",
                    notif.isRead
                      ? "border-neutral-100 dark:border-neutral-900 opacity-70"
                      : "border-indigo-100 dark:border-indigo-950 shadow-sm"
                  )}
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {notif.title}
                      </span>
                      <Badge variant={notifVariant[notif.type] as any} className="text-[8px] px-1 py-0 uppercase">
                        {notif.type}
                      </Badge>
                      {!notif.isRead && (
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-neutral-500 leading-relaxed">{notif.body}</p>
                    <span className="text-[9px] text-neutral-400 block pt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!notif.isRead && (
                      <button
                        onClick={() => markRead(notif.id)}
                        className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-green-600"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => dismiss(notif.id)}
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-500"
                      title="Dismiss"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right panel: Jobs & history */}
      <div className="space-y-6">
        {/* Scheduled crons */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-indigo-500" /> Active Jobs Scheduler
            </CardTitle>
            <Button
              size="sm"
              onClick={runScheduler}
              disabled={runningScheduler}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1"
            >
              <Play className="h-3 w-3" /> Run
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-3 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50 text-xs space-y-1"
              >
                <div className="flex justify-between items-center flex-wrap gap-1.5">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{job.name}</span>
                  <span className={cn("font-bold capitalize text-[10px]", statusColor[job.status])}>
                    {job.status}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 space-y-0.5">
                  <p>Schedule: {job.triggerName}</p>
                  <p>Run Count: {job.runCount}</p>
                  {job.nextRun && (
                    <p>Next Run: {new Date(job.nextRun).toLocaleTimeString()}</p>
                  )}
                  {job.errorMessage && (
                    <p className="text-red-500 font-semibold text-[9px] mt-1">{job.errorMessage}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Workflow activity logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-indigo-500" /> Workflow Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto space-y-3">
            {history.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">No activity history logged yet.</p>
            ) : (
              history.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50 space-y-1 text-xs"
                >
                  <div className="flex justify-between items-center flex-wrap gap-1.5">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{log.jobName}</span>
                    <Badge variant={log.status === "success" ? "success" : "danger"} className="text-[9px] px-1 py-0">
                      {log.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-neutral-400">
                    <span>{log.actionType} | {log.durationMs}ms</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
