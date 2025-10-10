import { describe, expect, it } from "vitest";

import { authCallbacks } from "@/server/auth/callbacks";
import { isMockDb } from "@/server/db";

describe("auth callbacks without Prisma adapter", () => {
  it("populates session.user.id from the JWT payload", async () => {
    expect(isMockDb).toBe(true);

    const jwtCallback = authCallbacks.jwt;
    const sessionCallback = authCallbacks.session;

    if (!jwtCallback || !sessionCallback) {
      throw new Error("NextAuth callbacks are not configured");
    }

    type JwtParams = Parameters<typeof jwtCallback>[0];
    type SessionParams = Parameters<typeof sessionCallback>[0];

    const loginToken = await jwtCallback({
      token: {},
      user: { id: "user-123" } as JwtParams["user"],
      account: undefined,
      profile: undefined,
      trigger: "signIn",
      session: undefined,
      isNewUser: false,
    } as JwtParams);

    expect(loginToken.id).toBe("user-123");

    const persistedToken = await jwtCallback({
      token: loginToken,
      user: undefined,
      account: undefined,
      profile: undefined,
      trigger: "update",
      session: undefined,
      isNewUser: false,
    } as JwtParams);

    const session = await sessionCallback({
      session: {
        user: {
          name: "Tester",
          email: "tester@example.com",
        },
        expires: new Date().toISOString(),
      },
      token: persistedToken,
      user: undefined,
      newSession: false,
      trigger: "update",
    } as SessionParams);

    expect(session.user?.id).toBe("user-123");
  });
});
