/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const config = /** @type {import("next").NextConfig} */ ({
  allowedDevOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
  serverExternalPackages: [
    "pg",
    "pg-connection-string",
    "pgpass",
    "@prisma/adapter-pg",
  ],
});

export default withBundleAnalyzer(config);
