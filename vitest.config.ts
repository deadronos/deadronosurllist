import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { playwright } from "@vitest/browser-playwright";

/// <reference types="@vitest/browser/providers/playwright" />

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["src/test/setup.ts"],
    passWithNoTests: false,
    include: ["src/test/*.spec.ts"],
    includeSource: ["src/**/*.{js,ts,tsx}"],
    exclude: ["node_modules/"],
    coverage: {
      provider: "v8",
      enabled: false,
      reporter: ["text", "lcov"],
      include: ["src/**"],
      exclude: ["node_modules/", "src/test/"],
    },
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
  plugins: [tsconfigPaths()],
});
