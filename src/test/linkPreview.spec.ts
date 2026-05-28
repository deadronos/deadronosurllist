import { describe, it, expect, vi, afterEach } from "vitest";
import { createCaller } from "@/server/api/root";
import { db } from "@/server/db";
import type { Session } from "next-auth";
import type { LinkPreviewResponse } from "@/server/api/link-preview";

// Mock the link-preview module so tests don't make real HTTP requests
const mockFetchPreview = vi.fn<() => Promise<LinkPreviewResponse>>();
vi.mock("@/server/api/link-preview", () => ({
  fetchLinkPreview: (...args: Parameters<typeof mockFetchPreview>) =>
    mockFetchPreview(...args),
}));

// Mock session
const mockSession: Session = {
  user: {
    id: "user1",
    name: "Test User",
    email: "test@example.com",
    image: null,
  },
  expires: new Date(Date.now() + 60_000).toISOString(),
};

const caller = createCaller({
  db,
  session: mockSession,
  headers: new Headers(),
});

describe("linkRouter.preview", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns metadata on successful preview", async () => {
    mockFetchPreview.mockResolvedValue({
      title: "Example Page",
      description: "This is an example description",
    });

    const result = await caller.link.preview({ url: "https://example.com" });

    expect(result).toEqual({
      title: "Example Page",
      description: "This is an example description",
    });
    expect(mockFetchPreview).toHaveBeenCalledWith("https://example.com");
  });

  it("returns empty strings when page has no metadata", async () => {
    mockFetchPreview.mockResolvedValue({
      title: "",
      description: "",
    });

    const result = await caller.link.preview({
      url: "https://example.com/empty",
    });

    expect(result).toEqual({
      title: "",
      description: "",
    });
  });

  it("throws BAD_REQUEST when preview fetch fails", async () => {
    mockFetchPreview.mockResolvedValue({
      ok: false,
      reason: "Server returned HTTP 404",
    });

    await expect(
      caller.link.preview({ url: "https://example.com/error" }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: expect.stringContaining("404"),
    });
  });

  it("throws BAD_REQUEST when request times out", async () => {
    mockFetchPreview.mockResolvedValue({
      ok: false,
      reason: "Request timed out after 5000ms",
    });

    await expect(
      caller.link.preview({ url: "https://slow.example.com" }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: expect.stringContaining("timed out"),
    });
  });

  it("throws BAD_REQUEST when body exceeds size limit", async () => {
    mockFetchPreview.mockResolvedValue({
      ok: false,
      reason: "Response body exceeded 524288 bytes",
    });

    await expect(
      caller.link.preview({ url: "https://example.com/huge" }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: expect.stringContaining("exceeded"),
    });
  });
});
