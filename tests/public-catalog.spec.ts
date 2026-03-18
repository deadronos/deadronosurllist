import { test, expect } from "@playwright/test";

test.describe("Public catalog", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/catalog");
    await expect(
      page.getByText("Discover Links", { exact: true }),
    ).toBeVisible({ timeout: 30000 });
  });

  test("Search filters catalog results", async ({ page }) => {
    await test.step("Apply search query", async () => {
      const searchInput = page.getByRole("textbox", {
        name: /search catalog/i,
      });
      await searchInput.fill("Resource Roundup 3");
    });

    await test.step("Verify filtered results", async () => {
      await expect(page.getByText("Resource Roundup 3", { exact: true })).toBeVisible();
      await expect(page.getByText("Resource Roundup 1", { exact: true })).toHaveCount(0);
    });
  });

  test("Load more appends additional cards", async ({ page }) => {
    await expect(
      page.getByText("Showing 16 of 19 public lists.", { exact: true }),
    ).toBeVisible();

    const initialCount = await page
      .getByText(/Resource Roundup/)
      .count();

    await test.step("Trigger infinite loading", async () => {
      await page.mouse.wheel(0, 5000);
    });

    await test.step("Verify cards increased", async () => {
      await expect
        .poll(
          () => page.getByText(/Resource Roundup/).count(),
          {
            timeout: 15000,
          },
        )
        .toBeGreaterThan(initialCount);

      await expect(
        page.getByText("Showing 19 of 19 public lists.", { exact: true }),
      ).toBeVisible();
    });
  });

  test("Catalog card CTA routes to sign-in", async ({ page }) => {
    await test.step("Open a catalog card CTA", async () => {
      const publishLink = page
        .getByRole("link", { name: "Publish your own" })
        .first();
      await expect(publishLink).toBeVisible();
      await Promise.all([
        page.waitForURL(/\/signin/),
        publishLink.click(),
      ]);
    });

    await test.step("Verify navigation", async () => {
      await expect(page).toHaveURL(/\/signin/);
    });
  });
});