import { json, handleError, requireAuthed } from "@/lib/api";
import { getBankConnections, connectBankingInstitution } from "@/lib/banking";
import { z } from "zod";

const connectSchema = z.object({
  institutionId: z.string().min(1),
  publicToken: z.string().min(1),
});

export async function GET() {
  try {
    const user = await requireAuthed();
    const connections = await getBankConnections(user.id);
    return json({ connections }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const { institutionId, publicToken } = connectSchema.parse(body);

    const created = await connectBankingInstitution(user.id, institutionId, publicToken);
    return json({ connection: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
