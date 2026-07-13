import { prisma } from "@/lib/prisma";

export interface TaxRecordInput {
  taxYear: number;
  jurisdiction: string;
  type: string; // "Income" | "Expense" | "Donation" | "Investment"
  category: string;
  amount: number;
  currency: string;
  notes?: string;
  tags?: string;
  documentId?: string | null;
}

export interface TaxReportSummary {
  taxYear: number;
  jurisdiction: string;
  totalIncome: number;
  totalExpenses: number;
  totalDonations: number;
  netTaxableIncomeEstimate: number;
  checklist: {
    category: string;
    hasDocuments: boolean;
    recordsCount: number;
  }[];
}

// 1. Database Persistence Layer (CRUD)
export async function createTaxRecord(userId: string, input: TaxRecordInput, db = prisma) {
  return db.taxRecord.create({
    data: {
      userId,
      taxYear: input.taxYear,
      jurisdiction: input.jurisdiction,
      type: input.type,
      category: input.category,
      amount: input.amount,
      currency: input.currency,
      notes: input.notes || null,
      tags: input.tags || null,
      documentId: input.documentId || null,
    },
  });
}

export async function getTaxRecords(userId: string, taxYear?: number, db = prisma) {
  return db.taxRecord.findMany({
    where: {
      userId,
      ...(taxYear ? { taxYear } : {}),
    },
  });
}

export async function getTaxRecordById(userId: string, id: string, db = prisma) {
  return db.taxRecord.findFirst({
    where: { id, userId },
  });
}

export async function updateTaxRecord(
  userId: string,
  id: string,
  input: Partial<TaxRecordInput>,
  db = prisma
) {
  return db.taxRecord.update({
    where: { id },
    data: {
      taxYear: input.taxYear ?? undefined,
      jurisdiction: input.jurisdiction ?? undefined,
      type: input.type ?? undefined,
      category: input.category ?? undefined,
      amount: input.amount ?? undefined,
      currency: input.currency ?? undefined,
      notes: input.notes ?? undefined,
      tags: input.tags ?? undefined,
      documentId: input.documentId ?? undefined,
    },
  });
}

export async function deleteTaxRecord(userId: string, id: string, db = prisma) {
  await db.taxRecord.delete({ where: { id } });
  return true;
}

// 2. Report Aggregator & Calculations Service
export function compileTaxReport(taxYear: number, jurisdiction: string, records: any[]): TaxReportSummary {
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalDonations = 0;

  // Group records by category for document checking
  const categoryDocs: { [category: string]: { total: number; withDoc: number } } = {};

  for (const r of records) {
    const val = Number(r.amount);
    if (r.type === "Income") {
      totalIncome += val;
    } else if (r.type === "Expense") {
      totalExpenses += val;
    } else if (r.type === "Donation") {
      totalDonations += val;
    }

    const cat = r.category;
    if (!categoryDocs[cat]) {
      categoryDocs[cat] = { total: 0, withDoc: 0 };
    }
    categoryDocs[cat].total += 1;
    if (r.documentId) {
      categoryDocs[cat].withDoc += 1;
    }
  }

  const netTaxableIncomeEstimate = Math.max(0, totalIncome - totalExpenses - totalDonations);

  const checklist = Object.entries(categoryDocs).map(([category, stats]) => ({
    category,
    hasDocuments: stats.withDoc === stats.total,
    recordsCount: stats.total,
  }));

  return {
    taxYear,
    jurisdiction,
    totalIncome,
    totalExpenses,
    totalDonations,
    netTaxableIncomeEstimate,
    checklist,
  };
}

// 3. AI Tax Education Summarizer (respecting compliance)
export function generateAITaxExplanation(report: TaxReportSummary): string {
  const bulletChecklist = report.checklist
    .map((c) => `- **${c.category}**: ${c.recordsCount} items mapped (${c.hasDocuments ? "✓ All Documents Linked" : "⚠ Missing Documents"})`)
    .join("\n");

  return `### Tax Planning & Documentation Summary (Tax Year: ${report.taxYear})
Jurisdiction: **${report.jurisdiction}**

- **Estimated Total Income**: $${report.totalIncome.toLocaleString()}
- **Estimated Deductible Expenses**: $${report.totalExpenses.toLocaleString()}
- **Estimated Charitable Donations**: $${report.totalDonations.toLocaleString()}
- **Taxable Income Approximation**: $${report.netTaxableIncomeEstimate.toLocaleString()}

#### Document Audits Checklist
${bulletChecklist || "- No mapping records found. Please populate tax logs."}

*Notice: This summary is based on user-entered record mappings and represents a general education scenario estimation. This platform does NOT prepare or submit tax filings and does NOT provide professional accounting, legal, or regulated tax advice.*`;
}
