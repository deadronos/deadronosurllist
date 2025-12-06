import { expect, test, vi } from "vitest";

test("auth runtime uses mock implementation when USE_MOCK_DB=1", async () => {
  vi.resetModules();
  const original = process.env.USE_MOCK_DB;
  try {
    process.env.USE_MOCK_DB = "1";

    const authMod = await vi.importActual("@/server/auth");
    const mockMod = await vi.importActual("@/server/auth.mock");

    expect(authMod.auth).toBe(mockMod.auth);
  } finally {
    process.env.USE_MOCK_DB = original;
  }
});

test("auth runtime does not use mock implementation when USE_MOCK_DB is not set", async () => {
  vi.resetModules();
  const original = process.env.USE_MOCK_DB;
  try {
    // ensure the flag is unset
    delete process.env.USE_MOCK_DB;

    const authMod = await vi.importActual("@/server/auth");
    const mockMod = await vi.importActual("@/server/auth.mock");

    expect(authMod.auth).not.toBe(mockMod.auth);
  } finally {
    process.env.USE_MOCK_DB = original;
  }
});
