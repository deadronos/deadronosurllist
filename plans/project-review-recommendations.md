# Project Review Recommendations

**Project:** deadronosurllist  
**Review Date:** January 29, 2026  
**Overall Grade:** B+ (85/100)  
**Reviewer:** GitHub Copilot

---

## Executive Summary

This is a well-architected, production-ready T3 Stack application with excellent engineering practices. The project demonstrates strong attention to type safety, security, and developer experience. The main gaps are in operational maturity, performance optimization, and feature completeness.

**Key Strengths:**
- Excellent architecture with clean separation of concerns
- Comprehensive security implementation with defense-in-depth approach
- Strong testing discipline with isolated test environments
- Outstanding developer experience with Memory Bank system
- High code quality with strict TypeScript and ESLint configuration

**Primary Concerns:**
- Missing production deployment configuration
- No caching strategy for performance optimization
- Limited E2E test coverage
- Incomplete feature set relative to project vision
- No operational monitoring or health checks

---

## Priority Matrix

| Priority | Category | Effort | Impact | Items |
|----------|----------|--------|--------|-------|
| **High** | Operational | Medium | Critical | Deployment config, migrations, error handling |
| **High** | Security | Low | High | Complete RLS policies, middleware implementation |
| **Medium** | Performance | Medium | High | Caching layer, bundle optimization |
| **Medium** | Testing | Medium | High | E2E test suite, performance testing |
| **Low** | Features | High | Medium | User profiles, advanced search |
| **Low** | Documentation | Low | Medium | API docs, contributing guide |

---

## High Priority Recommendations

### 1. Add Middleware for Security Headers

**Status:** Missing file  
**Effort:** 2-4 hours  
**Impact:** Critical for production security

**Issue:** The README mentions security headers via middleware, but `src/middleware.ts` was not found.

**Implementation:**

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Security Headers
  res.headers.set('X-DNS-Prefetch-Control', 'force-off')
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.githubusercontent.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
  res.headers.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim())

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

**Validation:**
- Run `npm run lint` and `npm run typecheck`
- Test headers with `curl -I http://localhost:3000`
- Verify CSP doesn't break any functionality

---

### 2. Implement Database Migrations for Production

**Status:** Using `db:push` only  
**Effort:** 4-8 hours  
**Impact:** Critical for production safety

**Issue:** Current workflow uses `prisma db push` which is unsafe for production. Need proper migration strategy.

**Implementation:**

```bash
# Create initial migration
npm run db:migrate -- --name init_schema

# Update package.json scripts
{
  "scripts": {
    "db:migrate:dev": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:migrate:reset": "prisma migrate reset",
    "db:migrate:status": "prisma migrate status"
  }
}
```

**Migration Workflow:**
1. Create migration: `npm run db:migrate:dev -- --name add_collection_tags`
2. Review generated migration in `prisma/migrations/`
3. Test migration locally: `npm run db:migrate:reset`
4. Deploy to staging: `npm run db:migrate:deploy`

**Documentation to Add:**
```markdown
# Database Migration Guide

## Development
```bash
npm run db:migrate:dev -- --name descriptive_name
```

## Production
```bash
npm run db:migrate:deploy
```

## Rollback
```bash
npm run db:migrate:resolve -- --rolled-back [migration_name]
```
```

**Validation:**
- Test migration on fresh database
- Verify rollback procedure works
- Document migration history in `docs/database-migrations.md`

---

### 3. Add Error Boundaries and Centralized Error Handling

**Status:** Not implemented  
**Effort:** 6-10 hours  
**Impact:** High for user experience

**Issue:** No global error boundary, runtime errors may result in poor UX.

**Implementation:**

```typescript
// src/components/error-boundary.tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    // Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Something went wrong</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                <Button onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Go Home
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

```typescript
// src/app/error.tsx (update existing)
'use client'

import { ErrorBoundary } from '@/components/error-boundary'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Application Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{error.message}</p>
              <Button onClick={reset}>Try Again</Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      }
    />
  )
}
```

**tRPC Error Handling:**

```typescript
// src/server/api/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

// Standardized error responses
export const throwUnauthorized = (message = 'Unauthorized') => {
  throw new TRPCError({
    code: 'UNAUTHORIZED',
    message,
  })
}

export const throwForbidden = (message = 'Forbidden') => {
  throw new TRPCError({
    code: 'FORBIDDEN',
    message,
  })
}

