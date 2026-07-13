import { json, handleError, requireAuthed } from "@/lib/api";
import { toggleExtensionStatus, uninstallExtension } from "@/lib/sdk";
import { z } from "zod";

const updateExtensionSchema = z.object({
  status: z.enum(["Enabled", "Disabled"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthed();
    const body = await req.json();
    const { status } = updateExtensionSchema.parse(body);

    const updated = await toggleExtensionStatus(user.id, params.id, status);
    return json({ extension: updated }, 200);
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
    await uninstallExtension(user.id, params.id);
    return json({ ok: true }, 200);
  } catch (e) {
    return handleError(e);
  }
}
