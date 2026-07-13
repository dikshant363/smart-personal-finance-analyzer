import { json, handleError, requireAuthed } from "@/lib/api";
import { AGENT_REGISTRY } from "@/lib/agent";

export async function GET() {
  try {
    await requireAuthed();
    return json({ agents: AGENT_REGISTRY }, 200);
  } catch (e) {
    return handleError(e);
  }
}
