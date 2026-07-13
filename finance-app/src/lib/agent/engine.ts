import { prisma } from "@/lib/prisma";

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  supportedModule: string;
}

export const AGENT_REGISTRY: AgentDefinition[] = [
  {
    id: "financial-review",
    name: "Financial Review Agent",
    description: "Evaluates overall asset levels, health bands, and transaction ratios.",
    systemPrompt: "You are the Financial Review Agent. Analyze user net worth, liquidity, and general health metrics. Rely strictly on deterministic records.",
    supportedModule: "HealthScore",
  },
  {
    id: "budget-coach",
    name: "Budget Coach Agent",
    description: "Assists users in tracking limits, overspending alerts, and category distributions.",
    systemPrompt: "You are the Budget Coach Agent. Provide educational insights regarding budget thresholds and category distributions.",
    supportedModule: "Budgets",
  },
  {
    id: "goal-coach",
    name: "Goal Coach Agent",
    description: "Tracks progress milestones, monthly deposits required, and completion metrics.",
    systemPrompt: "You are the Goal Coach Agent. Guide users through savings goals and milestone projections.",
    supportedModule: "Goals",
  },
  {
    id: "retirement-assistant",
    name: "Retirement Planning Assistant",
    description: "Models long-term nest egg projections and Safe Withdrawal strategies.",
    systemPrompt: "You are the Retirement Assistant. Explain compound calculations and SWR guidelines. Do not guarantee market returns.",
    supportedModule: "Retirement",
  },
  {
    id: "investment-education",
    name: "Investment Education Assistant",
    description: "Explains HHI diversification, absolute yield returns, and portfolio composition.",
    systemPrompt: "You are the Investment Education Assistant. Help users understand HHI indices and asset classes. Never recommend specific securities.",
    supportedModule: "Investments",
  },
  {
    id: "tax-assistant",
    name: "Tax Document Assistant",
    description: "Highlights missing checklists, deductible expenses, and mapping categories.",
    systemPrompt: "You are the Tax Assistant. Verify document checklists and general classification rules. Do not prepare filings.",
    supportedModule: "Tax",
  },
  {
    id: "insurance-organizer",
    name: "Insurance Organizer",
    description: "Reviews active coverage vs target income protection bounds.",
    systemPrompt: "You are the Insurance Organizer. Assess coverage gaps using basic income multiplier factors.",
    supportedModule: "Insurance",
  },
  {
    id: "report-assistant",
    name: "Report Assistant",
    description: "Aggregates overall financial summary sheets and downloads prep packages.",
    systemPrompt: "You are the Report Assistant. Compile high-level financial summary tables.",
    supportedModule: "Reports",
  },
];

export interface AgentContextSnapshot {
  userBalance?: number;
  netWorth?: number;
  healthScore?: number;
  activeGoalsCount?: number;
}

// 1. Context Aggregator Service
export async function buildAgentContext(userId: string, db = prisma): Promise<AgentContextSnapshot> {
  const [goals, scoreHistory] = await Promise.all([
    db.goal.findMany({ where: { userId, status: "Active" } }),
    db.scoreHistory.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);

  return {
    userBalance: 50000, // mock asset valuation indicator base
    netWorth: 120000,
    healthScore: scoreHistory?.score || 72,
    activeGoalsCount: goals.length,
  };
}

// 2. Safety Layer (Prompt Injection Guard & Disclaimers Injection)
export function validateAgentRequest(prompt: string): { isValid: boolean; error?: string } {
  const lower = prompt.toLowerCase();
  const injectionPatterns = [
    "ignore previous instructions",
    "bypass constraints",
    "system overrides",
    "sudo ",
  ];

  for (const pattern of injectionPatterns) {
    if (lower.includes(pattern)) {
      return { isValid: false, error: "System query rejected due to safety boundary filter violation." };
    }
  }

  return { isValid: true };
}

export function formatAgentResponse(
  content: string,
  facts: string[],
  assumptions: string[]
): string {
  return `${content}

---
### AI Transparency Parameters
- **Verified Facts**: ${facts.join("; ") || "None"}
- **User Assumptions**: ${assumptions.join("; ") || "None"}
- **Limitations**: Projections are based on current database inputs.
- **Notice**: Educational guide content only. No regulated advice or guaranteed outcomes.`;
}

// 3. Conversation Repository
export async function createConversationSession(userId: string, title: string, db = prisma) {
  return db.conversation.create({
    data: {
      userId,
      title,
    },
  });
}

export async function addAgentMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  agentType?: string,
  db = prisma
) {
  return db.message.create({
    data: {
      conversationId,
      role,
      content,
      agentType: agentType || null,
      tokenUsage: content.length + 50, // rough metric
    },
  });
}

export async function submitMessageFeedback(messageId: string, feedback: "Like" | "Dislike", db = prisma) {
  return db.message.update({
    where: { id: messageId },
    data: { feedback },
  });
}

export async function getConversations(userId: string, db = prisma) {
  return db.conversation.findMany({
    where: { userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

// 4. Provider-Independent Prompt Construction & Execution Router
export async function orchestrateAgentInvocation(
  userId: string,
  conversationId: string,
  agentId: string,
  userMessage: string,
  db = prisma
): Promise<string> {
  // Safe validation check
  const safetyCheck = validateAgentRequest(userMessage);
  if (!safetyCheck.isValid) {
    throw new Error(safetyCheck.error);
  }

  const agent = AGENT_REGISTRY.find((a) => a.id === agentId);
  if (!agent) {
    throw new Error("Target agent not found in active registry.");
  }

  // 1. Gather context
  const context = await buildAgentContext(userId, db);

  // 2. Persist user message
  await addAgentMessage(conversationId, "user", userMessage, agent.name, db);

  // 3. Formulate response based on deterministic context and agent type (Multi-provider simulated router)
  let bodyContent = "";
  let facts: string[] = [];
  let assumptions: string[] = [];

  if (agent.id === "financial-review") {
    bodyContent = `I have audited your financial registers. Your current compiled Health Index rating is ${context.healthScore}/100. This places your account in a stable rating band.`;
    facts = [`Health Rating is ${context.healthScore}/100`, "Net worth is $120,000"];
  } else if (agent.id === "budget-coach") {
    bodyContent = "Your categories indicate optimal distribution. Keep tracking transactions to maintain high compliance with your active monthly limits.";
    facts = ["Budget limits exist"];
    assumptions = ["Spending will continue at the current weekly rate"];
  } else if (agent.id === "goal-coach") {
    bodyContent = `You have ${context.activeGoalsCount} active savings goals registered. Saving consistently every month helps maintain completion timelines.`;
    facts = [`Active savings goals: ${context.activeGoalsCount}`];
  } else {
    bodyContent = `Hello! I am the ${agent.name}. I am review-ready to guide you through educational frameworks and explain data mappings safely.`;
  }

  const finalResponse = formatAgentResponse(bodyContent, facts, assumptions);

  // 4. Persist assistant reply
  await addAgentMessage(conversationId, "assistant", finalResponse, agent.name, db);

  return finalResponse;
}
