import { describe, it, expect, vi, beforeEach } from "vitest";
import { runPlatformSelfDiagnostic } from "./engine";
import { prisma } from "../prisma";

vi.mock("../prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

describe("Quality Engineering & Test Automation Platform (QETAP) Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns Healthy status when database responds successfully", async () => {
    (prisma.$queryRaw as any).mockResolvedValueOnce([1]);

    const report = await runPlatformSelfDiagnostic(prisma);

    expect(report.status).toBe("Healthy");
    expect(report.checks.databaseConnection).toBe(true);
    expect(report.databaseLatencyMs).toBeGreaterThanOrEqual(0);
  });

  it("returns Failed status when database query throws error", async () => {
    (prisma.$queryRaw as any).mockRejectedValueOnce(new Error("Timeout Connection"));

    const report = await runPlatformSelfDiagnostic(prisma);

    expect(report.status).toBe("Failed");
    expect(report.checks.databaseConnection).toBe(false);
    expect(report.databaseLatencyMs).toBe(-1);
  });
});
