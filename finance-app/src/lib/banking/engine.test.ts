import { describe, it, expect } from "vitest";
import { SUPPORTED_INSTITUTIONS } from "./engine";

describe("Banking Connectivity Platform Tests", () => {
  it("provides Chase and Fidelity as supported mock institutions", () => {
    const chase = SUPPORTED_INSTITUTIONS.find((i) => i.id === "inst_chase");
    const fidelity = SUPPORTED_INSTITUTIONS.find((i) => i.id === "inst_fidelity");

    expect(chase).toBeDefined();
    expect(chase?.name).toBe("Chase Bank");
    expect(fidelity?.supportedTypes).toContain("Brokerage");
  });
});
