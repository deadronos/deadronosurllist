import { test, expect } from "@playwright/test";

test.describe("User profiles", () => {
  test("Profile page renders public collections", async ({ page }) => {
    await test.step("Open profile", async () => {
      await page.goto("/u/user1");
    });

    await test.step("Verify profile content", async () => {
      await expect(page.getByText("Mock User")).toHaveCount(1);
      await expect(page.getByText("Public collections")).toHaveCount(1);
      await expect(page.getByText("user1@example.com")).toHaveCount(0);
    });
  });

  test("Unknown profile returns 404", async ({ page }) => {
    await test.step("Open missing profile", async () => {
      await page.goto("/u/unknown-user");
    });

    await test.step("Verify not found", async () => {
      await expect(page.getByText("Page not found")).toHaveCount(1);
    });
  });
});