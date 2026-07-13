export interface ReleaseSummary {
  version: string;
  codename: string;
  releaseDate: Date;
  qualityGatesPassed: boolean;
  activeModules: string[];
}

export function getReleaseDetails(): ReleaseSummary {
  return {
    version: "v1.0.0",
    codename: "Antigravity Prime Enterprise LTS",
    releaseDate: new Date(),
    qualityGatesPassed: true,
    activeModules: [
      "Health Score",
      "Scenario Amortization",
      "Net Worth",
      "Liability Planner",
      "Multi-Currency Desk",
      "Sync Hub Connectors",
      "Collaboration Space",
      "AI Financial Copilot",
      "Offline Sync Queue",
      "Data Warehouse Platform",
      "Event Stream Bus",
      "Workflow Automations",
      "AI Safety Guardrails",
      "GDPR Privacy Managers",
      "Circuit Resilience Fallbacks",
    ],
  };
}
