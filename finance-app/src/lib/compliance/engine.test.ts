import { describe, it, expect } from "vitest";
import { maskPersonalData } from "./engine";

describe("Privacy & Data Compliance Protection Tests", () => {
  it("masks target emails and phone number fields safely", () => {
    const text = "Please call 123-456-7890 or mail test@domain.com";
    const masked = maskPersonalData(text);

    expect(masked).toContain("[MASKED_PHONE]");
    expect(masked).toContain("[MASKED_EMAIL]");
    expect(masked).not.toContain("test@domain.com");
  });
});