export const throwNotFound = (resource = 'Resource') => {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: `${resource} not found`,
  })
}
```

**Validation:**
- Test error boundary with intentional errors
- Verify tRPC errors are properly formatted
- Check error tracking integration (if added)

---

### 4. Complete Row-Level Security (RLS) Policies

**Status:** Schema has RLS foundation, policies not implemented  
**Effort:** 8-12 hours  
**Impact:** High for defense-in-depth security

**Issue:** Database schema has RLS structure but policies are not defined in `docs/rls-policies.sql`.

**Implementation:**

```sql
-- docs/rls-policies.sql

-- Enable RLS on all tables
ALTER TABLE "Collection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Link" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Collection Policies
CREATE POLICY "Users can view their own collections"
  ON "Collection" FOR SELECT
  USING (auth.uid()::text = "createdById");

CREATE POLICY "Users can view public collections"
  ON "Collection" FOR SELECT
  USING ("isPublic" = true);

CREATE POLICY "Users can create their own collections"
  ON "Collection" FOR INSERT
  WITH CHECK (auth.uid()::text = "createdById");

CREATE POLICY "Users can update their own collections"
  ON "Collection" FOR UPDATE
  USING (auth.uid()::text = "createdById");

CREATE POLICY "Users can delete their own collections"
  ON "Collection" FOR DELETE
  USING (auth.uid()::text = "createdById");

-- Link Policies
CREATE POLICY "Users can view links in their own collections"
  ON "Link" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Collection"
      WHERE "Collection".id = "Link"."collectionId"
      AND "Collection"."createdById" = auth.uid()::text
    )
  );

CREATE POLICY "Users can view links in public collections"
  ON "Link" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Collection"
      WHERE "Collection".id = "Link"."collectionId"
      AND "Collection"."isPublic" = true
    )
  );

CREATE POLICY "Users can create links in their own collections"
  ON "Link" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Collection"
      WHERE "Collection".id = "Link"."collectionId"
      AND "Collection"."createdById" = auth.uid()::text
    )
  );

CREATE POLICY "Users can update links in their own collections"
  ON "Link" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Collection"
      WHERE "Collection".id = "Link"."collectionId"
      AND "Collection"."createdById" = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete links in their own collections"
  ON "Link" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Collection"
      WHERE "Collection".id = "Link"."collectionId"
      AND "Collection"."createdById" = auth.uid()::text
    )
  );

-- User Policies
CREATE POLICY "Users can view their own profile"
  ON "User" FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile"
  ON "User" FOR UPDATE
  USING (auth.uid()::text = id);
```

**Integration with NextAuth:**

```typescript
// src/server/auth/config.ts
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/server/db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  // ... rest of config
}
```

**Validation:**
- Test RLS policies with different user sessions
- Verify public collections are accessible without auth
- Test that users cannot access others' private data
- Run security test suite

---

### 5. Add Deployment Configuration

**Status:** Not configured  
**Effort:** 4-6 hours  
**Impact:** Critical for production deployment

**Issue:** No deployment configuration for Vercel, Docker, or other platforms.

**Vercel Deployment:**

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "AUTH_SECRET": "@auth-secret",
    "AUTH_DISCORD_ID": "@auth-discord-id",
    "AUTH_DISCORD_SECRET": "@auth-discord-secret",
    "NEXTAUTH_URL": "@nextauth-url"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_VERCEL_ENV": "production"
    }
  }
}
```

```yaml
# .github/workflows/deploy-preview.yml
name: Deploy Preview

on:
  pull_request:
    branches: [main, preview]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Run typecheck
        run: npm run typecheck

      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prebuilt'
```

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Run typecheck
        run: npm run typecheck

      - name: Run security checks
        run: npm audit --audit-level=moderate

      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod --prebuilt'
```

**Docker Alternative:**

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/url_list
      - AUTH_SECRET=${AUTH_SECRET}
      - AUTH_DISCORD_ID=${AUTH_DISCORD_ID}
      - AUTH_DISCORD_SECRET=${AUTH_DISCORD_SECRET}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=url_list
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

**Documentation to Add:**
```markdown
# Deployment Guide

## Vercel Deployment

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main

## Docker Deployment

```bash
docker-compose up -d
```

## Environment Variables

Required variables for production:
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_DISCORD_ID`
- `AUTH_DISCORD_SECRET`
- `NEXTAUTH_URL`
```

**Validation:**
- Test preview deployment on PR
- Verify production deployment works
- Test rollback procedure
- Verify environment variables are properly set

---

## Medium Priority Recommendations

### 6. Add Caching Layer for Performance

**Status:** Not implemented  
**Effort:** 8-12 hours  
**Impact:** High for performance and scalability

**Issue:** No caching strategy, unnecessary database load for public collections.

**Implementation Options:**

