import { json, handleError, requireAuthed } from "@/lib/api";
import { getTaxRecords, createTaxRecord, compileTaxReport, generateAITaxExplanation } from "@/lib/tax";
import { z } from "zod";

const taxRecordInputSchema = z.object({
  taxYear: z.number().int().positive(),
  jurisdiction: z.string().min(1),
  type: z.enum(["Income", "Expense", "Donation", "Investment"]),
  category: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3),
  notes: z.string().optional(),
  tags: z.string().optional(),
  documentId: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const url = new URL(req.url);
    const taxYearStr = url.searchParams.get("taxYear");
    const taxYear = taxYearStr ? Number(taxYearStr) : new Date().getFullYear();

    const records = await getTaxRecords(user.id, taxYear);
    const report = compileTaxReport(taxYear, "General-Jurisdiction", records);
    const aiExplanation = generateAITaxExplanation(report);

    return json({ records, report, aiExplanation }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const parsed = taxRecordInputSchema.parse(body);

    const created = await createTaxRecord(user.id, parsed);
    return json({ record: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
