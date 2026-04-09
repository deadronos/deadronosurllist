import { expect, test, vi, describe, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import { proxy } from "../proxy";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Minimal interface to satisfy the proxy function return type and our assertions.
 * Using a local interface avoids issues with mocked types being seen as 'any' by the linter.
 */
interface MockResponseShape {
  headers: Headers;
}

describe("proxy utility", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test("should set security headers", () => {
    const mockHeaders = new Headers();
    const mockResponse: MockResponseShape = {
      headers: mockHeaders,
    };

    // Cast the mocked NextResponse.next to a Vitest Mock with explicit types.
    // Casting through 'unknown' first is required by strict ESLint rules for unsafe values.
    const nextMock = NextResponse.next as unknown as Mock<[], MockResponseShape>;
    nextMock.mockReturnValue(mockResponse);

    const mockRequest = {} as unknown as NextRequest;
    const response = proxy(mockRequest) as unknown as MockResponseShape;

    expect(response.headers.get("Content-Security-Policy")).toContain("default-src 'self'");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=(), interest-cohort=()");
    expect(response.headers.get("X-DNS-Prefetch-Control")).toBe("off");
    expect(response.headers.get("X-Download-Options")).toBe("noopen");
  });

  test("should set Strict-Transport-Security in production", () => {
    process.env.NODE_ENV = "production";
    const mockHeaders = new Headers();
    const mockResponse: MockResponseShape = {
      headers: mockHeaders,
    };

    const nextMock = NextResponse.next as unknown as Mock<[], MockResponseShape>;
    nextMock.mockReturnValue(mockResponse);

    const mockRequest = {} as unknown as NextRequest;
    const response = proxy(mockRequest) as unknown as MockResponseShape;

    expect(response.headers.get("Strict-Transport-Security")).toBe("max-age=31536000; includeSubDomains; preload");
  });

  test("should NOT set Strict-Transport-Security in non-production", () => {
    process.env.NODE_ENV = "development";
    const mockHeaders = new Headers();
    const mockResponse: MockResponseShape = {
      headers: mockHeaders,
    };

    const nextMock = NextResponse.next as unknown as Mock<[], MockResponseShape>;
    nextMock.mockReturnValue(mockResponse);

    const mockRequest = {} as unknown as NextRequest;
    const response = proxy(mockRequest) as unknown as MockResponseShape;

    expect(response.headers.get("Strict-Transport-Security")).toBeNull();
  });
});