#### Option A: Next.js ISR (Recommended for simplicity)

```typescript
// src/app/page.tsx
import { api } from "@/trpc/server"

export const revalidate = 300 // Revalidate every 5 minutes

export default async function HomePage() {
  const publicCollection = await api.collection.getPublic()
  // ... rest of component
}
```

```typescript
// src/app/catalog/page.tsx
export const revalidate = 600 // Revalidate every 10 minutes

export default async function CatalogPage() {
  const catalog = await api.collection.getPublicCatalog({ limit: 20 })
  // ... rest of component
}
```

#### Option B: Redis Caching (For high-traffic scenarios)

```bash
npm install ioredis @types/ioredis
```

```typescript
// src/lib/cache.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) : null
  },

  async set(key: string, value: unknown, ttl: number = 300): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value))
  },

  async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  },

  async invalidateCollection(collectionId: string): Promise<void> {
    await this.invalidate(`collection:${collectionId}:*`)
    await this.invalidate('catalog:*')
  },
}
```

```typescript
// src/server/api/routers/collection/catalog.ts
import { cache } from "@/lib/cache"

export const collectionRouter = createTRPCRouter({
  getPublic: publicProcedure.query(async ({ ctx }) => {
    const cacheKey = 'collection:public'
    const cached = await cache.get(cacheKey)
    
    if (cached) {
      return cached
    }

    const collection = await ctx.db.collection.findFirst({
      where: { isPublic: true },
      include: {
        links: {
          take: 10,
          orderBy: { order: 'asc' },
        },
      },
    })

    if (collection) {
      await cache.set(cacheKey, collection, 300) // 5 minutes
    }

    return collection
  }),

  getPublicCatalog: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
      q: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const cacheKey = `catalog:${input.limit}:${input.cursor || 'none'}:${input.q || 'none'}`
      const cached = await cache.get(cacheKey)
      
      if (cached) {
        return cached
      }

      // ... existing query logic

      await cache.set(cacheKey, result, 600) // 10 minutes
      return result
    }),
})
```

**Cache Invalidation on Mutations:**

```typescript
// src/server/api/routers/collection/collection.ts
export const collectionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createCollectionSchema)
    .mutation(async ({ ctx, input }) => {
      const collection = await ctx.db.collection.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
        },
      })

      // Invalidate cache
      await cache.invalidate('catalog:*')

      return collection
    }),

  update: protectedProcedure
    .input(updateCollectionSchema)
    .mutation(async ({ ctx, input }) => {
      const collection = await ctx.db.collection.update({
        where: { id: input.id },
        data: input,
      })

      // Invalidate cache
      await cache.invalidateCollection(input.id)

      return collection
    }),
})
```

**Validation:**
- Measure cache hit rate
- Verify cache invalidation works correctly
- Test with cache disabled (fallback to DB)
- Monitor memory usage

---

### 7. Create E2E Test Suite with Playwright

**Status:** Playwright configured, no tests written  
**Effort:** 12-16 hours  
**Impact:** High for catching integration issues

**Issue:** Only unit tests exist, no end-to-end coverage of user flows.

**Implementation:**

```typescript
// tests/public-catalog.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Public Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays seeded public collection', async ({ page }) => {
    await expect(page.getByText('Discover Links')).toBeVisible()
    await expect(page.getByRole('link', { name: /github/i })).toBeVisible()
  })

  test('search filters collections', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('game')
    
    await expect(page.getByText('Game Night Picks')).toBeVisible()
    await expect(page.getByText('Team Knowledge Base')).not.toBeVisible()
  })

  test('load more pagination works', async ({ page }) => {
    const loadMoreButton = page.getByRole('button', { name: /load more/i })
    
    if (await loadMoreButton.isVisible()) {
      const initialCount = await page.locator('[data-testid="collection-card"]').count()
      await loadMoreButton.click()
      
      const newCount = await page.locator('[data-testid="collection-card"]').count()
      expect(newCount).toBeGreaterThan(initialCount)
    }
  })
})
```

```typescript
// tests/authentication.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('sign-in button navigates to signin page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /sign in/i }).click()
    
    await expect(page).toHaveURL(/\/signin/)
    await expect(page.getByText(/sign in to your account/i)).toBeVisible()
  })

  test('displays auth diagnostics when providers unavailable', async ({ page }) => {
    // Set environment to disable OAuth
    await page.goto('/signin')
    
    await expect(page.getByText(/authentication is currently unavailable/i)).toBeVisible()
  })

  test('redirects to dashboard after successful sign-in', async ({ page }) => {
    // This test requires mocking OAuth flow
    // Consider using MSW or similar for mocking
    await page.goto('/signin')
    
    // Mock successful OAuth callback
    // await page.route('**/api/auth/callback/discord', route => {
    //   route.fulfill({
    //     status: 302,
    //     headers: { location: '/dashboard' }
    //   })
    // })
    
    // await page.getByRole('button', { name: /sign in with discord/i }).click()
    // await expect(page).toHaveURL('/dashboard')
  })
})
```

