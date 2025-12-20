import type { Session } from "next-auth";

// Prefer runtime selection of the implementation so downstream code doesn't
// need a bundler-level alias. Mock auth is controlled independently from the
// mock database so local dev can use the in-memory DB while still exercising
// real OAuth sign-in flows.
const useMock =
  process.env.USE_MOCK_AUTH === "true" || process.env.USE_MOCK_AUTH === "1";

let authImpl: () => Promise<Session | null>;

if (useMock) {
  const mod = await import("../auth.mock");
  // Use the mock implementation directly so the exported function reference
  // matches the mock module (useful for tests that compare identities).
  authImpl = mod.auth;
} else {
  // Lazy-import heavy modules only when not using mock auth. This keeps the
  // module fast to evaluate in tests that set USE_MOCK_AUTH.
  const { getServerSession } = await import("next-auth");
  const { authConfig } = await import("./config");
  authImpl = async () => getServerSession(authConfig);
}

export const auth = authImpl;

export { authDiagnostics } from "./config";
export { authConfig } from "./config";
