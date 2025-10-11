import { describe, expect, it } from "vitest";

import type { AdapterUser } from "next-auth/adapters";

import { authCallbacks } from "@/server/auth/callbacks";
import { isMockDb } from "@/server/db";

type JwtCallbackInput = Parameters<NonNullable<typeof authCallbacks.jwt>>[0];
type SessionCallbackInput = Parameters<
  NonNullable<typeof authCallbacks.session>
>[0];

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

  it("derives token.id from the sub claim when no user object is supplied", async () => {
    const jwtCallback = authCallbacks.jwt;
    if (!jwtCallback) {
      throw new Error("NextAuth JWT callback missing");
    }

    const token = await jwtCallback({
      token: { sub: "user-456" },
      user: undefined,
      account: null,
      profile: undefined,
      trigger: "update",
      session: undefined,
      isNewUser: false,
    } as unknown as JwtCallbackInput); // NextAuth omits `user` on updates even though the type marks it as required.

    expect(token.id).toBe("user-456");
  });

  it("populates session.user.id from token identifiers when user payload lacks an id", async () => {
    const sessionCallback = authCallbacks.session;
    if (!sessionCallback) {
      throw new Error("NextAuth session callback missing");
    }

    const session = await sessionCallback({
      session: {
        user: {
          id: "",
          name: "Callback Tester",
          email: "cb@example.com",
          image: null,
        },
        expires: new Date().toISOString(),
      },
      token: { id: "user-789" },
      user: undefined,
      newSession: false,
      trigger: "update",
    } as unknown as SessionCallbackInput); // Session updates omit the user payload while the type still demands it.

    const sessionUser = session.user as { id: string };
    expect(sessionUser.id).toBe("user-789");
  });
});
