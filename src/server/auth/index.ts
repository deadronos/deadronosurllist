import NextAuth, { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import type { NextRequest } from "next/server";

import { authConfig, authDiagnostics as configDiagnostics } from "./config";

// Print auth provider diagnostics at startup so logs clearly show which providers
// are enabled or disabled. This helps diagnose noisy UnknownAction errors and
// reveal misconfiguration without exposing secrets.
if (process.env.NODE_ENV !== "test") {
	// Keep the output compact and non-sensitive.
	console.info("[auth] provider diagnostics:", JSON.stringify(configDiagnostics));
}

type AppRouteHandler = (request: NextRequest, context?: unknown) => Promise<Response>;

type NextAuthInstance = {
	auth: () => Promise<Session | null>;
	handlers: {
		GET: AppRouteHandler;
		POST: AppRouteHandler;
	};
	signIn: (...args: unknown[]) => Promise<unknown>;
	signOut: (...args: unknown[]) => Promise<unknown>;
};

const nextAuthInstance = NextAuth(authConfig) as NextAuthInstance;

export async function auth(): Promise<Session | null> {
	return getServerSession(authConfig);
}

const nextAuthHandlers: NextAuthInstance["handlers"] = nextAuthInstance.handlers;
const nextAuthSignIn: NextAuthInstance["signIn"] = nextAuthInstance.signIn;
const nextAuthSignOut: NextAuthInstance["signOut"] = nextAuthInstance.signOut;

export const handlers = nextAuthHandlers;
export const signIn = nextAuthSignIn;
export const signOut = nextAuthSignOut;

export const authDiagnostics = configDiagnostics;
