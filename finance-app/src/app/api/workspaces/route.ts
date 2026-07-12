import { json, error, handleError, requireAuthed } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getWorkspacesSummary, createWorkspace } from "@/lib/workspace/engine";
import { z } from "zod";

const createWorkspaceSchema = z.object({
  name: z.string(),
  type: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();

    let list = await getWorkspacesSummary(user.id);

    // Seed default workspace if none exist
    if (list.length === 0) {
      await createWorkspace(user.id, "Household Core Space", "Family");
      list = await getWorkspacesSummary(user.id);
    }

    return json({ workspaces: list }, 200);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const data = createWorkspaceSchema.parse(body);

    const ws = await createWorkspace(user.id, data.name, data.type ?? "Family");

    return json({ workspace: ws }, 201);
  } catch (e) {
    return handleError(e);
  }
}
