import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient } from "./index";

describe("@finance/api-sdk", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("adds Bearer Authorization header when token exists", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: "success" })
    });
    global.fetch = mockFetch;

    const client = new ApiClient({
      baseUrl: "https://api.test.local",
      getAccessToken: () => "mock-jwt-token"
    });

    await client.get("/transactions");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.test.local/transactions",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer mock-jwt-token"
        })
      })
    );
  });
});
