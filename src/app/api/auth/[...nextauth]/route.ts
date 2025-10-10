import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { authDiagnostics, handlers } from "@/server/auth";
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

type RouteHandler = (request: NextRequest, context?: unknown) => Promise<Response>;

const withAvailabilityGuard = (handler: RouteHandler): RouteHandler =>
	async (request, context) => {
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
				console.warn('[auth][error] Caught unsupported auth action probe:', message);
				return redirectWithError(request, 'AuthUnavailable');
			}

			// Re-throw unexpected errors so they surface to the platform logging/monitoring
			// as they may indicate real misconfiguration or runtime faults.
			throw err;
		}
	};

export const GET = withAvailabilityGuard(handlers.GET as RouteHandler);
export const POST = withAvailabilityGuard(handlers.POST as RouteHandler);
