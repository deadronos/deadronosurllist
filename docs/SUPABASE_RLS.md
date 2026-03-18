# Supabase Row Level Security (RLS) Setup for T3 Stack

This document outlines the strategy and SQL commands to enable Row Level Security (RLS) for this project on Supabase.

## Architecture Context

* **Stack**: T3 Stack (Next.js, tRPC, Prisma, NextAuth.js).
* **Database**: PostgreSQL (hosted on Supabase).
* **Authentication**: NextAuth.js (stores users in `public.User` table with CUIDs).
* **Connection**: Prisma connects via the transaction pooler or direct connection, typically using the `postgres` or `service_role` credentials.

## Security Model

### 1. Prisma (Backend)

Prisma runs server-side using the configured database connection string.

* **Effect**: Whether RLS applies depends on the database role you use. In this app, protected tRPC procedures set `app.current_user_id` transaction-locally via `withUserDb()` so user-scoped RLS policies can be enforced when the runtime role does not bypass RLS.
* **Security**: Application-level authorization still runs in tRPC routers (`protectedProcedure`) and remains the primary guardrail.

### 2. External Access (Supabase API / Studio)

If you enable RLS, you secure the database against:

* Accidental leaks of the `anon` (public) key.
* Unintended access via Supabase Studio or Client SDKs.

### The ID Mismatch Challenge

* **NextAuth User ID**: CUID (String, e.g., `clq...`).
* **Supabase Auth User ID**: UUID (e.g., `550e8400...`).

Because these IDs do not match, **standard Supabase RLS policies relying on `auth.uid()` will not work** for user-specific data (like "Users can only edit their own posts") unless you migrate to Supabase Auth.

**Recommendation**: Enable RLS to "lock down" the database by default, allowing only Public Read access where appropriate. Leave Write access exclusive to the Prisma backend.

## Applying the RLS Configuration

### Option 1: Using Prisma Migrations (Recommended)

RLS is version-controlled in Prisma migrations, including:

* `prisma/migrations/20251226164724_enable_rls/migration.sql`
* `prisma/migrations/20260131193000_apply_rls_policies/migration.sql`

To apply this to your database, simply run:

```bash
npx prisma migrate deploy
```

This ensures the RLS settings are version-controlled and applied consistently across environments.

### Option 2: Manual SQL

If you prefer to run the SQL manually in the Supabase Dashboard SQL Editor, use the script below:

```sql
-- 1. Enable RLS on all application tables
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Collection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Link" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on NextAuth tables (to prevent public access)
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies

-- Allow public read access to Collections marked as 'isPublic'
CREATE POLICY "Public collections are viewable by everyone"
ON "Collection"
FOR SELECT
USING ("isPublic" = true);

-- Allow public read access to Links if their parent Collection is public
CREATE POLICY "Links in public collections are viewable"
ON "Link"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "Collection" c
    WHERE c.id = "Link"."collectionId"
    AND c."isPublic" = true
  )
);

-- OPTIONAL: If you want to allow read access to User profiles (e.g. for public authors)
-- CREATE POLICY "User profiles are viewable" ON "User" FOR SELECT USING (true);

-- NOTE: No "INSERT", "UPDATE", or "DELETE" policies are created for 'anon'.
-- This effectively makes the database Read-Only for public users
-- and Read-Only (scoped) for public data.
-- All writes should go through your server-side Prisma layer using the appropriate runtime role and user context.
```

## Summary

* **Protected Prisma/tRPC flows**: Continue to work with application-level checks and transaction-local `app.current_user_id` context for RLS-aware queries.
* **Supabase Data API**: Can be restricted so anonymous users only query public collections and links; they cannot write data or see private collections.
