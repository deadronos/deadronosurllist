import type { Session } from "next-auth";
import { getServerSession } from "next-auth";

import { authConfig } from "./config";

/**
 * getServerSession wrapper for server-side authentication.
 * Retrieves the current session.
 *
 * @returns {Promise<Session | null>} The current session or null if not authenticated.
 */
export async function auth(): Promise<Session | null> {
  return getServerSession(authConfig);
}

export { authDiagnostics } from "./config";
export { authConfig };
