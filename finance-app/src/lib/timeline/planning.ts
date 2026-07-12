import { TimelineEvent } from "./aggregator";

export interface PlanningSuggestion {
  type: "defer_spending" | "reschedule_goal" | "prepare_bill" | "increase_savings";
  title: string;
  body: string;
  actionText: string;
  associatedEventId?: string;
}

export function generatePlanningSuggestions(
  events: TimelineEvent[],
  monthlyIncome = 3000
): PlanningSuggestion[] {
  const suggestions: PlanningSuggestion[] = [];

  // Check 1: large recurring expense upcoming
  const largeBills = events.filter(
    (e) => e.type === "Recurring" && e.status === "Scheduled" && e.amount && e.amount > 200
  );

  if (largeBills.length > 0) {
    const nextBill = largeBills[0];
    suggestions.push({
      type: "defer_spending",
      title: `Plan for Upcoming Bill: ${nextBill.title}`,
      body: `Your scheduled payment of ${nextBill.amount} is due soon on ${nextBill.timestamp.toLocaleDateString()}. We suggest limiting discretionary spending this week.`,
      actionText: "Review Budget Allocation",
      associatedEventId: nextBill.id,
    });
  }

  // Check 2: goal deadlines upcoming
  const goalsUpcoming = events.filter((e) => e.type === "GoalMilestone" && e.status === "Upcoming");
  if (goalsUpcoming.length > 0) {
    suggestions.push({
      type: "reschedule_goal",
      title: "Boost Goal Contributions",
      body: "An active goal target deadline is approaching. Consider increasing your weekly savings contribution by 10% to stay on track.",
      actionText: "Adjust Goal Contributions",
      associatedEventId: goalsUpcoming[0].id,
    });
  }

  // Check 3: low savings warning
  const healthChanges = events.filter((e) => e.type === "HealthChange");
  if (healthChanges.length > 0 && healthChanges[0].priority === "high") {
    suggestions.push({
      type: "increase_savings",
      title: "Optimize Emergency Reserve",
      body: "Your health rating snapshot is low. Reschedule minor subscription dates or transfer unused margins to emergency fund.",
      actionText: "Transfer Funds",
    });
  }

  return suggestions;
}

export interface AiEventExplanation {
  eventId: string;
  whyItMatters: string;
  expectedImpact: string;
  preparationAdvice: string;
  suggestedAction: string;
}

export function getAiEventExplanation(event: TimelineEvent): AiEventExplanation {
  let whyItMatters = "This represents a recurring commitment or transaction that affects your weekly liquid margins.";
  let expectedImpact = "Reduces disposable cash margins for the current budget cycle.";
  let preparationAdvice = "Check that your checking account holds sufficient funds to cover auto-debits.";
  let suggestedAction = "Ensure auto-pay is enabled or set a calendar reminder.";

  if (event.type === "Income") {
    whyItMatters = "Income is the core driver of your financial health, restoring cash reserves and savings progress.";
    expectedImpact = "Increases cash flow and improves savings ratios.";
    preparationAdvice = "Earmark at least 20% of this incoming deposit for goal targets immediately.";
    suggestedAction = "Auto-transfer to savings account.";
  } else if (event.type === "Recurring") {
    whyItMatters = "Recurring transactions represent fixed overhead. Keeping fixed costs low is key to financial flexibility.";
    expectedImpact = "Subtracts fixed amount on schedule.";
    preparationAdvice = `Allocate ${event.amount || 50} in your weekly planning to avoid overdrafts.`;
    suggestedAction = "Cancel if unused, or convert to annual billing for discount options.";
  } else if (event.type === "HealthChange") {
    whyItMatters = "Your Health Score represents holistic financial resilience. A change indicates shifts in saving/spending ratio.";
    expectedImpact = "Affects loan viability rates and general budget safety.";
    preparationAdvice = "Audit the last 30 days of transactions for categories that overshot targets.";
    suggestedAction = "Reduce discretionary limits by 15%.";
  }

  return {
    eventId: event.id,
    whyItMatters,
    expectedImpact,
    preparationAdvice,
    suggestedAction,
  };
}
