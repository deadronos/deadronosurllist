// Simple mock of server auth helper used in createTRPCContext

export const auth = async () => ({
  user: { id: "user1", name: "Mock User", email: "mock@example.com" },
});
