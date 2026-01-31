# Database Security Guide

This guide provides instructions for securing your PostgreSQL database using Row-Level Security (RLS) and least-privilege database credentials.

## Current Security Status

✅ **Row Level Security (RLS) Enabled**: All tables have RLS enabled via migration `20251226164724_enable_rls`

⚠️ **Application-Level Authorization**: The application currently enforces data access control at the application level through tRPC procedures, not at the database level

✅ **Public Data Access**: RLS policies allow public read access to collections marked as `isPublic` and their associated links

## RLS Current State

The current RLS implementation provides **defense-in-depth** protection with the following policies:

### Enabled Tables
- `Collection` - RLS enabled
- `Link` - RLS enabled  
- `Post` - RLS enabled
- `Account` - RLS enabled (NextAuth)
- `Session` - RLS enabled (NextAuth)
- `User` - RLS enabled (NextAuth)
- `VerificationToken` - RLS enabled (NextAuth)

### Active Policies
1. **Public collections are viewable by everyone** - Allows SELECT on `Collection` where `isPublic = true`
2. **Links in public collections are viewable** - Allows SELECT on `Link` where parent collection is public

## Migration Path Options

### Option 1: Implement Full RLS (Recommended for High Security)

To fully leverage RLS, you need to set the current user ID at the database level for each request:

1. **Modify Prisma connection to use transaction-level settings:**

```typescript
// src/server/db.ts
// Add this helper function
async function withUser<T>(
  userId: string,
  operation: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    // Set the user ID for this transaction
    await tx.$executeRaw`SET LOCAL app.current_user_id = ${userId}`;
    return await operation(tx);
  });
}
```

2. **Update tRPC context to wrap database operations:**

```typescript
// src/server/api/trpc.ts
export const createTRPCContext = async (
  opts: CreateContextOptions,
): Promise<TRPCContext> => {
  const session = await auth();
  
  // Wrap db operations with user context if authenticated
  const dbWithContext = session?.user?.id 
    ? wrapDbWithUserContext(db, session.user.id)
    : db;

  return {
    db: dbWithContext,
    session,
    ...opts,
  };
};
```

3. **Apply the missing RLS policies (see `docs/rls-policies.sql`)**

### Option 2: Least-Privilege Database User (Simpler, Production-Ready)

Create dedicated database roles with minimal required permissions:

#### 1. Create Application Role

```sql
-- Connect as postgres superuser
-- Create a role for the application with limited permissions
CREATE ROLE linklistapp WITH LOGIN PASSWORD 'your-secure-password-here';

-- Grant CONNECT on database
GRANT CONNECT ON DATABASE deadronosurllist TO linklistapp;

-- Grant USAGE on schema
GRANT USAGE ON SCHEMA public TO linklistapp;

-- Grant table permissions (SELECT, INSERT, UPDATE, DELETE only)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO linklistapp;

-- Grant sequence permissions for auto-increment IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO linklistapp;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO linklistapp;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT USAGE, SELECT ON SEQUENCES TO linklistapp;
```

#### 2. Create Migration Role (for deployments)

```sql
-- Create a role for running migrations with more privileges
CREATE ROLE linklistmigrate WITH LOGIN PASSWORD 'your-migration-password-here';

-- Grant schema modification permissions
GRANT CONNECT ON DATABASE deadronosurllist TO linklistmigrate;
GRANT USAGE, CREATE ON SCHEMA public TO linklistmigrate;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO linklistmigrate;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO linklistmigrate;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT ALL PRIVILEGES ON TABLES TO linklistmigrate;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT ALL PRIVILEGES ON SEQUENCES TO linklistmigrate;
```

#### 3. Update Environment Variables

```bash
# For application runtime (least privilege)
DATABASE_URL="postgresql://linklistapp:your-secure-password-here@localhost:5432/deadronosurllist"

# For migrations only (elevated privileges)
MIGRATION_DATABASE_URL="postgresql://linklistmigrate:your-migration-password-here@localhost:5432/deadronosurllist"
```

#### 4. Update Deployment Scripts

```bash
# Run migrations with migration role
DATABASE_URL="$MIGRATION_DATABASE_URL" npm run db:migrate:deploy

# Start application with application role
DATABASE_URL="$DATABASE_URL" npm start
```

### Option 3: Hybrid Approach (Recommended)

Combine both approaches:
1. Use least-privilege credentials (Option 2) for basic security
2. Implement RLS policies for defense-in-depth
3. Keep application-level checks as the primary authorization mechanism

This provides multiple layers of security:
- **Layer 1**: Application-level authorization in tRPC procedures
- **Layer 2**: Database-level RLS policies (defense-in-depth)
- **Layer 3**: Least-privilege database credentials

## Testing RLS Policies

If you implement full RLS (Option 1), test the policies:

```bash
# Connect as the application user
psql "$DATABASE_URL"

# Set the user ID
SET app.current_user_id = 'some-user-id-here';

# Try to query collections - should only see owned collections
SELECT * FROM "Collection";

# Try to insert a collection with wrong owner - should fail
INSERT INTO "Collection" (id, name, "createdById") 
VALUES ('test', 'Test', 'different-user-id');
```

## Security Checklist

- [ ] Choose migration path (Option 1, 2, or 3)
- [ ] Create least-privilege database roles
- [ ] Update environment variables with role credentials
- [ ] If using RLS: Implement transaction-level user context
- [ ] If using RLS: Apply complete RLS policies
- [ ] Test database access with application role
- [ ] Update deployment scripts to use migration role
- [ ] Document credentials in your secrets management system
- [ ] Rotate database passwords regularly
- [ ] Monitor database logs for unauthorized access attempts

## Additional Security Recommendations

1. **Enable SSL/TLS** for database connections in production:
   ```
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```

2. **Use connection pooling** with PgBouncer or Prisma's built-in pooling

3. **Regular backups** with encrypted storage

4. **Database firewall rules** to restrict network access

5. **Audit logging** to track all database operations

6. **Regular security updates** for PostgreSQL

## Resources

- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Prisma Security Best Practices](https://www.prisma.io/docs/guides/security)
- [OWASP Database Security](https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html)
