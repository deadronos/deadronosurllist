import type { Session } from "next-auth";
import { getServerSession } from "next-auth";

import { authConfig } from "./config";

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
  authImpl = async () => getServerSession(authConfig);
}

export const auth = authImpl;

export { authDiagnostics } from "./config";
export { authConfig };
