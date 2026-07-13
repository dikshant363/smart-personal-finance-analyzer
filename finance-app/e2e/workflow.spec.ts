import { test, expect } from "@playwright/test";

test.describe("Antigravity Finance Platform - End-to-End Suite", () => {
  test("should load the login page with proper visual elements", async ({ page }) => {
    await page.goto("/login");
    // Verify login page title or text elements
    await expect(page).toHaveTitle(/Finance/i);
    const heading = page.locator("h1, .card-title, button");
    await expect(heading.first()).toBeVisible();
  });

  test("should access local health APIs successfully", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body).toHaveProperty("ok", true);
  });
});
