import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
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
    command: process.env.CI ? "npx next start" : "npm run preview",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    env: {
      SKIP_ENV_VALIDATION: "true",
      USE_MOCK_DB: "true",
      USE_MOCK_AUTH: "true",
      HELLO: "world",
      NEXTAUTH_SECRET: "ci-auth-static-credential-value",
      NEXTAUTH_URL: "http://localhost:3000",
      AUTH_SECRET: "ci-auth-static-credential-value",
      AUTH_DISCORD_ID: "123456789012345678",
      AUTH_DISCORD_SECRET: "ci-auth-static-credential-value",
      AUTH_GOOGLE_ID: "ci-auth-static-credential-value",
      AUTH_GOOGLE_SECRET: "ci-auth-static-credential-value",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/postgres",
    },
  },
});
