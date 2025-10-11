import { describe, expect, it } from "vitest";

import type { AdapterUser } from "next-auth/adapters";

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

    const adapterUser: AdapterUser = {
      id: "user-123",
      name: "Tester",
      email: "tester@example.com",
      emailVerified: null,
    };

    const loginToken = await jwtCallback({
      token: {},
      user: adapterUser,
      account: null,
      profile: undefined,
      trigger: "signIn",
      session: undefined,
      isNewUser: false,
    });

    expect(loginToken.id).toBe("user-123");

    const adapterUserWithoutId = {
      ...adapterUser,
      id: undefined,
    } as unknown as AdapterUser;

    const session = await sessionCallback({
      session: {
        user: {
          id: "",
          name: "Tester",
          email: "tester@example.com",
          image: null,
        },
        expires: new Date().toISOString(),
      },
      token: loginToken,
      user: adapterUserWithoutId,
      newSession: false,
      trigger: "update",
    });

    const sessionUser = session.user as { id: string };
    expect(sessionUser.id).toBe("user-123");
  });
});
