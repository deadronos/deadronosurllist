import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to add security headers to all responses.
 * This middleware runs on every request before it reaches the application.
 *
 * Security headers included:
 * - Content-Security-Policy (CSP): Restricts resource loading to prevent XSS
 * - Strict-Transport-Security (HSTS): Forces HTTPS connections
 * - X-Frame-Options: Prevents clickjacking
 * - X-Content-Type-Options: Prevents MIME sniffing
 * - Referrer-Policy: Controls referrer information
 * - Permissions-Policy: Controls browser features
 */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy
  // This policy allows content from the same origin and specific trusted sources
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);

  // Strict Transport Security - Force HTTPS for 1 year
  // Only apply in production to avoid issues with local development
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  // Prevent clickjacking by disabling iframe embedding
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Control referrer information - only send origin for cross-origin requests
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy - Disable unnecessary browser features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );

  // X-DNS-Prefetch-Control - Disable DNS prefetching
  response.headers.set("X-DNS-Prefetch-Control", "off");

  // X-Download-Options - Prevent IE from executing downloads
  response.headers.set("X-Download-Options", "noopen");

  return response;
}

/**
 * Configure which routes this middleware runs on.
 * By default, it runs on all routes except:
 * - Static files (images, fonts, etc.)
 * - Next.js internals (_next)
 * - API routes that need custom headers
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - they may need custom CORS headers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
