import { describe, it, expect } from "vitest";
import { generateAICollaborationSummary } from "./engine";

describe("Professional Collaboration & Review Platform Tests", () => {
  it("summarizes collaboration discussions with disclaimers", () => {
    const comments = [
      { id: "c1", authorId: "u_advisor", content: "Retirement inflation is modeled correctly." },
      { id: "c2", authorId: "u_client", content: "Great, I'll proceed with this." }
    ];

    const text = generateAICollaborationSummary(comments);
    expect(text).toContain("Retirement inflation is modeled correctly.");
    expect(text).toContain("does not express opinions");
    expect(text).toContain("u_advisor");
  });

  it("handles empty discussion threads gracefully", () => {
    const text = generateAICollaborationSummary([]);
    expect(text).toContain("No comments logged in this discussion thread.");
  });
});
