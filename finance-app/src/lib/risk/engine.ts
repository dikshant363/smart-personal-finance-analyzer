import { prisma } from "@/lib/prisma";

export interface PolicyInput {
  name: string;
  carrier: string;
  policyNumber?: string;
  category: string; // "Life" | "Health" | "Disability" | "Property" | "Liability" | "Auto" | "Custom"
  coverageAmount: number;
  premiumAmount: number;
  billingFrequency: string; // "Monthly" | "Quarterly" | "Annual" | "One-Time"
  startDate?: string | Date;
  expirationDate?: string | Date;
  beneficiaries?: string;
  notes?: string;
  workspaceId?: string;
}

export interface RiskProfileSummary {
  annualIncome: number;
  monthlyExpenses: number;
  lifeInsuranceRecommended: number;
  lifeInsuranceActual: number;
  lifeInsuranceGap: number;
  disabilityRecommended: number;
  disabilityActual: number;
  disabilityGap: number;
  emergencyFundRecommended: number;
  emergencyFundActual: number;
  emergencyFundGap: number;
}

// 1. Calculations & Gap Estimator Service
export function calculateRiskGaps(
  annualIncome: number,
  monthlyExpenses: number,
  policies: any[],
  netWorthSummary: any = { liquidAssets: 0 }
): RiskProfileSummary {
  // Recommendations logic
  const lifeInsuranceRecommended = annualIncome * 10;
  const disabilityRecommended = (annualIncome / 12) * 0.6; // 60% of monthly income
  const emergencyFundRecommended = monthlyExpenses * 6; // 6 months expenses

  // Actual values from policies
  let lifeInsuranceActual = 0;
  let disabilityActual = 0;

  for (const p of policies) {
    if (p.status !== "Active") continue;
    const cov = Number(p.coverageAmount);
    if (p.category === "Life") {
      lifeInsuranceActual += cov;
    } else if (p.category === "Disability") {
      disabilityActual += cov;
    }
  }

  // Emergency fund actual is the liquid assets/savings
  const emergencyFundActual = netWorthSummary.liquidAssets || 0;

  return {
    annualIncome,
    monthlyExpenses,
    lifeInsuranceRecommended,
    lifeInsuranceActual,
    lifeInsuranceGap: Math.max(0, lifeInsuranceRecommended - lifeInsuranceActual),
    disabilityRecommended: Math.round(disabilityRecommended),
    disabilityActual,
    disabilityGap: Math.max(0, Math.round(disabilityRecommended) - disabilityActual),
    emergencyFundRecommended,
    emergencyFundActual,
    emergencyFundGap: Math.max(0, emergencyFundRecommended - emergencyFundActual),
  };
}

// 2. CRUD Operations
export async function createPolicy(userId: string, input: PolicyInput, db = prisma) {
  return db.insurancePolicy.create({
    data: {
      userId,
      name: input.name,
      carrier: input.carrier,
      policyNumber: input.policyNumber || null,
      category: input.category,
      coverageAmount: input.coverageAmount,
      premiumAmount: input.premiumAmount,
      billingFrequency: input.billingFrequency,
      startDate: input.startDate ? new Date(input.startDate) : null,
      expirationDate: input.expirationDate ? new Date(input.expirationDate) : null,
      beneficiaries: input.beneficiaries || null,
      notes: input.notes || null,
      workspaceId: input.workspaceId || null,
    },
  });
}

export async function getPolicies(userId: string, db = prisma) {
  return db.insurancePolicy.findMany({
    where: { userId },
  });
}

export async function getPolicyById(userId: string, id: string, db = prisma) {
  return db.insurancePolicy.findFirst({
    where: { id, userId },
  });
}

export async function updatePolicy(
  userId: string,
  id: string,
  input: Partial<PolicyInput & { status: string }>,
  db = prisma
) {
  return db.insurancePolicy.update({
    where: { id },
    data: {
      name: input.name ?? undefined,
      carrier: input.carrier ?? undefined,
      policyNumber: input.policyNumber ?? undefined,
      category: input.category ?? undefined,
      coverageAmount: input.coverageAmount ?? undefined,
      premiumAmount: input.premiumAmount ?? undefined,
      billingFrequency: input.billingFrequency ?? undefined,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      expirationDate: input.expirationDate ? new Date(input.expirationDate) : undefined,
      beneficiaries: input.beneficiaries ?? undefined,
      notes: input.notes ?? undefined,
      status: input.status ?? undefined,
    },
  });
}

export async function deletePolicy(userId: string, id: string, db = prisma) {
  await db.insurancePolicy.delete({ where: { id } });
  return true;
}

// 3. AI Safety Advice Explanation (Educational only)
export function generateAIRiskExplanation(summary: RiskProfileSummary): string {
  const lifeGapMsg = summary.lifeInsuranceGap > 0
    ? `Observation: Life insurance coverage is $${summary.lifeInsuranceActual.toLocaleString()} vs recommended target of $${summary.lifeInsuranceRecommended.toLocaleString()} (10x income). You have a projected protection deficit gap of $${summary.lifeInsuranceGap.toLocaleString()}.`
    : `Observation: Your life insurance coverage of $${summary.lifeInsuranceActual.toLocaleString()} satisfies the standard recommendation threshold of $${summary.lifeInsuranceRecommended.toLocaleString()}.`;

  const disabilityGapMsg = summary.disabilityGap > 0
    ? `Observation: Disability coverage is $${summary.disabilityActual.toLocaleString()} vs recommended monthly protection level of $${summary.disabilityRecommended.toLocaleString()} (60% monthly income). Gap deficit: $${summary.disabilityGap.toLocaleString()}/mo.`
    : `Observation: Disability protection meets the recommended safety baseline.`;

  return `### Financial Protection & Risk Assessment
A general review of protection plans shows the following alignment parameters:

- **Life Insurance**: ${lifeGapMsg}
- **Income Protection**: ${disabilityGapMsg}
- **Resilience Fund (Liquid Emergency Reserves)**: Recommended: $${summary.emergencyFundRecommended.toLocaleString()} (6 months expenses). Actual reserves: $${summary.emergencyFundActual.toLocaleString()}.

*Disclaimer: This analysis presents standard educational baseline indicators. This tool does not issue insurance contracts, perform professional underwriting, or offer regulated insurance or estate planning recommendations. Seek professional guidance for comprehensive estate policies.*`;
}
