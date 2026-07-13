import { json, handleError, requireAuthed } from "@/lib/api";
import { markInvoicePaid } from "@/lib/business";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuthed();
    const updated = await markInvoicePaid(params.id);
    return json({ invoice: updated }, 200);
  } catch (e) {
    return handleError(e);
  }
}
