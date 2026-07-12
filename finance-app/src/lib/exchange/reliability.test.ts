import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateDisasterRecoveryIntegrity } from "./reliability";
import { prisma } from "../prisma";
import { createApplicationBackup } from "./backup";

vi.mock("../prisma", () => ({
  prisma: {},
}));

vi.mock("./backup", () => ({
  createApplicationBackup: vi.fn(),
}));

describe("Reliability & Disaster Recovery (RDR) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates recovery report with clean complete payload", async () => {
    const cleanBackup = {
      version: "1.0",
      transactions: [{ id: "tx1", amount: 10 }],
    };
    (createApplicationBackup as any).mockResolvedValueOnce(cleanBackup);

    const report = await validateDisasterRecoveryIntegrity("u1", prisma);

    expect(report.isRecoveryValid).toBe(true);
    expect(report.checks.credentialsExclusion).toBe(true);
  });

  it("invalidates recovery if sensitive hash credentials leak", async () => {
    const dirtyBackup = {
      version: "1.0",
      transactions: [],
      users: [{ email: "hacker@domain.com", passwordHash: "secretHashVal" }],
    };
    (createApplicationBackup as any).mockResolvedValueOnce(dirtyBackup);

    const report = await validateDisasterRecoveryIntegrity("u1", prisma);

    expect(report.isRecoveryValid).toBe(false);
    expect(report.checks.credentialsExclusion).toBe(false);
  });
});
