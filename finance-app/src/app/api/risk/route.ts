import { json, handleError, requireAuthed } from "@/lib/api";
import { getPolicies, createPolicy, calculateRiskGaps, generateAIRiskExplanation } from "@/lib/risk";
import { getNetWorthSummary } from "@/lib/asset";
import { z } from "zod";

const policyInputSchema = z.object({
  name: z.string().min(1).max(100),
  carrier: z.string().min(1),
  policyNumber: z.string().optional(),
  category: z.enum(["Life", "Health", "Disability", "Property", "Liability", "Auto", "Custom"]),
  coverageAmount: z.number().positive(),
  premiumAmount: z.number().nonnegative(),
  billingFrequency: z.enum(["Monthly", "Quarterly", "Annual", "One-Time"]),
  startDate: z.string().optional(),
  expirationDate: z.string().optional(),
  beneficiaries: z.string().optional(),
  notes: z.string().optional(),
  workspaceId: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireAuthed();
    const policies = await getPolicies(user.id);

    // Dynamic fallback metrics or query user income/expenses
    const annualIncome = 85000;
    const monthlyExpenses = 3500;

    const netWorth = await getNetWorthSummary(user.id);
    const summary = calculateRiskGaps(annualIncome, monthlyExpenses, policies, netWorth);
    const aiExplanation = generateAIRiskExplanation(summary);

    return json({ policies, summary, aiExplanation }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const parsed = policyInputSchema.parse(body);

    const created = await createPolicy(user.id, parsed);
    return json({ policy: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
