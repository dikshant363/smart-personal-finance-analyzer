import { describe, it, expect } from "vitest";
import { AuthSessionManager } from "./index";

describe("@finance/auth-sdk", () => {
  it("manages session state correctly", () => {
    const manager = new AuthSessionManager();
    expect(manager.getSession().isLoggedIn).toBe(false);

    manager.setSession(
      { id: "u1", email: "test@user.com", name: "Test User" },
      "access",
      "refresh"
    );

    const session = manager.getSession();
    expect(session.isLoggedIn).toBe(true);
    expect(session.user?.email).toBe("test@user.com");

    manager.clearSession();
    expect(manager.getSession().isLoggedIn).toBe(false);
  });
});
