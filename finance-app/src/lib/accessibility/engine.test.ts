import { describe, it, expect } from "vitest";
import { auditAccessibilityAttributes } from "./engine";

describe("Accessibility & UX Polish (AUP) Tests", () => {
  it("passes audit when images have alt descriptions and inputs have labels", () => {
    const cleanHtml = `
      <div>
        <img src="avatar.png" alt="User Profile Image" />
        <input type="text" id="username" />
      </div>
    `;

    const result = auditAccessibilityAttributes(cleanHtml);
    expect(result.passed).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("fails audit and records errors when tags violate accessibility criteria", () => {
    const dirtyHtml = `
      <div>
        <img src="logo.png" />
        <input type="submit" />
      </div>
    `;

    const result = auditAccessibilityAttributes(dirtyHtml);
    expect(result.passed).toBe(false);
    expect(result.errors.length).toBe(2);
    expect(result.errors[0]).toContain("Image missing alternate description");
  });
});
