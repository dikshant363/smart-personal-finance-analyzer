import { prisma } from "@/lib/prisma";
import { getDebtOverview, calculateDebtHealthScore } from "@/lib/debt";
import { getNetWorthSummary } from "@/lib/asset";
import { getPortfoliosSummary } from "@/lib/portfolio";
import { formatMoney } from "@/lib/currency";

export interface CopilotContext {
  netWorth: number;
  totalAssets: number;
  totalDebt: number;
  debtHealthScore: number;
  portfoliosCount: number;
  currency: string;
}

export interface CopilotMessage {
  id: string;
  role: string;
  content: string;
  feedback: string | null;
  createdAt: Date;
}

// Multi-LLM provider abstraction interface
export interface LlmProvider {
  generate(prompt: string, context: CopilotContext): Promise<string>;
}

// 1. Mock Gemini Provider Adapter
export class MockGeminiProvider implements LlmProvider {
  async generate(prompt: string, context: CopilotContext): Promise<string> {
    const q = prompt.toLowerCase();

    if (q.includes("retirement") || q.includes("savings") || q.includes("ppf") || q.includes("epf")) {
      return `For long-term wealth creation, our core engines recommend maximizing your Public Provident Fund (PPF) and Employees' Provident Fund (EPF) contributions to utilize Section 80C exemptions. Consider systematic investment plans (SIPs) in diversified mutual funds for inflation-beating equity exposure. Current net worth: **${formatMoney(context.netWorth, context.currency)}**.`;
    }

    if (q.includes("payment") || q.includes("transfer") || q.includes("upi")) {
      return `Your digital payment transactions are routed through UPI and IMPS bank transfer protocols. UPI remains the primary transactional driver. Tips: Configure your UPI autopey thresholds inside recurring settings to prevent bank account overdrawing.`;
    }

    if (q.includes("health") || q.includes("score")) {
      return `Based on our platform-wide deterministic engines, your current Financial Health Score is **${context.debtHealthScore}/100**. This rating factors in debt liabilities (like credit card EMI and housing loans) relative to your monthly income. Fact: Your leverage ratios are stable. Recommendations: Continue checking budget margins regularly.`;
    }

    if (q.includes("net worth") || q.includes("assets") || q.includes("wealth")) {
      return `According to the Net Worth Engine, your total assets stand at **${formatMoney(context.totalAssets, context.currency)}**, with outstanding debt liabilities of **${formatMoney(context.totalDebt, context.currency)}**. Converted Net Worth sum = **${formatMoney(context.netWorth, context.currency)}**. Lakh and Crore formatting conforms to standard Indian numbering conventions.`;
    }

    if (q.includes("portfolio") || q.includes("accounts")) {
      return `Our Account Engine tracks **${context.portfoliosCount}** distinct portfolio group vaults (Fixed Deposits, Mutual Funds, Equities, and Savings Accounts) for your user profile. Safe cash transfers between accounts are logged. Facts: Assets are securely partitioned. Recommendations: Allocate cash reserves to your family workspace hubs to support shared budget goals.`;
    }

    // Default catch-all
    return `Namaste! I am your Antigravity AI Financial Copilot. I can analyze and explain data calculated by our core engines:
- **Net Worth**: ${formatMoney(context.netWorth, context.currency)} (Assets: ${formatMoney(context.totalAssets, context.currency)})
- **Debt**: ${formatMoney(context.totalDebt, context.currency)} (Score: ${context.debtHealthScore}/100)
- **Accounts**: ${context.portfoliosCount} active portfolio vaults.
What specific financial insights regarding your SIPs, PPF contributions, or UPI budget questions can I explain for you today?`;
  }
}

export class CopilotEngine {
  private provider: LlmProvider;

  constructor(provider: LlmProvider = new MockGeminiProvider()) {
    this.provider = provider;
  }

  async buildContext(userId: string): Promise<CopilotContext> {
    const [debtOverview, debtScore, netWorth, portfolios, profile] = await Promise.all([
      getDebtOverview(userId),
      calculateDebtHealthScore(userId),
      getNetWorthSummary(userId),
      getPortfoliosSummary(userId),
      prisma.profile.findUnique({ where: { userId } }),
    ]);

    return {
      netWorth: netWorth.netWorth,
      totalAssets: netWorth.totalAssets,
      totalDebt: debtOverview.totalDebt,
      debtHealthScore: debtScore,
      portfoliosCount: portfolios.length,
      currency: profile?.currency ?? "USD",
    };
  }

  async submitMessage(
    conversationId: string,
    userId: string,
    prompt: string
  ): Promise<CopilotMessage[]> {
    // 1. Log User Message
    await prisma.message.create({
      data: {
        conversationId,
        role: "user",
        content: prompt,
      },
    });

    // 2. Fetch context
    const context = await this.buildContext(userId);

    // 3. Generate explanation using LLM provider
    const content = await this.provider.generate(prompt, context);

    // 4. Log assistant message
    await prisma.message.create({
      data: {
        conversationId,
        role: "assistant",
        content,
      },
    });

    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }

  async getConversationHistory(conversationId: string): Promise<CopilotMessage[]> {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }
}
