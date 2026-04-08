import { expect, test, vi, describe, beforeEach, afterEach } from "vitest";
import { proxy } from "../proxy";
import { NextResponse, NextRequest } from "next/server";

vi.mock("next/server", () => {
  return {
    NextResponse: {
      next: vi.fn(),
    },
  };
});

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
    const mockResponse = {
      headers: mockHeaders,
    };
    (NextResponse.next as any).mockReturnValue(mockResponse);

    const mockRequest = {} as NextRequest;
    const response = proxy(mockRequest);

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
    const mockResponse = {
      headers: mockHeaders,
    };
    (NextResponse.next as any).mockReturnValue(mockResponse);

    const mockRequest = {} as NextRequest;
    const response = proxy(mockRequest);

    expect(response.headers.get("Strict-Transport-Security")).toBe("max-age=31536000; includeSubDomains; preload");
  });

  test("should NOT set Strict-Transport-Security in non-production", () => {
    process.env.NODE_ENV = "development";
    const mockHeaders = new Headers();
    const mockResponse = {
      headers: mockHeaders,
    };
    (NextResponse.next as any).mockReturnValue(mockResponse);

    const mockRequest = {} as NextRequest;
    const response = proxy(mockRequest);

    expect(response.headers.get("Strict-Transport-Security")).toBeNull();
  });
});
