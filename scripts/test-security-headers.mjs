#!/usr/bin/env node
/**
 * Test script to verify security headers are properly configured
 * This script starts the Next.js dev server and validates actual HTTP responses
 */

import { spawn } from "child_process";
import http from "http";

const isProduction = process.env.NODE_ENV === "production";
const port = 3000;
const baseURL = `http://localhost:${port}`;

const expectedHeaders = {
  "Content-Security-Policy": {
    required: true,
    checkDirectives: (value) => {
      const requiredDirectives = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self'",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ];
      return requiredDirectives.every((directive) => value.includes(directive));
    },
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
    required: isProduction,
    expectedValue: "max-age=31536000; includeSubDomains; preload",
  },
};

console.log("Security Headers Test");
console.log("====================\n");
console.log(`Environment: ${isProduction ? "production" : "development"}`);
console.log(`Testing URL: ${baseURL}\n`);

let serverProcess = null;
let serverReady = false;
let serverReadyResolve = null;

async function waitForServer() {
  return new Promise((resolve, reject) => {
    serverReadyResolve = resolve;
    const maxAttempts = 30;
    let attempts = 0;

    const checkServer = () => {
      if (serverReady) {
        resolve();
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        reject(new Error("Server failed to start within 30 seconds"));
        return;
      }

      setTimeout(checkServer, 1000);
    };

    checkServer();
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    console.log("Starting Next.js dev server...");
    serverProcess = spawn("npm", ["run", "dev"], {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });

    serverProcess.stdout.on("data", (data) => {
      const output = data.toString();
      if (output.includes("Ready in") || output.includes("Local:")) {
        console.log("✓ Server is ready");
        serverReady = true;
        if (serverReadyResolve) serverReadyResolve();
      }
    });

    serverProcess.stderr.on("data", (data) => {
      const output = data.toString();
      if (output.includes("Ready in") || output.includes("Local:")) {
        console.log("✓ Server is ready");
        serverReady = true;
        if (serverReadyResolve) serverReadyResolve();
      }
    });

    serverProcess.on("error", (err) => {
      reject(err);
    });

    setTimeout(() => {
      if (!serverReady) {
        reject(new Error("Server failed to start"));
      }
    }, 30000);
  });
}

async function fetchHeaders() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: port,
      path: "/",
      method: "GET",
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      resolve(res.headers);
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
    req.end();
  });
}

function validateHeaders(headers) {
  console.log("Validating security headers...\n");
  let allTestsPassed = true;

  for (const [headerName, config] of Object.entries(expectedHeaders)) {
    const headerValue = headers[headerName.toLowerCase()];

    if (config.required && !headerValue) {
      console.log(`✗ FAIL: Required header "${headerName}" not found`);
      allTestsPassed = false;
    } else if (headerValue) {
      console.log(`✓ PASS: Header "${headerName}" is present`);

      if (config.expectedValue) {
        if (headerValue.includes(config.expectedValue)) {
          console.log(`  ✓ Expected value: "${config.expectedValue}"`);
        } else {
          console.log(`  ✗ Expected value not found`);
          console.log(`    Got: "${headerValue}"`);
          console.log(`    Expected: "${config.expectedValue}"`);
          allTestsPassed = false;
        }
      }

      if (config.pattern) {
        if (config.pattern.test(headerValue)) {
          console.log(`  ✓ Pattern match successful`);
        } else {
          console.log(`  ✗ Pattern match failed`);
          console.log(`    Got: "${headerValue}"`);
          allTestsPassed = false;
        }
      }

      if (config.checkDirectives) {
        if (config.checkDirectives(headerValue)) {
          console.log(`  ✓ All required CSP directives present`);
        } else {
          console.log(`  ✗ Missing required CSP directives`);
          console.log(`    Got: "${headerValue}"`);
          allTestsPassed = false;
        }
      }
    } else if (!config.required) {
      console.log(
        `○ SKIP: Header "${headerName}" (only required in production)`,
      );
    }
    console.log();
  }

  return allTestsPassed;
}

function stopServer() {
  if (serverProcess) {
    console.log("\nStopping server...");
    serverProcess.kill("SIGTERM");
  }
}

async function main() {
  try {
    await startServer();
    await waitForServer();

    console.log("Fetching headers from home page...\n");
    const headers = await fetchHeaders();

    const allTestsPassed = validateHeaders(headers);

    console.log("=".repeat(50));

    if (allTestsPassed) {
      console.log("\n✓ ALL TESTS PASSED");
      console.log("\nSecurity headers are properly configured!");
      console.log("\nHeaders include:");
      console.log("  • Content Security Policy (CSP)");
      console.log("  • X-Frame-Options (clickjacking protection)");
      console.log("  • X-Content-Type-Options (MIME sniffing protection)");
      console.log("  • Referrer-Policy");
      console.log("  • Permissions-Policy");
      console.log("  • X-DNS-Prefetch-Control");
      console.log("  • X-Download-Options");
      if (isProduction) {
        console.log("  • HTTP Strict Transport Security (HSTS)");
      }
      stopServer();
      process.exit(0);
    } else {
      console.log("\n✗ SOME TESTS FAILED");
      console.log(
        "\nPlease review the security headers configuration in next.config.js",
      );
      stopServer();
      process.exit(1);
    }
  } catch (error) {
    console.error("\n✗ ERROR:", error.message);
    stopServer();
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  stopServer();
  process.exit(1);
});

main();
