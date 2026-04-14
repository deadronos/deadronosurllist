import type { ErrorInfo } from "react";
import * as Sentry from "@sentry/nextjs";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ErrorBoundary } from "../components/error-boundary";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("logs a fallback error when Sentry capture throws", () => {
    const onError = vi.fn();
    const boundary = new ErrorBoundary({ children: null, onError });
    const error = new Error("boom");
    const info = { componentStack: "\n    at Example" } as ErrorInfo;
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    vi.mocked(Sentry.captureException).mockImplementation(() => {
      throw new Error("sentry unavailable");
    });

    boundary.componentDidCatch(error, info);

    expect(onError).toHaveBeenCalledWith(error, info);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "ErrorBoundary caught an error:",
      error,
      info,
    );
  });
});
