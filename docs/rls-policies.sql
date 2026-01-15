-- Complete Row Level Security (RLS) Policies
-- This file contains reference RLS policies for implementing database-level authorization
-- NOTE: These policies require setting `app.current_user_id` at the transaction level
-- See docs/database-security.md for implementation instructions

-- ============================================================================
-- Collection Policies for Authenticated Users
-- ============================================================================

-- Allow authenticated users to view their own collections
CREATE POLICY "Users can view their own collections"
ON "Collection"
FOR SELECT
USING (
  "createdById" = current_setting('app.current_user_id', true)::text
);

-- Allow authenticated users to create collections
CREATE POLICY "Users can create collections"
ON "Collection"
FOR INSERT
WITH CHECK (
  "createdById" = current_setting('app.current_user_id', true)::text
);

-- Allow authenticated users to update their own collections
CREATE POLICY "Users can update their own collections"
ON "Collection"
FOR UPDATE
USING (
  "createdById" = current_setting('app.current_user_id', true)::text
)
WITH CHECK (
  "createdById" = current_setting('app.current_user_id', true)::text
);

-- Allow authenticated users to delete their own collections
CREATE POLICY "Users can delete their own collections"
ON "Collection"
FOR DELETE
USING (
  "createdById" = current_setting('app.current_user_id', true)::text
);

-- ============================================================================
-- Link Policies for Authenticated Users
-- ============================================================================

-- Allow authenticated users to view links in their own collections
CREATE POLICY "Users can view links in their own collections"
ON "Link"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "Collection" c
    WHERE c.id = "Link"."collectionId"
    AND c."createdById" = current_setting('app.current_user_id', true)::text
  )
);

-- Allow authenticated users to create links in their own collections
CREATE POLICY "Users can create links in their own collections"
ON "Link"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Collection" c
    WHERE c.id = "Link"."collectionId"
    AND c."createdById" = current_setting('app.current_user_id', true)::text
  )
);

-- Allow authenticated users to update links in their own collections
CREATE POLICY "Users can update links in their own collections"
ON "Link"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM "Collection" c
    WHERE c.id = "Link"."collectionId"
    AND c."createdById" = current_setting('app.current_user_id', true)::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "Collection" c
    WHERE c.id = "Link"."collectionId"
    AND c."createdById" = current_setting('app.current_user_id', true)::text
  )
);

-- Allow authenticated users to delete links in their own collections
CREATE POLICY "Users can delete links in their own collections"
ON "Link"
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM "Collection" c
    WHERE c.id = "Link"."collectionId"
    AND c."createdById" = current_setting('app.current_user_id', true)::text
  )
);

-- ============================================================================
-- Post Policies for Authenticated Users
-- ============================================================================

-- Allow authenticated users to view their own posts
CREATE POLICY "Users can view their own posts"
ON "Post"
FOR SELECT
USING (
  "createdById" = current_setting('app.current_user_id', true)::text
);

-- Allow authenticated users to create posts
CREATE POLICY "Users can create posts"
ON "Post"
FOR INSERT
WITH CHECK (
  "createdById" = current_setting('app.current_user_id', true)::text
);

-- Allow authenticated users to update their own posts
CREATE POLICY "Users can update their own posts"
ON "Post"
FOR UPDATE
USING (
  "createdById" = current_setting('app.current_user_id', true)::text
)
WITH CHECK (
  "createdById" = current_setting('app.current_user_id', true)::text
);

-- Allow authenticated users to delete their own posts
CREATE POLICY "Users can delete their own posts"
ON "Post"
FOR DELETE
USING (
  "createdById" = current_setting('app.current_user_id', true)::text
);

-- ============================================================================
-- NextAuth Table Policies
-- ============================================================================

-- Account: Users can only access their own accounts
CREATE POLICY "Users can view their own accounts"
ON "Account"
FOR SELECT
USING ("userId" = current_setting('app.current_user_id', true)::text);

CREATE POLICY "Users can create their own accounts"
ON "Account"
FOR INSERT
WITH CHECK ("userId" = current_setting('app.current_user_id', true)::text);

CREATE POLICY "Users can update their own accounts"
ON "Account"
FOR UPDATE
USING ("userId" = current_setting('app.current_user_id', true)::text)
WITH CHECK ("userId" = current_setting('app.current_user_id', true)::text);

CREATE POLICY "Users can delete their own accounts"
ON "Account"
FOR DELETE
USING ("userId" = current_setting('app.current_user_id', true)::text);

-- Session: Users can only access their own sessions
CREATE POLICY "Users can view their own sessions"
ON "Session"
FOR SELECT
USING ("userId" = current_setting('app.current_user_id', true)::text);

CREATE POLICY "Users can create their own sessions"
ON "Session"
FOR INSERT
WITH CHECK ("userId" = current_setting('app.current_user_id', true)::text);

CREATE POLICY "Users can update their own sessions"
ON "Session"
FOR UPDATE
USING ("userId" = current_setting('app.current_user_id', true)::text)
WITH CHECK ("userId" = current_setting('app.current_user_id', true)::text);

CREATE POLICY "Users can delete their own sessions"
ON "Session"
FOR DELETE
USING ("userId" = current_setting('app.current_user_id', true)::text);

-- User: Users can view and update their own profile
CREATE POLICY "Users can view their own profile"
ON "User"
FOR SELECT
USING ("id" = current_setting('app.current_user_id', true)::text);

CREATE POLICY "Users can update their own profile"
ON "User"
FOR UPDATE
USING ("id" = current_setting('app.current_user_id', true)::text)
WITH CHECK ("id" = current_setting('app.current_user_id', true)::text);

-- VerificationToken: Allow operations for authentication flow
-- These are managed by NextAuth and need broader access
CREATE POLICY "Allow verification token creation"
ON "VerificationToken"
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow verification token deletion"
ON "VerificationToken"
FOR DELETE
USING (true);

CREATE POLICY "Allow verification token selection"
ON "VerificationToken"
FOR SELECT
USING (true);

-- ============================================================================
-- IMPORTANT NOTES
-- ============================================================================
--
-- 1. These policies require transaction-level user context:
--    await prisma.$executeRaw`SET LOCAL app.current_user_id = ${userId}`;
--
-- 2. The policies assume user IDs are strings (cuid format)
--
-- 3. Public access policies already exist for Collections and Links where
--    isPublic = true (from migration 20251226164724_enable_rls)
--
-- 4. To apply these policies, create a new migration:
--    npm run db:migrate
--
-- 5. Test policies thoroughly before deploying to production
--
-- 6. Monitor query performance - complex policies can impact performance
--
-- 7. Consider using least-privilege database credentials as an alternative
--    or complementary approach (see docs/database-security.md)
