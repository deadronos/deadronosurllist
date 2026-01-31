import { test, expect } from "@playwright/test";

test.describe("Authentication diagnostics", () => {
  test("Sign-in page shows diagnostics when providers disabled", async ({ page }) => {
    await test.step("Open sign-in page", async () => {
      await page.goto("/signin");
    });

    await test.step("Verify disabled auth messaging", async () => {
      await expect(
        page.getByText("Authentication is disabled"),
      ).toHaveCount(1);
      await expect(page.getByText("Provider diagnostics")).toHaveCount(1);
    });
  });
});