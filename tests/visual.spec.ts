import { test, expect } from "@playwright/test";

test.describe("Visual regression", () => {
  test.skip(process.env.VISUAL_TESTS !== "true", "Visual tests disabled");

  test("Home page snapshot", async ({ page }) => {
    await page.addStyleTag({
      content: "*{animation-duration:0s!important;transition-duration:0s!important}",
    });
    await page.goto("/");

    await expect(page).toHaveScreenshot("home-page.png", {
      fullPage: true,
    });
  });

  test("Catalog page snapshot", async ({ page }) => {
    await page.addStyleTag({
      content: "*{animation-duration:0s!important;transition-duration:0s!important}",
    });
    await page.goto("/catalog");

    await expect(page).toHaveScreenshot("catalog-page.png", {
      fullPage: true,
    });
  });
});