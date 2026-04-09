import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { proxy } from "../proxy";
import type { NextRequest, NextResponse } from "next/server";

const nextResponseNextMock = vi.fn();

vi.mock("next/server", () => {
  return {
    NextResponse: {
      next: nextResponseNextMock,
    },
  };
});

describe("proxy utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should set security headers", () => {
    const mockHeaders = new Headers();
    const mockResponse = {
      headers: mockHeaders,
    } as unknown as NextResponse;
    nextResponseNextMock.mockReturnValue(mockResponse);

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
    vi.stubEnv("NODE_ENV", "production");
    const mockHeaders = new Headers();
    const mockResponse = {
      headers: mockHeaders,
    } as unknown as NextResponse;
    nextResponseNextMock.mockReturnValue(mockResponse);

    const mockRequest = {} as NextRequest;
    const response = proxy(mockRequest);

    expect(response.headers.get("Strict-Transport-Security")).toBe("max-age=31536000; includeSubDomains; preload");
  });

  test("should NOT set Strict-Transport-Security in non-production", () => {
    vi.stubEnv("NODE_ENV", "development");
    const mockHeaders = new Headers();
    const mockResponse = {
      headers: mockHeaders,
    } as unknown as NextResponse;
    nextResponseNextMock.mockReturnValue(mockResponse);

    const mockRequest = {} as NextRequest;
    const response = proxy(mockRequest);

    expect(response.headers.get("Strict-Transport-Security")).toBeNull();
  });
});
