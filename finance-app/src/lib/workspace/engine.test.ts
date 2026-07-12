import { describe, it, expect, vi, beforeEach } from "vitest";
import { getWorkspacesSummary, createWorkspace, inviteWorkspaceMember, respondToInvitation, checkWorkspacePermission } from "./engine";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    workspace: {
      create: vi.fn().mockResolvedValue({ id: "ws1" }),
    },
    workspaceMember: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    workspaceInvitation: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
  },
}));

describe("Multi-User Collaboration & Household Finance Platform (MUCHFP) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creating a workspace sets creator as owner member", async () => {
    const mockTx = vi.fn().mockImplementation(async (cb) => cb(prisma));
    (prisma as any).$transaction = mockTx;

    const ws = await createWorkspace("u1", "My Workspace");

    expect(ws.id).toBe("ws1");
    expect(prisma.workspaceMember.create).toHaveBeenCalledWith({
      data: {
        workspaceId: "ws1",
        userId: "u1",
        role: "Owner",
      },
    });
  });

  it("restricts invitation creation to owners/admins", async () => {
    // Member has Viewer role (not owner/admin)
    (prisma.workspaceMember.findUnique as any).mockResolvedValueOnce({
      workspaceId: "ws1",
      userId: "u1",
      role: "Viewer",
    });

    await expect(
      inviteWorkspaceMember("ws1", "friend@email.com", "Editor", "u1")
    ).rejects.toThrow("Insufficient permission");
  });

  it("checks permissions properly based on member roles", async () => {
    (prisma.workspaceMember.findUnique as any)
      .mockResolvedValueOnce({ role: "Owner" }) // call 1: admin
      .mockResolvedValueOnce({ role: "Viewer" }); // call 2: edit

    const adminOk = await checkWorkspacePermission("ws1", "u1", "admin");
    const editOk = await checkWorkspacePermission("ws1", "u2", "edit");

    expect(adminOk).toBe(true);
    expect(editOk).toBe(false);
  });
});
