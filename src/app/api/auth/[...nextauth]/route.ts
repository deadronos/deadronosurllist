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
		return handler(request, context);
	};

export const GET = withAvailabilityGuard(handlers.GET as RouteHandler);
export const POST = withAvailabilityGuard(handlers.POST as RouteHandler);
