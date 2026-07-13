import { json, error, handleError, requireAuthed } from "@/lib/api";
import { getPolicyById, updatePolicy, deletePolicy } from "@/lib/risk";
import { z } from "zod";

const policyUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  carrier: z.string().optional(),
  policyNumber: z.string().optional(),
  category: z.enum(["Life", "Health", "Disability", "Property", "Liability", "Auto", "Custom"]).optional(),
  coverageAmount: z.number().positive().optional(),
  premiumAmount: z.number().nonnegative().optional(),
  billingFrequency: z.enum(["Monthly", "Quarterly", "Annual", "One-Time"]).optional(),
  startDate: z.string().optional(),
  expirationDate: z.string().optional(),
  beneficiaries: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["Active", "Lapsed", "Terminated"]).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const policy = await getPolicyById(user.id, params.id);
    if (!policy) return error("Insurance policy not found", 404);

    return json({ policy }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const parsed = policyUpdateSchema.parse(body);

    const updated = await updatePolicy(user.id, params.id, parsed);
    return json({ policy: updated }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    await deletePolicy(user.id, params.id);
    return json({ ok: true }, 200);
  } catch (e) {
    return handleError(e);
  }
}
