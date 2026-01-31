import { test, expect } from "@playwright/test";

test.describe("Public catalog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/catalog");
  });

  test("Search filters catalog results", async ({ page }) => {
    await test.step("Apply search query", async () => {
      const searchInput = page.getByRole("textbox", {
        name: "Search catalog",
      });
      await searchInput.fill("Resource Roundup 3");
    });

    await test.step("Verify filtered results", async () => {
      await expect(page.getByText("Resource Roundup 3")).toHaveCount(1);
      await expect(page.getByText("Resource Roundup 1")).toHaveCount(0);
    });
  });

  test("Load more appends additional cards", async ({ page }) => {
    const cardLinks = page.getByRole("link", { name: "Publish your own" });
    const initialCount = await cardLinks.count();

    await test.step("Load next page", async () => {
      await expect(
        page.getByRole("button", { name: /load more/i }),
      ).toHaveCount(1);
      await page.getByRole("button", { name: /load more/i }).click();
    });

    await test.step("Verify cards increased", async () => {
      await expect.poll(() => cardLinks.count()).toBeGreaterThan(initialCount);
    });
  });

  test("Catalog card CTA routes to sign-in", async ({ page }) => {
    await test.step("Open a catalog card CTA", async () => {
      await page.getByRole("link", { name: "Publish your own" }).first().click();
    });

    await test.step("Verify navigation", async () => {
      await expect(page).toHaveURL(/\/signin/);
    });
  });
});