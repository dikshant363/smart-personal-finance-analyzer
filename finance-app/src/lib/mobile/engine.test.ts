import { describe, it, expect } from "vitest";
import { isMobileUserAgent } from "./engine";

describe("Multi-Platform PWA & Mobile UX Layout Tests", () => {
  it("determines user agent checks safely inside node/jsdom environments", () => {
    const isMobile = isMobileUserAgent();
    expect(typeof isMobile).toBe("boolean");
  });
});
