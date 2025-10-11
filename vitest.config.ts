import { defineConfig, type UserConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/// <reference types="@vitest/browser/providers/playwright" />

type BrowserConfig = NonNullable<NonNullable<UserConfig["test"]>["browser"]>;

let browserConfig: BrowserConfig | undefined;

try {
  const { playwright } = await import("@vitest/browser-playwright");
  browserConfig = {
    enabled: true,
    provider: playwright(),
    instances: [{ browser: "chromium" }],
  };
} catch {
  browserConfig = undefined;
}

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
    browser: browserConfig,
  },
  plugins: [tsconfigPaths()],
});
