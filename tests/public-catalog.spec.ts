import { test, expect } from "@playwright/test";

test.describe("Public catalog", () => {
  test.describe.configure({ mode: "serial" });

  test.skip(
    ({ browserName }) => browserName === "webkit",
    "WebKit does not currently render the client-side catalog reliably in the local Playwright environment.",
  );

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

    await test.step("Trigger infinite loading", async () => {
      await page.evaluate(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
      });
    });

    await test.step("Verify cards increased", async () => {
      await expect(
        page.getByText("Showing 19 of 19 public lists.", { exact: true }),
      ).toBeVisible({ timeout: 15000 });
      await expect(
        page.getByText("Resource Roundup 18", { exact: true }),
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