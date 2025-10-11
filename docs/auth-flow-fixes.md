# Authentication Stability — October 2025 Update

This note captures the recent changes that restored OAuth sign-in reliability in the production deployment.

## What broke

- The `/api/auth/[...nextauth]` route was wiring a custom `handlers` object that did not match what `NextAuth` v4 actually returns.  
- Preview builds were still aliasing `@/server/auth` to the in-memory mock via `USE_MOCK_DB`, so the real Prisma adapter never ran.  
- The `/signin` page linked directly to `/api/auth/signin/[provider]` with plain anchors. Without the official `signIn` helper (and the CSRF token it carries), NextAuth silently redirected back with `?error=discord`.
- A new client component used `useSearchParams` without a Suspense boundary, triggering the “CSR bailout” warning and preventing prerendering.

## Fixes applied

1. **Route handler** — `src/app/api/auth/[...nextauth]/route.ts` now wraps `NextAuth(authConfig)` directly and guards GET/POST with the availability middleware. No more destructuring of missing `handlers`.
2. **Server helper exports** — `src/server/auth/index.ts` only re-exports `auth()` (via `getServerSession`), `authConfig`, and `authDiagnostics`; there is no faux `handlers` object.
3. **Mock aliasing** — Vercel environments must leave `USE_MOCK_DB` unset/false so the Prisma adapter stays active in production.
4. **Sign-in UI** — `/signin` renders a client island (`SignInButtons`) that calls `next-auth/react`’s `signIn`. All provider submissions now happen via POST with the correct CSRF token.
5. **Suspense boundary** — The sign-in page wraps the client island in `<Suspense>` so `useSearchParams` satisfies App Router requirements.

## Result

OAuth buttons redirect users to Discord/Google as expected, the build no longer fails during prerender, and the same code path works locally and on Vercel.

Keep this file updated if additional auth-related adjustments are required.***
