import { test, expect } from "@playwright/test";

test.describe("Public catalog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/catalog");
  });

  test("Search filters catalog results", async ({ page }) => {
    await test.step("Apply search query", async () => {
      const searchInput = page.getByPlaceholder(/Search by name/i);
      await searchInput.fill("Resource Roundup 3");
    });

    await test.step("Verify filtered results", async () => {
      await expect(page.getByText("Resource Roundup 3")).toBeVisible();
      await expect(page.getByText("Resource Roundup 1")).toHaveCount(0);
    });
  });

  test("Load more appends additional cards", async ({ page }) => {
    // Wait for initial content
    await expect(page.getByText(/Resource Roundup/)).not.toHaveCount(0);

    const loadMoreButton = page.getByRole("button", { name: /load more/i });

    if (await loadMoreButton.isVisible()) {
      const initialCount = await page.getByText(/Resource Roundup/).count();
      await test.step("Load next page", async () => {
        await loadMoreButton.click();
      });

      await test.step("Verify cards increased", async () => {
        await expect
          .poll(() => page.getByText(/Resource Roundup/).count(), {
            timeout: 10000,
          })
          .toBeGreaterThan(initialCount);
      });
    }
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