```typescript
// tests/collection-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Collection Management', () => {
  test.use({ storageState: 'tests/auth-state.json' }) // Pre-authenticated state

  test('creates new collection', async ({ page }) => {
    await page.goto('/dashboard')
    
    await page.getByRole('button', { name: /new collection/i }).click()
    
    await page.getByLabel(/name/i).fill('Test Collection')
    await page.getByLabel(/description/i).fill('A test collection')
    await page.getByRole('checkbox', { name: /public/i }).check()
    
    await page.getByRole('button', { name: /create/i }).click()
    
    await expect(page.getByText('Test Collection')).toBeVisible()
  })

  test('adds link to collection', async ({ page }) => {
    await page.goto('/collections/test-collection-id')
    
    await page.getByRole('button', { name: /add link/i }).click()
    
    await page.getByLabel(/url/i).fill('https://example.com')
    await page.getByLabel(/name/i).fill('Example Link')
    await page.getByLabel(/comment/i).fill('Test comment')
    
    await page.getByRole('button', { name: /add/i }).click()
    
    await expect(page.getByRole('link', { name: /example link/i })).toBeVisible()
  })

  test('reorders links via drag and drop', async ({ page }) => {
    await page.goto('/collections/test-collection-id')
    
    const firstLink = page.locator('[data-testid="link-item"]').first()
    const secondLink = page.locator('[data-testid="link-item"]').nth(1)
    
    await firstLink.dragTo(secondLink)
    
    // Verify order changed
    const newFirstLink = page.locator('[data-testid="link-item"]').first()
    await expect(newFirstLink).toHaveText(/second link/i)
  })
})
```

```typescript
// tests/error-handling.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Error Handling', () => {
  test('displays 404 page for non-existent collection', async ({ page }) => {
    await page.goto('/collections/non-existent-id')
    
    await expect(page.getByText(/collection not found/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /go home/i })).toBeVisible()
  })

  test('error page provides recovery options', async ({ page }) => {
    // Navigate to a route that triggers an error
    await page.goto('/error-test')
    
    await expect(page.getByText(/something went wrong/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /reload/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /go home/i })).toBeVisible()
  })
})
```

**Playwright Configuration:**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Add to package.json:**

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

**Validation:**
- Run E2E tests locally
- Verify tests pass in CI
- Check test coverage of critical user flows
- Review test reports for flaky tests

---

### 8. Add Performance Monitoring

**Status:** Vercel Analytics installed, no custom monitoring  
**Effort:** 6-8 hours  
**Impact:** High for production observability

**Issue:** No performance metrics, API latency monitoring, or database query tracking.

**Implementation:**

#### Vercel Speed Insights (Already installed, configure properly)

```typescript
// src/app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

#### Custom Performance Monitoring

```typescript
// src/lib/performance.ts
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)
  }

  getAverage(name: string): number {
    const values = this.metrics.get(name) || []
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
  }

  getPercentile(name: string, percentile: number): number {
    const values = (this.metrics.get(name) || []).sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * values.length) - 1
    return values[index] || 0
  }

  recordApiCall(endpoint: string, duration: number): void {
    this.recordMetric(`api.${endpoint}`, duration)
  }

  recordDbQuery(query: string, duration: number): void {
    this.recordMetric(`db.${query}`, duration)
  }
}

export const perfMonitor = new PerformanceMonitor()
```

```typescript
// src/server/api/trpc.ts
import { perfMonitor } from '@/lib/performance'

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  middleware: async ({ ctx, next }) => {
    const start = Date.now()
    const result = await next()
    const duration = Date.now() - start
    
    perfMonitor.recordApiCall(ctx._meta?.procedure?.path || 'unknown', duration)
    
    return result
  },
})
```

#### Database Query Monitoring

```typescript
// src/server/db.ts
import { PrismaClient } from '@prisma/client'
import { perfMonitor } from '@/lib/performance'

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
})

prisma.$on('query', (e) => {
  perfMonitor.recordDbQuery(e.query, e.duration)
  
  if (e.duration > 1000) {
    console.warn(`Slow query detected: ${e.query} took ${e.duration}ms`)
  }
})

