import type { Session } from "next-auth";
import { getServerSession } from "next-auth";

import { authConfig } from "./config";

// Prefer runtime selection of the implementation so downstream code doesn't
// need a bundler-level alias. If `USE_MOCK_DB` is set the mock implementation
// will be used at runtime; otherwise we call into NextAuth's server session.
const useMock = !!process.env.USE_MOCK_DB;

let authImpl: () => Promise<Session | null>;

if (useMock) {
  const mod = await import("../auth.mock");
  // Use the mock implementation directly so the exported function reference
  // matches the mock module (useful for tests that compare identities).
  authImpl = mod.auth;
} else {
  authImpl = async () => getServerSession(authConfig);
}

export const auth = authImpl;

export { authDiagnostics } from "./config";
export { authConfig };
