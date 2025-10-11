import type { Session } from "next-auth";
import { getServerSession } from "next-auth";

import { authConfig } from "./config";

export async function auth(): Promise<Session | null> {
  return getServerSession(authConfig);
}

export { authDiagnostics } from "./config";
export { authConfig };