export { prisma }
```

#### Performance Health Check Endpoint

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { perfMonitor } from '@/lib/performance'
import { prisma } from '@/server/db'

export async function GET() {
  const checks = {
    database: false,
    apiLatency: perfMonitor.getAverage('api.*'),
    dbLatency: perfMonitor.getAverage('db.*'),
    timestamp: new Date().toISOString(),
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch (error) {
    console.error('Database health check failed:', error)
  }

  const isHealthy = checks.database && checks.apiLatency < 1000 && checks.dbLatency < 500

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks,
    },
    { status: isHealthy ? 200 : 503 }
  )
}
```

#### Lighthouse CI Integration

```bash
npm install -D @lhci/cli
```

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main, preview]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/catalog
          uploadArtifacts: true
          temporaryPublicStorage: true
```

**Validation:**
- Monitor performance metrics in production
- Set up alerts for slow queries
- Verify health check endpoint works
- Review Lighthouse scores

---

### 9. Implement Health Check Endpoint

**Status:** Not implemented  
**Effort:** 2-3 hours  
**Impact:** High for production monitoring

**Issue:** No health check endpoint for uptime monitoring and load balancer health checks.

**Implementation:**

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { perfMonitor } from '@/lib/performance'

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  checks: {
    database: {
      status: 'pass' | 'fail'
      latency?: number
      error?: string
    }
    cache?: {
      status: 'pass' | 'fail' | 'skip'
      latency?: number
    }
    performance: {
      apiLatency: number
      dbLatency: number
      status: 'pass' | 'fail' | 'skip'
    }
  }
}

export async function GET(request: Request) {
  const startTime = Date.now()
  const checks: HealthCheck['checks'] = {
    database: { status: 'fail' },
    performance: {
      apiLatency: perfMonitor.getAverage('api.*') || 0,
      dbLatency: perfMonitor.getAverage('db.*') || 0,
      status: 'skip',
    },
  }

  // Database health check
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    checks.database = {
      status: 'pass',
      latency: Date.now() - dbStart,
    }
  } catch (error) {
    checks.database = {
      status: 'fail',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  // Cache health check (if Redis is configured)
  if (process.env.REDIS_URL) {
    try {
      const { cache } = await import('@/lib/cache')
      const cacheStart = Date.now()
      await cache.set('health-check', 'ok', 10)
      await cache.get('health-check')
      checks.cache = {
        status: 'pass',
        latency: Date.now() - cacheStart,
      }
    } catch (error) {
      checks.cache = {
        status: 'fail',
        latency: 0,
      }
    }
  }

  // Performance check
  if (checks.performance.apiLatency > 0 || checks.performance.dbLatency > 0) {
    const apiHealthy = checks.performance.apiLatency < 1000
    const dbHealthy = checks.performance.dbLatency < 500
    checks.performance.status = apiHealthy && dbHealthy ? 'pass' : 'fail'
  }

  // Determine overall health
  const allChecks = Object.values(checks).flatMap(c => 
    c && typeof c === 'object' && 'status' in c ? c.status : []
  )
  
  const hasFailures = allChecks.includes('fail')
  const hasPasses = allChecks.includes('pass')
  
  const status: HealthCheck['status'] = hasFailures 
    ? 'unhealthy' 
    : hasPasses 
      ? 'healthy' 
      : 'degraded'

  const response: HealthCheck = {
    status,
    timestamp: new Date().toISOString(),
    checks,
  }

  return NextResponse.json(response, {
    status: status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Response-Time': `${Date.now() - startTime}ms`,
    },
  })
}
```

**Add to monitoring configuration:**

```yaml
# Example for UptimeRobot or similar service
# Monitor: https://your-domain.com/api/health
# Expected status: 200
# Alert on: 503 (unhealthy)
```

**Validation:**
- Test health check endpoint locally
- Verify it returns correct status codes
- Test with database down
- Test with cache down (if configured)

---

### 10. Complete API Documentation

**Status:** Not implemented  
**Effort:** 8-12 hours  
**Impact:** Medium for developer experience

**Issue:** No OpenAPI spec or API documentation for tRPC endpoints.

**Implementation:**

#### Option A: tRPC OpenAPI (Recommended)

```bash
npm install @trpc/openapi
```

```typescript
// src/server/api/trpc.ts
import { initTRPC } from '@trpc/server'
import { createOpenApiHttpHandler } from '@trpc/openapi'
import superjson from 'superjson'

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

// Create OpenAPI handler
export const openApiHandler = createOpenApiHttpHandler({
  router: appRouter,
  createContext,
  responseMeta: undefined,
  onError: undefined,
})
```

