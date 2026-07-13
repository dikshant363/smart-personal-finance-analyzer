import { json, handleError, requireAuthed } from "@/lib/api";
import { getInstalledExtensions, installExtension } from "@/lib/sdk";
import { z } from "zod";

const manifestInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  author: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.string()),
  webhookUrl: z.string().url().optional(),
});

export async function GET() {
  try {
    const user = await requireAuthed();
    const list = await getInstalledExtensions(user.id);
    return json({ extensions: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const parsed = manifestInputSchema.parse(body);

    const created = await installExtension(user.id, parsed);
    return json({ extension: created }, 201);
  } catch (e) {
    return handleError(e);
  }
}
