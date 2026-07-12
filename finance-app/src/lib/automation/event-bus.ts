import { prisma } from "@/lib/prisma";
import { evaluateRulesForEvent } from "./rule-engine";

export type FinanceEventType =
  | "transaction.created"
  | "transaction.updated"
  | "budget.exceeded"
  | "budget.near_limit"
  | "goal.progress_changed"
  | "goal.completed"
  | "health.score_changed"
  | "recommendation.created"
  | "emergency.changed"
  | "recurring.due"
  | "forecast.risk_detected"
  | "document.processed"
  | "import.completed"
  | "export.completed";

export interface FinanceEvent {
  type: FinanceEventType;
  userId: string;
  payload: any;
}

export async function publishEvent(event: FinanceEvent): Promise<number> {
  // Save workflow log or run rules
  const startTime = Date.now();
  
  // Rule evaluations on event
  const actionsTriggered = await evaluateRulesForEvent(event);

  // Write history log for the event pipeline
  const duration = Date.now() - startTime;
  await prisma.workflowHistory.create({
    data: {
      userId: event.userId,
      jobName: `EventBus: ${event.type}`,
      actionType: "EVENT_DISPATCH",
      status: "success",
      durationMs: duration,
    },
  });

  return actionsTriggered;
}
