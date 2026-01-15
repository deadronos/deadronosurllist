#!/usr/bin/env node
/**
 * Test script to verify security headers middleware configuration
 * This script validates the middleware without running the full Next.js server
 */

// Security headers that should be set
const expectedHeaders = {
  "Content-Security-Policy": {
    required: true,
    directives: [
      "default-src",
      "script-src",
      "style-src",
      "img-src",
      "font-src",
      "object-src",
      "base-uri",
      "form-action",
      "frame-ancestors",
    ],
  },
  "X-Frame-Options": {
    required: true,
    expectedValue: "DENY",
  },
  "X-Content-Type-Options": {
    required: true,
    expectedValue: "nosniff",
  },
  "Referrer-Policy": {
    required: true,
    expectedValue: "strict-origin-when-cross-origin",
  },
  "Permissions-Policy": {
    required: true,
    pattern: /camera=\(\).*microphone=\(\).*geolocation=\(\)/,
  },
  "X-DNS-Prefetch-Control": {
    required: true,
    expectedValue: "off",
  },
  "X-Download-Options": {
    required: true,
    expectedValue: "noopen",
  },
  "Strict-Transport-Security": {
    required: false, // Only in production
    expectedValue: "max-age=31536000; includeSubDomains; preload",
  },
};

console.log("Security Headers Middleware Test");
console.log("=================================\n");

// Read the middleware file
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const middlewarePath = join(__dirname, "..", "src", "middleware.ts");

try {
  const middlewareContent = readFileSync(middlewarePath, "utf-8");

  console.log("✓ Middleware file found at src/middleware.ts\n");

  let allTestsPassed = true;

  // Check for each expected header
  for (const [headerName, config] of Object.entries(expectedHeaders)) {
    const headerSearch = `"${headerName}"`;
    const headerPresent = middlewareContent.includes(headerSearch);

    if (config.required && !headerPresent) {
      console.log(`✗ FAIL: Required header "${headerName}" not found`);
      allTestsPassed = false;
    } else if (headerPresent) {
      console.log(`✓ PASS: Header "${headerName}" is configured`);

      // Check expected value if specified
      if (config.expectedValue) {
        const valuePresent = middlewareContent.includes(config.expectedValue);
        if (valuePresent) {
          console.log(`  ✓ Value: "${config.expectedValue}"`);
        } else {
          console.log(`  ✗ Expected value not found: "${config.expectedValue}"`);
          allTestsPassed = false;
        }
      }

      // Check directives for CSP
      if (config.directives) {
        console.log(`  CSP Directives:`);
        for (const directive of config.directives) {
          const directivePresent = middlewareContent.includes(directive);
          console.log(
            `    ${directivePresent ? "✓" : "✗"} ${directive}${directivePresent ? "" : " (MISSING)"}`
          );
          if (!directivePresent) {
            allTestsPassed = false;
          }
        }
      }
    }
    console.log();
  }

  // Check for middleware export
  const hasMiddlewareExport = middlewareContent.includes(
    "export function middleware"
  );
  const hasConfig = middlewareContent.includes("export const config");

  if (hasMiddlewareExport) {
    console.log("✓ PASS: Middleware function is exported");
  } else {
    console.log("✗ FAIL: Middleware function export not found");
    allTestsPassed = false;
  }

  if (hasConfig) {
    console.log("✓ PASS: Middleware config is exported");
  } else {
    console.log("✗ FAIL: Middleware config export not found");
    allTestsPassed = false;
  }

  // Check for matcher configuration
  const hasMatcher = middlewareContent.includes("matcher");
  if (hasMatcher) {
    console.log("✓ PASS: Route matcher is configured");
  } else {
    console.log("✗ FAIL: Route matcher not found");
    allTestsPassed = false;
  }

  console.log("\n" + "=".repeat(50));

  if (allTestsPassed) {
    console.log("\n✓ ALL TESTS PASSED");
    console.log("\nSecurity headers middleware is properly configured!");
    console.log("\nHeaders include:");
    console.log("  • Content Security Policy (CSP)");
    console.log("  • HTTP Strict Transport Security (HSTS)");
    console.log("  • X-Frame-Options (clickjacking protection)");
    console.log("  • X-Content-Type-Options (MIME sniffing protection)");
    console.log("  • Referrer-Policy");
    console.log("  • Permissions-Policy");
    console.log("  • X-DNS-Prefetch-Control");
    console.log("  • X-Download-Options");
    process.exit(0);
  } else {
    console.log("\n✗ SOME TESTS FAILED");
    console.log("\nPlease review the middleware configuration.");
    process.exit(1);
  }
} catch (error) {
  console.error("\n✗ ERROR:", error.message);
  process.exit(1);
}
