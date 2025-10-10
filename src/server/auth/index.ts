import NextAuth, { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import type { NextRequest } from "next/server";

import { authConfig, authDiagnostics as configDiagnostics } from "./config";

// Log provider diagnostics outside of tests to help identify misconfiguration.
if (process.env.NODE_ENV !== "test") {
	console.info("[auth] provider diagnostics:", JSON.stringify(configDiagnostics));
}

type AppRouteHandler = (request: NextRequest, context: unknown) => Promise<Response>;

const authHandler = NextAuth(authConfig) as AppRouteHandler;

export async function auth(): Promise<Session | null> {
	return getServerSession(authConfig);
}

export const handlers = {
	GET: authHandler,
	POST: authHandler,
};

export const authDiagnostics = configDiagnostics;
