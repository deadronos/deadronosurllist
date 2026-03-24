import { describe, expect, it } from "vitest";
import type { Session } from "next-auth";
import { getSessionUserId } from "@/server/auth/session-user";

describe("getSessionUserId", () => {
  it("returns an empty string when session is null", () => {
    expect(getSessionUserId(null)).toBe("");
  });

  it("returns an empty string when session is an empty object", () => {
    expect(getSessionUserId({} as Session)).toBe("");
  });

  it("returns an empty string when user is missing from session", () => {
    expect(getSessionUserId({ expires: "" } as Session)).toBe("");
  });

  it("returns an empty string when user.id is missing", () => {
    const session = {
      user: {},
      expires: "",
    } as unknown as Session;
    expect(getSessionUserId(session)).toBe("");
  });

  it("returns an empty string when user.id is not a string", () => {
    const session = {
      user: { id: 123 },
      expires: "",
    } as unknown as Session;
    expect(getSessionUserId(session)).toBe("");
  });

  it("returns the user id when it is a valid string", () => {
    const session = {
      user: { id: "user-123" },
      expires: "",
    } as unknown as Session;
    expect(getSessionUserId(session)).toBe("user-123");
  });

  it("trims leading and trailing whitespace from the user id", () => {
    const session = {
      user: { id: "  user-456  " },
      expires: "",
    } as unknown as Session;
    expect(getSessionUserId(session)).toBe("user-456");
  });
});
