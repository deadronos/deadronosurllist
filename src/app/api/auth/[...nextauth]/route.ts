import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import NextAuth from "next-auth";

import { authConfig, authDiagnostics } from "@/server/auth";
import { isMockDb } from "@/server/db";

const inferredErrorCode = (() => {
	if (isMockDb && process.env.USE_MOCK_DB !== "true") {
		return "DatabaseUnavailable";
	}

	if (!authDiagnostics.hasEnabledProvider) {
		return "AuthUnavailable";
	}

	return null;
})();

const redirectWithError = (request: NextRequest | Request, errorCode: string) => {
	const url = new URL("/error", request.url);
	url.searchParams.set("error", errorCode);
	return NextResponse.redirect(url);
};

type RouteContext = { params: Promise<{ nextauth: string[] }> };
type RouteHandler = (request: NextRequest, context: RouteContext) => Promise<Response>;

const allowedMethods = new Set(["GET", "POST"]);

const withAvailabilityGuard = (handler: RouteHandler): RouteHandler =>
	async (
		request,
		context = { params: Promise.resolve({ nextauth: [] }) },
	) => {
		if (!allowedMethods.has(request.method)) {
			// HEAD/OPTIONS and other probes should not reach NextAuth's handler because it will
			// emit UnknownAction noise. Reply quickly without touching the core auth runtime.
			if (request.method === "HEAD") {
				return new NextResponse(null, {
					status: 204,
					headers: { Allow: "GET, POST" },
				});
			}

			if (request.method === "OPTIONS") {
				return new NextResponse(null, {
					status: 204,
					headers: {
						Allow: "GET, POST",
						"Access-Control-Allow-Origin": request.headers.get("origin") ?? "*",
						"Access-Control-Allow-Methods": "GET, POST",
						"Access-Control-Allow-Headers": request.headers.get("access-control-request-headers") ?? "",
					},
				});
			}

			return new NextResponse(null, {
				status: 405,
				headers: { Allow: "GET, POST" },
			});
		}

		if (inferredErrorCode) {
			return redirectWithError(request, inferredErrorCode);
		}

		try {
			return await handler(request, context);
		} catch (err) {
			// Some hosting platforms and bots probe API endpoints in ways that can
			// trigger Auth.js to throw an UnknownAction/Unsupported action error.
			// These are noisy and not actionable for end users — redirect to the
			// pre-built auth error page instead of surfacing a stacktrace.
			const message = err instanceof Error ? err.message : String(err);
			if (message.includes("Unsupported action") || message.includes("UnknownAction")) {
				console.warn(
					`[auth][warn] Suppressed unsupported auth action (${request.method} ${request.url}):`,
					message,
				);
				return redirectWithError(request, "AuthUnavailable");
			}

			// Re-throw unexpected errors so they surface to the platform logging/monitoring
			// as they may indicate real misconfiguration or runtime faults.
			throw err;
		}
	};

const nextAuthHandler = NextAuth(authConfig) as RouteHandler;

export const GET = withAvailabilityGuard(nextAuthHandler);
export const POST = withAvailabilityGuard(nextAuthHandler);