```typescript
// src/app/api/trpc/[...trpc]/route.ts
import { openApiHandler } from '@/server/api/trpc'

export { openApiHandler as GET, openApiHandler as POST }
```

```typescript
// src/server/api/routers/collection/collection.ts
import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/api/trpc'

const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
})

export const collectionRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/collection',
        tags: ['collections'],
        summary: 'Create a new collection',
        description: 'Creates a new collection for the authenticated user',
      },
    })
    .input(createCollectionSchema)
    .output(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      isPublic: z.boolean(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.collection.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
        },
      })
    }),

  getAll: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/collections',
        tags: ['collections'],
        summary: 'Get all user collections',
        description: 'Retrieves all collections belonging to the authenticated user',
      },
    })
    .query(async ({ ctx }) => {
      return ctx.db.collection.findMany({
        where: { createdById: ctx.session.user.id },
        include: { _count: { select: { links: true } } },
        orderBy: { order: 'asc' },
      })
    }),

  getPublic: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/collection/public',
        tags: ['collections'],
        summary: 'Get public collection',
        description: 'Retrieves the featured public collection with top links',
      },
    })
    .query(async ({ ctx }) => {
      const collection = await ctx.db.collection.findFirst({
        where: { isPublic: true },
        include: {
          links: {
            take: 10,
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!collection) return null

      return {
        ...collection,
        topLinks: collection.links,
      }
    }),
})
```

#### Option B: Swagger UI Integration

```bash
npm install swagger-ui-react swagger-ui-dist
```

```typescript
// src/app/api/docs/route.ts
import { NextResponse } from 'next/server'
import { generateOpenApiDocument } from '@trpc/openapi'
import { appRouter } from '@/server/api/root'

export async function GET() {
  const openApiDocument = generateOpenApiDocument(appRouter, {
    title: 'Deadronos URL List API',
    version: '1.0.0',
    description: 'API for managing collections and links',
  })

  return NextResponse.json(openApiDocument)
}
```

```typescript
// src/app/api/docs/page.tsx
'use client'

import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-dist/swagger-ui.css'

export default function ApiDocs() {
  return (
    <div className="min-h-screen">
      <SwaggerUI url="/api/docs" />
    </div>
  )
}
```

#### API Documentation Page

```markdown
# API Documentation

## Base URL
```
https://your-domain.com/api/trpc
```

## Authentication
Most endpoints require authentication via NextAuth session. Include session cookie in requests.

## Endpoints

### Collections

#### Create Collection
```http
POST /api/trpc/collection.create
```

**Request Body:**
```json
{
  "name": "My Collection",
  "description": "A collection of useful links",
  "isPublic": false
}
```

**Response:**
```json
{
  "result": {
    "data": {
      "id": "clxxx...",
      "name": "My Collection",
      "description": "A collection of useful links",
      "isPublic": false,
      "createdAt": "2026-01-29T00:00:00.000Z",
      "updatedAt": "2026-01-29T00:00:00.000Z"
    }
  }
}
```

#### Get All Collections
```http
GET /api/trpc/collection.getAll
```

**Response:**
```json
{
  "result": {
    "data": [
      {
        "id": "clxxx...",
        "name": "My Collection",
        "description": "A collection of useful links",
        "isPublic": false,
        "_count": { "links": 5 }
      }
    ]
  }
}
```

### Links

#### Create Link
```http
POST /api/trpc/link.create
```

**Request Body:**
```json
{
  "collectionId": "clxxx...",
  "url": "https://example.com",
  "name": "Example Site",
  "comment": "A useful resource"
}
```

## Error Responses

All errors follow this format:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in to perform this action",
    "data": {
      "code": "UNAUTHORIZED",
      "httpStatus": 401
    }
  }
}
```

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per minute per IP

## SDKs

### TypeScript/JavaScript
```bash
npm install @trpc/client @trpc/react-query
```

```typescript
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/server/api/root'

export const api = createTRPCReact<AppRouter>()

// Usage
const { data } = api.collection.getAll.useQuery()
```
```

**Validation:**
- Test OpenAPI spec generation
- Verify Swagger UI renders correctly
- Test API calls against documented endpoints
- Update documentation when adding new endpoints

---

## Low Priority Recommendations

### 11. Bundle Analysis and Optimization

**Status:** Not implemented  
**Effort:** 4-6 hours  
**Impact:** Medium for performance

**Issue:** No bundle analysis, potential for optimization.

**Implementation:**

```bash
npm install -D @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config
}

module.exports = withBundleAnalyzer(nextConfig)
```

```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build"
  }
}
```

**Optimization Strategies:**

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false,
})
```

