import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    env: {
      SKIP_ENV_VALIDATION: "true",
      USE_MOCK_DB: "true",
      USE_MOCK_AUTH: "true",
      HELLO: "world",
      AUTH_SECRET: "test-secret",
      AUTH_DISCORD_ID: "placeholder-discord-id",
      AUTH_DISCORD_SECRET: "placeholder-discord-secret",
      AUTH_GOOGLE_ID: "placeholder-google-id",
      AUTH_GOOGLE_SECRET: "placeholder-google-secret",
      DATABASE_URL: "postgresql://postgres:password@localhost:5432/deadronosurllist",
    },
  },
});
