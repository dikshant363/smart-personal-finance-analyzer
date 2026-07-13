import { prisma } from "@/lib/prisma";
import { eventBus, DomainEvent } from "@/lib/event-bus";

export interface WorkflowCondition {
  field: string;
  operator: "equals" | "greater_than" | "less_than";
  value: any;
}

export interface WorkflowAction {
  type: "send_notification" | "create_reminder" | "create_timeline";
  params: any;
}

export function evaluateCondition(payload: any, condition: WorkflowCondition): boolean {
  const val = payload[condition.field];
  if (val === undefined) return false;

  if (condition.operator === "equals") {
    return val === condition.value;
  }
  if (condition.operator === "greater_than") {
    return Number(val) > Number(condition.value);
  }
  if (condition.operator === "less_than") {
    return Number(val) < Number(condition.value);
  }
  return false;
}

export async function registerWorkflowTriggerHook(db = prisma) {
  // Listen to all events published to eventBus
  eventBus.subscribe("transaction_created", async (event: DomainEvent) => {
    const workflows = await db.automationWorkflow.findMany({
      where: { triggerType: "transaction_created", status: "Enabled" },
    });

    for (const workflow of workflows) {
      try {
        const conditions: WorkflowCondition[] = JSON.parse(workflow.conditions);
        const actions: WorkflowAction[] = JSON.parse(workflow.actions);

        // Check if all conditions pass
        const match = conditions.every((cond) => evaluateCondition(event.payload, cond));

        if (match) {
          // Perform Actions
          for (const action of actions) {
            if (action.type === "create_reminder") {
              await db.notification.create({
                data: {
                  userId: workflow.userId,
                  title: `[Workflow Alert] ${workflow.name}`,
                  body: `Auto reminder triggered for ${event.type}. Detail: ${JSON.stringify(action.params)}`,
                  type: "warning",
                },
              });
            }
          }

          // Record execution
          await db.workflowExecution.create({
            data: {
              workflowId: workflow.id,
              status: "Success",
              details: `Executed successfully for event ${event.id}`,
            },
          });
        }
      } catch (err: any) {
        await db.workflowExecution.create({
          data: {
            workflowId: workflow.id,
            status: "Failed",
            details: err.message || "Unknown execution error",
          },
        });
      }
    }
  });
}
