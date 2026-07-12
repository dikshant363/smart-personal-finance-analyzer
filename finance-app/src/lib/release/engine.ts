export interface ReleaseSummary {
  version: string;
  codename: string;
  releaseDate: Date;
  qualityGatesPassed: boolean;
  activeModules: string[];
}

export function getReleaseDetails(): ReleaseSummary {
  return {
    version: "v1.0.0-rc1",
    codename: "Antigravity Prime Core",
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
    ],
  };
}
