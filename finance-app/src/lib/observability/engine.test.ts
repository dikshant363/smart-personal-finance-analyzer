import { describe, it, expect, beforeEach } from "vitest";
import { ObservabilityService } from "./engine";

describe("Observability, Telemetry & Operations Platform (OTOP) Tests", () => {
  beforeEach(() => {
    ObservabilityService.clearRegistry();
  });

  it("records telemetry events accurately with category grouping", () => {
    ObservabilityService.recordEvent("auth", "UserLoginSuccess", { userId: "u1" });
    ObservabilityService.recordEvent("ai", "CopilotPromptCompletion", { tokens: 180 });

    const authEvents = ObservabilityService.getEvents("auth");
    const aiEvents = ObservabilityService.getEvents("ai");

    expect(authEvents.length).toBe(1);
    expect(authEvents[0].action).toBe("UserLoginSuccess");
    expect(aiEvents.length).toBe(1);
    expect(aiEvents[0].metadata.tokens).toBe(180);
  });

  it("calculates system health and database connectivity values", () => {
    const health = ObservabilityService.getSystemHealth();
    expect(health.status).toBe("Healthy");
    expect(health.dbOk).toBe(true);
    expect(health.memory).toBeDefined();
    expect(health.cpu).toBeDefined();
  });

  it("produces structured logs with core validation schemas", () => {
    const log = ObservabilityService.logStructured("Info", "Test message", { workspaceId: "ws_1" });
    expect(log.level).toBe("Info");
    expect(log.workspaceId).toBe("ws_1");
  });
});
