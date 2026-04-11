import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { proxy } from "../proxy";
import type { NextRequest } from "next/server";

type MockResponseShape = {
  headers: Headers;
};

const { nextResponseNextMock } = vi.hoisted(() => ({
  nextResponseNextMock: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    next: nextResponseNextMock,
  },
}));

describe("proxy utility", () => {
  const env = process.env as Record<string, string | undefined>;
  const originalEnv = env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    env.NODE_ENV = originalEnv;
  });

  test("should set security headers", () => {
    const mockHeaders = new Headers();
    const mockResponse: MockResponseShape = {
      headers: mockHeaders,
    };

    nextResponseNextMock.mockReturnValue(mockResponse);

    const mockRequest = {} as unknown as NextRequest;
    const response = proxy(mockRequest) as MockResponseShape;

    expect(response.headers.get("Content-Security-Policy")).toContain(
      "default-src 'self'",
    );
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(response.headers.get("Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    );
    expect(response.headers.get("X-DNS-Prefetch-Control")).toBe("off");
    expect(response.headers.get("X-Download-Options")).toBe("noopen");
  });

  test("should set Strict-Transport-Security in production", () => {
    env.NODE_ENV = "production";
    const mockHeaders = new Headers();
    const mockResponse: MockResponseShape = {
      headers: mockHeaders,
    };

    nextResponseNextMock.mockReturnValue(mockResponse);

    const mockRequest = {} as unknown as NextRequest;
    const response = proxy(mockRequest) as MockResponseShape;

    expect(response.headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000; includeSubDomains; preload",
    );
  });

  test("should NOT set Strict-Transport-Security in non-production", () => {
    env.NODE_ENV = "development";
    const mockHeaders = new Headers();
    const mockResponse: MockResponseShape = {
      headers: mockHeaders,
    };

    nextResponseNextMock.mockReturnValue(mockResponse);

    const mockRequest = {} as unknown as NextRequest;
    const response = proxy(mockRequest) as MockResponseShape;

    expect(response.headers.get("Strict-Transport-Security")).toBeNull();
  });
});
