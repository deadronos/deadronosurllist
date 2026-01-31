import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("home page renders without errors", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/deadronosurllist/i);

    await expect(page.locator("body")).toBeVisible();
  });

  test("public catalog page renders", async ({ page }) => {
    await page.goto("/catalog");

    await expect(page.locator("body")).toBeVisible();
  });

  test("sign-in page renders", async ({ page }) => {
    await page.goto("/api/auth/signin");

    await expect(page).toHaveTitle(/Sign in/i);

    await expect(page.locator("body")).toBeVisible();
  });

  test("health endpoint returns 200", async ({ request }) => {
    const response = await request.get("/api/health");

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toHaveProperty("status", "ok");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("checks");
    expect(body.checks).toHaveProperty("database");
    expect(body.checks.database).toHaveProperty("status");
  });

  test("security headers are present", async ({ page }) => {
    const response = await page.request.get("/");

    const headers = response.headers();

    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-dns-prefetch-control"]).toBe("off");
    expect(headers["x-download-options"]).toBe("noopen");
    expect(headers["content-security-policy"]).toBeDefined();
    expect(headers["permissions-policy"]).toBeDefined();
  });
});
