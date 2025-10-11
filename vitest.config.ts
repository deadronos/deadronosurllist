import { defineConfig } from "vitest/config";
import type { UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/// <reference types="@vitest/browser/providers/playwright" />

type BrowserConfig = NonNullable<NonNullable<UserConfig["test"]>["browser"]>;

type BrowserProviderFactory = () => BrowserConfig["provider"];

interface PlaywrightModule {
  playwright: BrowserProviderFactory;
}

const isPlaywrightModule = (
  candidate: unknown,
): candidate is PlaywrightModule => {
  if (typeof candidate !== "object" || candidate === null) {
    return false;
  }

  const moduleCandidate = candidate as Partial<PlaywrightModule>;

  return typeof moduleCandidate.playwright === "function";
};

const shouldEnableBrowser =
  process.env.VITEST_BROWSER?.toLowerCase() === "true";

let browserConfig: BrowserConfig | undefined;

if (shouldEnableBrowser) {
  try {
    const moduleCandidate: unknown = await import("@vitest/browser-playwright");

    if (isPlaywrightModule(moduleCandidate)) {
      browserConfig = {
        enabled: true,
        provider: moduleCandidate.playwright(),
        instances: [{ browser: "chromium" }],
      };
    }
  } catch {
    browserConfig = undefined;
  }
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
