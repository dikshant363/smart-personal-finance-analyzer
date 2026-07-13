import { describe, it, expect, vi } from "vitest";
import { AppShell } from "./app-shell";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("AppShell Responsive Layout Component", () => {
  it("compiles and resolves exports cleanly", () => {
    expect(AppShell).toBeTypeOf("function");
  });
});
