import { describe, it, expect, vi, afterEach } from "vitest";
import { createCaller } from "@/server/api/root";
import { db } from "@/server/db";
import type { Session } from "next-auth";

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

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

describe("linkRouter.preview", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fetches metadata successfully", async () => {
    const htmlContent = `
      <html>
        <head>
          <title>Example Page</title>
          <meta name="description" content="This is an example description">
        </head>
        <body></body>
      </html>
    `;

    fetchMock.mockResolvedValue({
      text: () => Promise.resolve(htmlContent),
    } as Response);

    // Create caller with mocked session
    const caller = createCaller({
      db,
      session: mockSession,
      headers: new Headers(),
    });

    const result = await caller.link.preview({ url: "https://example.com" });

    expect(result).toEqual({
      title: "Example Page",
      description: "This is an example description",
    });
    expect(fetchMock).toHaveBeenCalledWith("https://example.com", expect.any(Object));
  });

  it("handles missing metadata gracefully", async () => {
    const htmlContent = `<html><head></head><body></body></html>`;

    fetchMock.mockResolvedValue({
      text: () => Promise.resolve(htmlContent),
    } as Response);

    const caller = createCaller({
      db,
      session: mockSession,
      headers: new Headers(),
    });

    const result = await caller.link.preview({ url: "https://example.com/empty" });

    expect(result).toEqual({
      title: "",
      description: "",
    });
  });

  it("handles fetch errors gracefully", async () => {
    fetchMock.mockRejectedValue(new Error("Network error"));

    const caller = createCaller({
      db,
      session: mockSession,
      headers: new Headers(),
    });

    const result = await caller.link.preview({ url: "https://example.com/error" });

    expect(result).toEqual({
      title: "",
      description: "",
    });
  });
});
