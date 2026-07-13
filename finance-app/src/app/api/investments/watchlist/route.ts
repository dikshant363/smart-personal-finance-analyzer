import { json, error, handleError, requireAuthed } from "@/lib/api";
import { getWatchlistItems, createWatchlistItem, deleteWatchlistItem } from "@/lib/investment";
import { z } from "zod";

const watchlistInputSchema = z.object({
  name: z.string().min(1).max(100),
  ticker: z.string().optional(),
  targetPrice: z.number().positive().optional(),
  priority: z.enum(["High", "Medium", "Low"]).optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireAuthed();
    const list = await getWatchlistItems(user.id);
    return json({ watchlist: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const parsed = watchlistInputSchema.parse(body);

    const created = await createWatchlistItem(user.id, parsed);
    return json({ item: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuthed();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return error("Missing item ID", 400);

    const ok = await deleteWatchlistItem(user.id, id);
    if (!ok) return error("Watchlist item not found or unauthorized", 404);

    return json({ ok: true }, 200);
  } catch (e) {
    return handleError(e);
  }
}
