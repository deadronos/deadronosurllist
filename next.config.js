/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import path from "path";
import { fileURLToPath } from "url";

// ESM doesn't provide __dirname, recreate it for file path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isMock = !!process.env.USE_MOCK_DB;

const config = /** @type {import("next").NextConfig} */ ({
  // Configure Turbopack to mirror the webpack aliasing used for mocks.
  // When `USE_MOCK_DB` is set we alias server imports to the mock implementations
  // so Turbopack builds behave the same as the current webpack-based dev setup.
  turbopack: isMock
    ? {
        resolveAlias: {
          "@/server/db": path.resolve(__dirname, "src/server/db.mock.ts"),
          "@/server/auth": path.resolve(__dirname, "src/server/auth.mock.ts"),
        },
      }
    : {},
  // Cast the webpack function to NextConfig['webpack'] so TS knows the parameter types
  webpack: /** @type {import("next").NextConfig['webpack']} */ (
    (cfg, options) => {
      const configArg = cfg;
      const { isServer } = options || {};

      if (isMock) {
        configArg.resolve = configArg.resolve || {};
        configArg.resolve.alias = {
          ...(configArg.resolve.alias || {}),
          // alias server modules to mocks during development when USE_MOCK_DB=1
          ["@/server/db"]: path.resolve(__dirname, "src/server/db.mock.ts"),
          ["@/server/auth"]: path.resolve(__dirname, "src/server/auth.mock.ts"),
        };
      }

      return configArg;
    }
  ),
});

export default config;
