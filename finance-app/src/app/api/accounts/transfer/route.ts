import { json, handleError, requireAuthed } from "@/lib/api";
import { createAccountTransfer } from "@/lib/portfolio";
import { z } from "zod";

const transferSchema = z.object({
  fromAccountId: z.string(),
  toAccountId: z.string(),
  amount: z.number().positive(),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = transferSchema.parse(body);

    const result = await createAccountTransfer(
      user.id,
      data.fromAccountId,
      data.toAccountId,
      data.amount
    );

    return json({ result }, 200);
  } catch (e) {
    return handleError(e);
  }
}
