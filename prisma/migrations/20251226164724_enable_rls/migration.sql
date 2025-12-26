-- Enable RLS on all application tables
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Collection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Link" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on NextAuth tables (to prevent public access)
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

-- Create Policies

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
