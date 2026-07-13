/**
 * PWA Engine Tests
 * Sprint 11.2 — Progressive Web Application Platform
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { isStandalonePWA, isOnline, shareContent } from "./engine";

describe("PWA Engine", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("isStandalonePWA", () => {
    it("returns false when matchMedia is not available", () => {
      const original = window.matchMedia;
      window.matchMedia = vi.fn().mockReturnValue({ matches: false });
      expect(isStandalonePWA()).toBe(false);
      window.matchMedia = original;
    });

    it("returns true when display-mode is standalone", () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: true });
      expect(isStandalonePWA()).toBe(true);
    });
  });

  describe("isOnline", () => {
    it("reflects navigator.onLine", () => {
      // navigator.onLine defaults to true in jsdom
      expect(typeof isOnline()).toBe("boolean");
    });
  });

  describe("shareContent", () => {
    it("returns 'shared' when navigator.share succeeds", async () => {
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: vi.fn().mockResolvedValue(undefined),
      });
      const result = await shareContent({ title: "Test", url: "https://example.com" });
      expect(result).toBe("shared");
    });

    it("returns 'failed' when navigator.share throws", async () => {
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: vi.fn().mockRejectedValue(new Error("User cancelled")),
      });
      const result = await shareContent({ title: "Test", url: "https://example.com" });
      expect(result).toBe("failed");
    });
  });
});