```typescript
// Route-based code splitting
// Already handled by Next.js App Router
```

**Validation:**
- Run bundle analyzer
- Identify largest chunks
- Implement code splitting
- Measure improvement

---

### 12. Add Load Testing Framework

**Status:** Not implemented  
**Effort:** 8-12 hours  
**Impact:** Medium for scalability planning

**Issue:** No load testing, scalability limits unknown.

**Implementation:**

```bash
npm install -D k6
```

```javascript
// tests/load/public-catalog.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
}

export default function () {
  const res = http.get('http://localhost:3000/')
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })
  sleep(1)
}
```

```javascript
// tests/load/api-collections.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 0 },
  ],
}

export default function () {
  const res = http.get('http://localhost:3000/api/trpc/collection.getPublic')
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has data': (r) => JSON.parse(r.body).result.data !== null,
  })
  sleep(0.5)
}
```

```json
// package.json
{
  "scripts": {
    "test:load": "k6 run tests/load/",
    "test:load:public": "k6 run tests/load/public-catalog.js",
    "test:load:api": "k6 run tests/load/api-collections.js"
  }
}
```

**Validation:**
- Run load tests locally
- Identify bottlenecks
- Optimize based on results
- Document performance limits

---

### 13. Visual Regression Testing

**Status:** Storybook configured, no visual tests  
**Effort:** 10-14 hours  
**Impact:** Medium for UI consistency

**Issue:** No visual regression testing, UI changes may go unnoticed.

**Implementation:**

```bash
npm install -D @percy/cli @percy/playwright
```

```typescript
// tests/visual/public-catalog.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Visual Regression', () => {
  test('public catalog page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveScreenshot('public-catalog.png')
  })

  test('dashboard page', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveScreenshot('dashboard.png')
  })

  test('collection detail page', async ({ page }) => {
    await page.goto('/collections/test-id')
    await expect(page).toHaveScreenshot('collection-detail.png')
  })
})
```

```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression

on:
  pull_request:
    branches: [main, preview]

jobs:
  visual:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run visual tests
        run: npx playwright test tests/visual/
      
      - name: Upload screenshots
        uses: actions/upload-artifact@v4
        with:
          name: screenshots
          path: tests/visual/screenshots/
```

**Validation:**
- Run visual tests locally
- Review screenshot diffs
- Set up Percy integration
- Configure approval workflow

---

### 14. Advanced Search Features

**Status:** Basic search implemented  
**Effort:** 12-16 hours  
**Impact:** Medium for user experience

**Issue:** Search is basic, missing filters and advanced features.

**Implementation:**

```typescript
// src/server/api/routers/collection/catalog.ts
const searchSchema = z.object({
  q: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  minLinks: z.number().optional(),
  maxLinks: z.number().optional(),
  sortBy: z.enum(['updated', 'created', 'name', 'links']).default('updated'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const collectionRouter = createTRPCRouter({
  search: publicProcedure
    .input(searchSchema)
    .query(async ({ ctx, input }) => {
      const where: Prisma.CollectionWhereInput = {
        isPublic: true,
      }

      // Text search
      if (input.q) {
        where.OR = [
          { name: { contains: input.q, mode: 'insensitive' } },
          { description: { contains: input.q, mode: 'insensitive' } },
        ]
      }

      // Date range filter
      if (input.dateFrom || input.dateTo) {
        where.createdAt = {}
        if (input.dateFrom) {
          where.createdAt.gte = input.dateFrom
        }
        if (input.dateTo) {
          where.createdAt.lte = input.dateTo
        }
      }

      // Link count filter
      if (input.minLinks || input.maxLinks) {
        where.links = {}
        if (input.minLinks) {
          where.links.some = { order: { gte: input.minLinks } }
        }
        if (input.maxLinks) {
          where.links.some = { order: { lte: input.maxLinks } }
        }
      }

      // Sorting
      const orderBy: Prisma.CollectionOrderByWithRelationInput = {}
      switch (input.sortBy) {
        case 'updated':
          orderBy.updatedAt = input.sortOrder
          break
        case 'created':
          orderBy.createdAt = input.sortOrder
          break
        case 'name':
          orderBy.name = input.sortOrder
          break
        case 'links':
          orderBy.links = { _count: input.sortOrder }
          break
      }

      const [collections, totalCount] = await Promise.all([
        ctx.db.collection.findMany({
          where,
          orderBy,
          include: {
            _count: { select: { links: true } },
            links: {
              take: 5,
              orderBy: { order: 'asc' },
            },
          },
        }),
        ctx.db.collection.count({ where }),
      ])

      return {
        items: collections,
        totalCount,
        filters: input,
      }
    }),
})
```

