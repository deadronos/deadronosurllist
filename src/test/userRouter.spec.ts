import { createTestCaller, type AppCaller } from "./setup-trpc";
import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@/server/db";





let caller: AppCaller;

const maybeReset = (db as unknown as { reset?: () => void }).reset;

beforeEach(() => {
  if (typeof maybeReset === "function") {
    maybeReset();
  }
  caller = createTestCaller();
});

describe("userRouter (mocked)", () => {
  it("getById returns public user fields only", async () => {
    const user = await caller.user.getById({ id: "user1" });

    expect(user).toBeTruthy();
    expect(user?.id).toBe("user1");
    expect((user as { email?: string }).email).toBeUndefined();
  });
});