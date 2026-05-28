import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { fetchLinkPreview } from "@/server/api/link-preview";

let fetchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchSpy = vi.fn();
  vi.stubGlobal("fetch", fetchSpy);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockFetchResponse(
  overrides: {
    ok?: boolean;
    status?: number;
    body?: string;
    contentLength?: string | null;
  } = {},
) {
  const {
    ok = true,
    status = 200,
    body = "<html><head></head><body></body></html>",
    contentLength = null,
  } = overrides;

  const headers = new Headers();
  if (contentLength !== null) {
    headers.set("content-length", contentLength);
  }

  fetchSpy.mockResolvedValue({
    ok,
    status,
    headers,
    text: () => Promise.resolve(body),
  } as Response);
}

describe("fetchLinkPreview", () => {
  it("returns an error object when the server responds with a non-2xx status", async () => {
    mockFetchResponse({ ok: false, status: 404 });

    const result = await fetchLinkPreview("https://example.com/not-found");

    expect(result).toEqual({
      ok: false,
      reason: "Server returned HTTP 404",
    });
  });

  it("returns an error object when the server responds with 500", async () => {
    mockFetchResponse({ ok: false, status: 500 });

    const result = await fetchLinkPreview("https://example.com/error");

    expect(result).toEqual({
      ok: false,
      reason: "Server returned HTTP 500",
    });
  });

  it("returns an error object when content-length header exceeds body limit", async () => {
    // 1 MB content-length > 512 KB limit
    mockFetchResponse({ contentLength: String(1024 * 1024) });

    const result = await fetchLinkPreview("https://example.com/huge");

    expect(result).toEqual({
      ok: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      reason: expect.stringContaining("exceeded"),
    });
  });

  it("returns an error object when fetch throws a network error", async () => {
    fetchSpy.mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await fetchLinkPreview("https://down.example.com");

    expect(result).toEqual({
      ok: false,
      reason: "ECONNREFUSED",
    });
  });

  it("returns an error object when the request times out", async () => {
    const abortError = new DOMException("The operation was aborted.", "AbortError");
    fetchSpy.mockRejectedValue(abortError);

    const result = await fetchLinkPreview("https://slow.example.com");

    expect(result).toEqual({
      ok: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      reason: expect.stringContaining("timed out"),
    });
  });

  it("returns metadata when fetch succeeds with a valid HTML body", async () => {
    const htmlWithMeta = `<html><head>
      <title>Example Page</title>
      <meta name="description" content="An example description">
    </head><body></body></html>`;

    mockFetchResponse({ body: htmlWithMeta });

    const result = await fetchLinkPreview("https://example.com");

    expect(result).toEqual({
      title: "Example Page",
      description: "An example description",
    });
  });

  it("returns empty strings when HTML has no metadata", async () => {
    mockFetchResponse({ body: "<html><head></head><body></body></html>" });

    const result = await fetchLinkPreview("https://example.com/empty");

    expect(result).toEqual({
      title: "",
      description: "",
    });
  });
});
