// Simple mock of server auth helper used in createTRPCContext

/**
 * A mock authentication helper for testing purposes.
 * Returns a fixed session with a mock user.
 *
 * @returns {Promise<{ user: { id: string; name: string; email: string } }>} A promise resolving to the mock session.
 */
export const auth = async () => ({
  user: { id: "user1", name: "Mock User", email: "mock@example.com" },
});
