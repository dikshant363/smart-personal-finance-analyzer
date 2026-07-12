"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  ListTodo,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Target,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  RefreshCw,
} from "lucide-react";

type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: "high" | "medium" | "low";
  timestamp: string | Date;
  status: string;
  module: string;
  amount?: number;
};

type PlanningSuggestion = {
  type: string;
  title: string;
  body: string;
  actionText: string;
  associatedEventId?: string;
};

type AiExplanation = {
  eventId: string;
  whyItMatters: string;
  expectedImpact: string;
  preparationAdvice: string;
  suggestedAction: string;
};

export function TimelineClient({
  initialEvents,
  initialSuggestions,
  currency,
}: {
  initialEvents: TimelineEvent[];
  initialSuggestions: PlanningSuggestion[];
  currency: string;
}) {
  const [events, setEvents] = React.useState<TimelineEvent[]>(initialEvents);
  const [suggestions, setSuggestions] = React.useState<PlanningSuggestion[]>(initialSuggestions);
  const [activeView, setActiveView] = React.useState<"agenda" | "calendar" | "suggestions">("agenda");

  // Filters
  const [moduleFilter, setModuleFilter] = React.useState("all");
  const [priorityFilter, setPriorityFilter] = React.useState("all");

  // AI Explainer Modal
  const [selectedEvent, setSelectedEvent] = React.useState<TimelineEvent | null>(null);
  const [explanation, setExplanation] = React.useState<AiExplanation | null>(null);
  const [loadingExplainer, setLoadingExplainer] = React.useState(false);

  // Calendar logic
  const [currentDate, setCurrentDate] = React.useState(new Date());

  async function loadExplanation(event: TimelineEvent) {
    setSelectedEvent(event);
    setLoadingExplainer(true);
    setExplanation(null);
    try {
      const res = await fetch("/api/timeline/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      const data = await res.json();
      setExplanation(data.explanation);
    } finally {
      setLoadingExplainer(false);
    }
  }

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    if (moduleFilter !== "all" && e.module.toLowerCase() !== moduleFilter.toLowerCase()) return false;
    if (priorityFilter !== "all" && e.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;
    return true;
  });

  // Calendar grid math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const blanks = Array(firstDayIndex).fill(null);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...days];

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  const priorityColor = {
    high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    low: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  };

  const typeIcon: Record<string, React.ReactNode> = {
    Income: <TrendingUp className="h-4 w-4 text-green-500" />,
    Expense: <TrendingDown className="h-4 w-4 text-red-500" />,
    Recurring: <CalendarIcon className="h-4 w-4 text-indigo-500" />,
    GoalMilestone: <Target className="h-4 w-4 text-blue-500" />,
    GoalCompletion: <Target className="h-4 w-4 text-green-500" />,
    Recommendation: <Lightbulb className="h-4 w-4 text-amber-500" />,
    HealthChange: <Sparkles className="h-4 w-4 text-indigo-500" />,
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & View Nav */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl">
          <Button
            size="sm"
            variant={activeView === "agenda" ? "secondary" : "ghost"}
            onClick={() => setActiveView("agenda")}
            className="rounded-lg text-xs"
          >
            <ListTodo className="mr-1.5 h-3.5 w-3.5" /> Agenda View
          </Button>
          <Button
            size="sm"
            variant={activeView === "calendar" ? "secondary" : "ghost"}
            onClick={() => setActiveView("calendar")}
            className="rounded-lg text-xs"
          >
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5" /> Calendar Grid
          </Button>
          <Button
            size="sm"
            variant={activeView === "suggestions" ? "secondary" : "ghost"}
            onClick={() => setActiveView("suggestions")}
            className="rounded-lg text-xs"
          >
            <Lightbulb className="mr-1.5 h-3.5 w-3.5" /> Planning Insights
          </Button>
        </div>

        {activeView === "agenda" && (
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            <Select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="text-xs">
              <option value="all">All Engines</option>
              <option value="transactions">Transactions</option>
              <option value="recurring">Recurring</option>
              <option value="goals">Goals</option>
              <option value="healthscore">Health Score</option>
            </Select>

            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="text-xs">
              <option value="all">All Priorities</option>
              <option value="high">High Only</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
        )}
      </div>

      {/* Agenda list */}
      {activeView === "agenda" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Financial Activity Agenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredEvents.length === 0 ? (
              <EmptyState
                icon={<ListTodo className="h-8 w-8 text-neutral-400" />}
                title="Agenda is clear"
                description="No events found matching current criteria."
              />
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex justify-between items-start p-3.5 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 hover:shadow-sm transition-all"
                  >
                    <div className="flex gap-3">
                      <div className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-xl shrink-0 mt-0.5">
                        {typeIcon[ev.type] || <HelpCircle className="h-4 w-4 text-neutral-400" />}
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{ev.title}</span>
                          <Badge className={cn("text-[8px] px-1 py-0 border-none capitalize", priorityColor[ev.priority])}>
                            {ev.priority}
                          </Badge>
                          <Badge variant="default" className="text-[8px] px-1 py-0 bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-300">
                            {ev.module}
                          </Badge>
                        </div>
                        <p className="text-neutral-400 text-[10px]">{ev.description}</p>
                        <span className="text-[9px] text-neutral-400 block pt-1">
                          {new Date(ev.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      {ev.amount !== undefined && (
                        <span className={cn("font-bold text-xs", ev.type === "Income" ? "text-green-600" : "text-neutral-800 dark:text-neutral-200")}>
                          {ev.type === "Income" ? "+" : "-"}{formatMoney(ev.amount, currency)}
                        </span>
                      )}
                      <Button size="sm" variant="outline" onClick={() => loadExplanation(ev)}>
                        Explain
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {activeView === "calendar" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">{monthName}</CardTitle>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-neutral-400 mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1 border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900">
              {calendarCells.map((day, idx) => {
                if (day === null) return <div key={idx} className="h-20 bg-white dark:bg-neutral-950" />;

                // Find events on this date
                const dayEvents = events.filter((e) => {
                  const evDate = new Date(e.timestamp);
                  return evDate.getFullYear() === year && evDate.getMonth() === month && evDate.getDate() === day;
                });

                return (
                  <div key={idx} className="h-20 p-1.5 bg-white dark:bg-neutral-950 flex flex-col justify-between hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all border border-neutral-50 dark:border-neutral-900">
                    <span className="text-xs font-semibold text-neutral-400">{day}</span>
                    <div className="space-y-0.5 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => loadExplanation(ev)}
                          className={cn(
                            "text-[8px] truncate px-1 rounded cursor-pointer leading-relaxed",
                            ev.type === "Income" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" :
                            ev.type === "Expense" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" :
                            "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                          )}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[7px] text-neutral-400 block font-semibold">+{dayEvents.length - 2} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions Tab */}
      {activeView === "suggestions" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-amber-500" /> Active Planning Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-6">All set! No active suggestions.</p>
            ) : (
              suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50 space-y-2 flex justify-between items-start gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                      {sug.title}
                    </span>
                    <p className="text-neutral-500 leading-relaxed">{sug.body}</p>
                  </div>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 mt-0.5">
                    {sug.actionText}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Explanation Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onClose={() => setSelectedEvent(null)} title={selectedEvent.title}>
          {loadingExplainer ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
              <p className="text-xs text-neutral-400">Loading AI financial explanation...</p>
            </div>
          ) : explanation ? (
            <div className="space-y-4 text-xs pr-1">
              <div>
                <span className="font-semibold text-neutral-500 block mb-1">Why it matters</span>
                <p className="text-neutral-800 dark:text-neutral-200 bg-neutral-50/50 dark:bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                  {explanation.whyItMatters}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-neutral-500 block mb-1">Expected Impact</span>
                  <p className="text-neutral-800 dark:text-neutral-200 bg-neutral-50/50 dark:bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                    {explanation.expectedImpact}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-neutral-500 block mb-1">Preparation Advice</span>
                  <p className="text-neutral-800 dark:text-neutral-200 bg-neutral-50/50 dark:bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                    {explanation.preparationAdvice}
                  </p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-neutral-500 block mb-1">Suggested Action</span>
                <p className="text-neutral-800 dark:text-neutral-200 bg-neutral-50/50 dark:bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                  {explanation.suggestedAction}
                </p>
              </div>

              <div className="flex justify-end pt-2 border-t">
                <Button size="sm" onClick={() => setSelectedEvent(null)}>Close</Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 py-6 text-center">Failed to load explanation.</p>
          )}
        </Dialog>
      )}
    </div>
  );
}
