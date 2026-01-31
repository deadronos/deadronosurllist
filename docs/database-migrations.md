# Database Migrations

This guide covers how to work with Prisma migrations for the deadronosurllist project.

## Overview

This project uses Prisma as the ORM and PostgreSQL as the database. Migrations are managed through Prisma's migration system.

## Local Development

### Creating a New Migration

When making changes to `prisma/schema.prisma`, you need to create a migration:

```bash
prisma migrate dev --name your_migration_name
```

This will:

1. Generate a new migration file in `prisma/migrations/`
2. Apply the migration to your local database
3. Update `prisma/schema.prisma` to reflect the changes
4. Regenerate the Prisma Client

### Resetting the Database

If you need to reset your local database and reapply all migrations:

```bash
prisma migrate reset
```

⚠️ **Warning:** This will delete all data in your database!

### Using `db push` for Development

During rapid prototyping, you can use `db push` to apply schema changes without creating a migration:

```bash
prisma db push
```

⚠️ **Note:** `prisma db push` should **only** be used for development. It bypasses the migration history and is not suitable for production deployment.

## Production Deployment

### Deploying Migrations

When deploying to production, use `prisma migrate deploy`:

```bash
prisma migrate deploy
```

This command:

- Only applies new migrations that haven't been run yet
- Is safe to run multiple times (idempotent)
- Does not generate any new migrations or modify the schema file

### Vercel Deployment

For Vercel deployments, add a Build Step or Postgres Extension hook to run migrations:

Option 1 - Build Command:

```bash
# Set in Vercel project settings
Build Command: prisma migrate deploy && next build
```

Option 2 - Postgres Extension (recommended):

- Vercel automatically runs migrations via the Postgres extension when connected to Vercel Postgres
- No manual migration deployment step needed

### Required Environment Variables

Ensure these are set in your production environment:

- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection (for Prisma Accelerate)
- `POSTGRES_PRISMA_URL` - Prisma-specific connection string (for connection pooling)

## Rollback Procedures

### Rolling Back a Migration Locally

If you need to undo a recent migration:

1. **Resolve migration files manually:**

   ```bash
   prisma migrate resolve --rolled-back <migration_name>
   ```

   This marks the migration as rolled back without reverting the schema.

2. **To revert schema changes:**
   - Create a new migration that undoes the changes
   - Or use `prisma migrate reset` (destroys all data)

### Rolling Back in Production

⚠️ **Critical:** Rolling back in production requires careful planning:

1. **Never run `prisma migrate reset` in production** - it deletes all data

2. **Safe rollback process:**
   - Create a new migration that reverts the changes
   - Test thoroughly in staging
   - Deploy using `prisma migrate deploy`

3. **Emergency rollback:**
   - Restore from a database backup (if available)
   - Ensure backups are taken before major migrations

## Troubleshooting

### Migration Conflicts

If multiple developers create migrations with the same name or changes conflict:

```bash
# Resolve by reapplying the migration
prisma migrate resolve --applied <migration_name>
```

### Failed Migrations

If a migration fails:

1. Check the error message for specific issues
2. Fix the issue in the schema or migration file
3. Run `prisma migrate resolve --applied <migration_name>` if manually fixed
4. Or `prisma migrate resolve --rolled-back <migration_name>` to skip

### Connection Issues

If you can't connect to the database:

- Verify `DATABASE_URL` is set correctly
- Check network/firewall settings
- Ensure database server is running (for local development)

## Best Practices

1. **Always create migrations in development** with `prisma migrate dev`
2. **Write descriptive migration names** - e.g., `add_user_index` instead of `update_schema`
3. **Review migration files** before committing to ensure they look correct
4. **Test migrations in a staging environment** before production
5. **Backup production databases** before major migrations
6. **Use transaction blocks** for complex data transformations in migrations

## Additional Resources

- [Prisma Migrations Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Migration Guide](https://www.prisma.io/docs/guides/database/migrating-to-prisma)
- [Vercel Postgres & Prisma](https://vercel.com/docs/storage/vercel-postgres/quickstart#prisma-orm)
