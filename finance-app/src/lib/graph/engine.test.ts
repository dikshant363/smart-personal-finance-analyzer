import { describe, it, expect } from "vitest";
import { getRelatedNodes } from "./engine";

describe("Unified Financial Knowledge Graph Tests", () => {
  const mockGraph = {
    nodes: [
      { id: "user_u1", type: "User", label: "User" },
      { id: "workspace_w1", type: "Workspace", label: "Work" },
      { id: "account_a1", type: "Account", label: "Checking" },
      { id: "goal_g1", type: "Goal", label: "Savings Goal" },
    ],
    edges: [
      { source: "user_u1", target: "workspace_w1", type: "Owns" },
      { source: "workspace_w1", target: "account_a1", type: "Owns" },
      { source: "workspace_w1", target: "goal_g1", type: "Owns" },
    ],
  };

  it("resolves related nodes correctly based on edges", () => {
    const subgraph = getRelatedNodes(mockGraph, "workspace_w1");

    expect(subgraph.nodes.length).toBe(4); // workspace_w1 + user_u1 + account_a1 + goal_g1
    expect(subgraph.edges.length).toBe(3);
  });

  it("handles standalone nodes with no connections gracefully", () => {
    const subgraph = getRelatedNodes({ nodes: [{ id: "standalone", type: "Custom", label: "Lonely" }], edges: [] }, "standalone");
    expect(subgraph.nodes.length).toBe(1);
    expect(subgraph.edges.length).toBe(0);
  });
});
