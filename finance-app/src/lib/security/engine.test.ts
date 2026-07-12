import { describe, it, expect, vi, beforeEach } from "vitest";
import { sanitizeInputString, verifyWorkspaceResourceAccess } from "./engine";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    workspaceMember: {
      findUnique: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
  },
}));

describe("Zero Trust Security & Privacy Platform (ZTSP) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("strips harmful script tags from user inputs", () => {
    const input = "<script>alert('hack')</script>Clean Value";
    const sanitized = sanitizeInputString(input);
    expect(sanitized).toBe("Clean Value");
  });

  it("permits access when workspaceId is null (personal scope)", async () => {
    const allowed = await verifyWorkspaceResourceAccess("u1", null, prisma);
    expect(allowed).toBe(true);
  });

  it("denies access and logs violation when user is not a member of the workspace", async () => {
    (prisma.workspaceMember.findUnique as any).mockResolvedValueOnce(null);

    const allowed = await verifyWorkspaceResourceAccess("u1", "ws123", prisma);

    expect(allowed).toBe(false);
    expect(prisma.activityLog.create).toHaveBeenCalledWith({
      data: {
        workspaceId: "ws123",
        userId: "u1",
        action: "SecurityViolation",
        details: "Unauthorized attempt to access workspace resource.",
      },
    });
  });
});
