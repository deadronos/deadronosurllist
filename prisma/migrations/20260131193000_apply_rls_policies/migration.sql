-- Apply full Row Level Security (RLS) policies for authenticated access.
-- These policies require `SET LOCAL app.current_user_id = <userId>` per request.

-- Collection Policies for Authenticated Users
CREATE POLICY "Users can view their own collections"
ON "Collection"
FOR SELECT
USING (
  "createdById" = current_setting('app.current_user_id', true)::text
);

CREATE POLICY "Users can create collections"
ON "Collection"
FOR INSERT
WITH CHECK (
  "createdById" = current_setting('app.current_user_id', true)::text
);

CREATE POLICY "Users can update their own collections"
ON "Collection"
FOR UPDATE
USING (
  "createdById" = current_setting('app.current_user_id', true)::text
)
WITH CHECK (
  "createdById" = current_setting('app.current_user_id', true)::text
);

CREATE POLICY "Users can delete their own collections"
ON "Collection"
FOR DELETE
USING (
  "createdById" = current_setting('app.current_user_id', true)::text
);

-- Link Policies for Authenticated Users
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

-- Post Policies for Authenticated Users
CREATE POLICY "Users can view their own posts"
ON "Post"
FOR SELECT
USING (
  "createdById" = current_setting('app.current_user_id', true)::text
);

CREATE POLICY "Users can create posts"
ON "Post"
FOR INSERT
WITH CHECK (
  "createdById" = current_setting('app.current_user_id', true)::text
);

CREATE POLICY "Users can update their own posts"
ON "Post"
FOR UPDATE
USING (
  "createdById" = current_setting('app.current_user_id', true)::text
)
WITH CHECK (
  "createdById" = current_setting('app.current_user_id', true)::text
);

CREATE POLICY "Users can delete their own posts"
ON "Post"
FOR DELETE
USING (
  "createdById" = current_setting('app.current_user_id', true)::text
);

-- NextAuth Table Policies
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

CREATE POLICY "Users can view their own profile"
ON "User"
FOR SELECT
USING ("id" = current_setting('app.current_user_id', true)::text);

CREATE POLICY "Users can update their own profile"
ON "User"
FOR UPDATE
USING ("id" = current_setting('app.current_user_id', true)::text)
WITH CHECK ("id" = current_setting('app.current_user_id', true)::text);

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
