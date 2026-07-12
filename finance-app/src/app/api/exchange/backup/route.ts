import { json, handleError, requireAuthed } from "@/lib/api";
import { createApplicationBackup } from "@/lib/exchange";

export async function GET(req: Request) {
  try {
    const user = await requireAuthed();
    const backup = await createApplicationBackup(user.id);

    return new Response(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename=finance_backup_${new Date().toISOString().slice(0, 10)}.json`,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
