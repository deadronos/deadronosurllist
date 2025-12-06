// Simple mock of server auth helper used in createTRPCContext

import type { Session } from "next-auth";

/**
 * A mock authentication helper for testing purposes.
 * Returns a fixed session with a mock user.
 */
export const auth = async (): Promise<Session | null> => ({
  user: { id: "user1", name: "Mock User", email: "mock@example.com" },
  expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
});