```typescript
// src/components/search-filters.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void
}

export function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('updated')
  const [sortOrder, setSortOrder] = useState('desc')

  const handleSearch = () => {
    onSearch({
      q: query || undefined,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
    })
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div>
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search collections..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sortBy">Sort By</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sortBy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Last Updated</SelectItem>
              <SelectItem value="created">Date Created</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="links">Number of Links</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sortOrder">Order</Label>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger id="sortOrder">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSearch} className="w-full">
        Search
      </Button>
    </div>
  )
}
```

**Validation:**
- Test all search filters
- Verify sorting works correctly
- Check performance with large datasets
- Test edge cases

---

### 15. User Profile Pages

**Status:** Not implemented  
**Effort:** 16-20 hours  
**Impact:** Medium for social features

**Issue:** No user profile pages, collections exist but no user landing.

**Implementation:**

```typescript
// src/app/u/[userId]/page.tsx
import { api } from '@/trpc/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserPageProps {
  params: { userId: string }
}

export default async function UserPage({ params }: UserPageProps) {
  const user = await api.user.getById({ id: params.userId })
  
  if (!user) {
    notFound()
  }

  const collections = await api.collection.getByUser({ userId: params.userId })

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* User Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <p className="text-muted-foreground">
                {collections.length} public collection{collections.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Public Collections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Card key={collection.id}>
            <CardHeader>
              <CardTitle>{collection.name}</CardTitle>
              {collection.description && (
                <p className="text-sm text-muted-foreground">
                  {collection.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {collection._count?.links || 0} links
              </p>
              <a
                href={`/collections/${collection.id}`}
                className="text-primary hover:underline"
              >
                View Collection →
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      {collections.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No public collections yet
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

```typescript
// src/server/api/routers/user/user.ts
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { z } from 'zod'

export const userRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          image: true,
          email: false, // Don't expose email
        },
      })
    }),

  getByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      // This would require adding username field to User model
      return ctx.db.user.findFirst({
        where: { name: input.username },
        select: {
          id: true,
          name: true,
          image: true,
        },
      })
    }),
})
```

```typescript
// src/server/api/routers/collection/collection.ts
export const collectionRouter = createTRPCRouter({
  // ... existing procedures

  getByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.collection.findMany({
        where: {
          createdById: input.userId,
          isPublic: true,
        },
        include: {
          _count: { select: { links: true } },
        },
        orderBy: { updatedAt: 'desc' },
      })
    }),
})
```

**Validation:**
- Test user profile page
- Verify only public collections are shown
- Test with non-existent user
- Add to navigation

---

## Implementation Roadmap

### Phase 1: Production Readiness (Week 1-2)
- [ ] Add middleware for security headers
- [ ] Implement database migrations
- [ ] Add error boundaries
- [ ] Complete RLS policies
- [ ] Add deployment configuration

### Phase 2: Performance & Monitoring (Week 3-4)
- [ ] Add caching layer (ISR or Redis)
- [ ] Create E2E test suite
- [ ] Add performance monitoring
- [ ] Implement health check endpoint
- [ ] Complete API documentation

### Phase 3: Optimization & Features (Week 5-8)
- [ ] Bundle analysis and optimization
- [ ] Add load testing framework
- [ ] Visual regression testing
- [ ] Advanced search features
- [ ] User profile pages

---

## Success Metrics

### Before Production Launch
- [ ] All high-priority items completed
- [ ] E2E tests passing in CI
- [ ] Security scan passing
- [ ] Performance benchmarks met (Lighthouse score > 90)
- [ ] Health check endpoint operational
- [ ] Deployment pipeline tested

### Post-Launch Monitoring
- [ ] API response time < 500ms (p95)
- [ ] Database query time < 100ms (p95)
- [ ] Error rate < 0.1%
- [ ] Uptime > 99.9%
- [ ] Cache hit rate > 70%

---

## Conclusion

This project has an excellent foundation with sophisticated engineering practices. The recommendations above focus on operational maturity, performance optimization, and feature completeness. Implementing these recommendations will transform this from a well-engineered prototype into a production-ready application.

The codebase is maintainable, type-safe, and follows modern best practices. The main gaps are in infrastructure and operational readiness, which are additions rather than rewrites.

**Recommended next step:** Begin with Phase 1 (Production Readiness) items, starting with middleware implementation and database migrations. These are foundational for any production deployment.

---

**Document Version:** 1.0  
**Last Updated:** January 29, 2026  
**Next Review:** After Phase 1 completion
