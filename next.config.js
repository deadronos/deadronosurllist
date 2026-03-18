/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import { fileURLToPath } from "node:url";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const config = /** @type {import("next").NextConfig} */ ({
  allowedDevOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
});

export default withBundleAnalyzer(config);
