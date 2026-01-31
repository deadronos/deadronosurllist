# Production Deployment Runbook

This guide covers deploying the deadronosurllist application to production on Vercel.

## Prerequisites

- Vercel account with appropriate permissions
- Vercel project set up and connected to the GitHub repository
- PostgreSQL database provisioned (Vercel Postgres recommended)
- All environment variables configured

## Required Environment Variables

Configure these in your Vercel project settings under **Settings > Environment Variables**:

### Application Variables

| Variable                 | Description                               | Example                       | Required |
| ------------------------ | ----------------------------------------- | ----------------------------- | -------- |
| `NEXT_PUBLIC_VERCEL_URL` | Public URL of the deployed app            | `https://your-app.vercel.app` | Yes      |
| `DATABASE_URL`           | Prisma database connection (pooled)       | `postgres://...`              | Yes      |
| `DIRECT_URL`             | Direct database connection (non-pooled)   | `postgres://...`              | Yes      |
| `POSTGRES_PRISMA_URL`    | Prisma-specific connection for Accelerate | `postgres://...`              | Yes      |

### Environment-Specific Variables

#### Production

- `NODE_ENV` = `production` (set automatically by Vercel)
- `NEXTAUTH_SECRET` - Required for session security
- `NEXTAUTH_URL` - Should be set to `https://your-app.vercel.app`
- `DISCORD_CLIENT_ID` - Discord OAuth application ID
- `DISCORD_CLIENT_SECRET` - Discord OAuth application secret

#### Preview/Development

- Use the same variables with appropriate preview environment values

### Environment Variable Notes

**Important:** This project uses `dotenvx` locally for development. In Vercel:

- **Recommended:** Use direct `next build` (configured in `vercel.json`)
- **Alternative:** If using `dotenvx run` in Vercel, ensure `dotenvx` is installed and `.env` is not checked in

## GitHub Actions Secrets

The deployment workflows require these repository secrets to be configured:

| Secret | Description |
| --- | --- |
| `VERCEL_TOKEN` | Vercel access token with deploy permissions |
| `VERCEL_ORG_ID` | Vercel organization/team ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

## Deployment Workflow

### Initial Setup

1. **Connect Repository:**

   ```bash
   # In Vercel dashboard: Add New Project > Import from Git
   ```

2. **Configure Environment Variables:**
   - Add all required variables listed above
   - Set them for Production, Preview, and Development environments

3. **Configure Database:**

   ```bash
   # Vercel Postgres is recommended
   # Settings > Storage > Create Database > PostgreSQL
   ```

4. **Build Settings:**
   - Framework Preset: `Next.js`
   - Build Command: `next build` (handled by `vercel.json`)
   - Output Directory: `.next`
   - Install Command: `npm install`

### Standard Deployment

1. **Push Changes:**

   ```bash
   git add .
   git commit -m "feat: your changes"
   git push origin main
   ```

2. **Vercel Auto-Deploys:**
   - Automatically triggers build on push to `main`
   - Runs database migrations automatically (Vercel Postgres extension)
   - Deploys to production URL

3. **Monitor Deployment:**
   - Check Vercel dashboard for build logs
   - Verify health endpoint returns 200: `curl https://your-app.vercel.app/api/health`

### Preview Deployments

Create a preview deployment for testing:

```bash
# Create a new branch
git checkout -b feature/new-feature

# Push changes
git push origin feature/new-feature

# Vercel creates a preview URL automatically
# https://feature-new-feature-your-app.vercel.app
```

## Database Migration Procedure

### Automatic Migrations (Vercel Postgres)

When using Vercel Postgres, migrations are applied automatically:

- No manual migration steps needed
- Vercel runs `prisma migrate deploy` during build
- Migrations run before application starts

### Manual Migrations

If using an external PostgreSQL provider:

1. **During Build:**

   ```bash
   # Add to Vercel build command in project settings
   npm run db:migrate:deploy && npm run build
   ```

2. **Post-Deployment:**

   ```bash
   # If migrations failed during build, run manually
   npm run db:migrate:deploy
   ```

### Rollback Procedure

If a deployment causes issues:

1. **Quick Rollback:**
   - Go to Vercel dashboard > Deployments
   - Click on previous successful deployment
   - Click "Promote to Production"

2. **Database Rollback:**

   ```bash
   # Create a new migration that reverts changes
   # Then deploy as normal
   # See docs/database-migrations.md for detailed rollback steps
   ```

3. **Emergency Rollback:**
   - Restore database from backup (if available)
   - Revert to previous deployment

## Verification Steps

After each deployment, verify the following:

### 1. Health Check

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health
```

Expected response (200 OK):

```json
{
  "status": "ok",
  "timestamp": "2026-01-30T12:00:00.000Z",
  "checks": {
    "database": {
      "status": "ok",
      "type": "postgresql",
      "responseTime": "25ms"
    }
  }
}
```

### 2. Application Smoke Tests

Check that core functionality works:

- [ ] Home page loads: `https://your-app.vercel.app`
- [ ] Public catalog loads: `https://your-app.vercel.app/catalog`
- [ ] Sign-in page loads: `https://your-app.vercel.app/api/auth/signin`
- [ ] Health endpoint responds: `https://your-app.vercel.app/api/health`

### 3. Security Headers Verification

```bash
# Check security headers
curl -I https://your-app.vercel.app
```

Expected headers include:

- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `X-DNS-Prefetch-Control: off`
- `X-Download-Options: noopen`
- `Strict-Transport-Security` (production only)

Or run the test script:

```bash
node scripts/test-security-headers.mjs
```

### 4. Database Connectivity

Verify the application can connect to the database:

- Check health endpoint response
- Look for any database errors in Vercel logs
- Test creating/updating data in the app

## Monitoring and Logging

### Vercel Dashboard

Monitor your deployment:

- **Deployments Tab:** View deployment history and status
- **Logs Tab:** View real-time application logs
- **Analytics Tab:** Track performance and errors

### Health Check Monitoring

Set up uptime monitoring:

- Configure monitoring service (UptimeRobot, Pingdom, etc.)
- Monitor `/api/health` endpoint
- Alert on 503 responses or timeouts

### Error Tracking

Currently, basic error tracking via Vercel logs. Consider adding Sentry for enhanced error tracking (see Phase 3 recommendations).

## Troubleshooting

### Build Failures

**Problem:** Build fails during deployment

**Solutions:**

1. Check build logs for specific errors
2. Verify all environment variables are set
3. Ensure `DATABASE_URL` and `DIRECT_URL` are correct
4. Check that dependencies are up to date

### Migration Failures

**Problem:** Database migrations fail

**Solutions:**

1. Check migration files in `prisma/migrations/`
2. Verify database connection strings
3. Check database permissions
4. Review docs/database-migrations.md for detailed troubleshooting

### Runtime Errors

**Problem:** Application starts but throws errors

**Solutions:**

1. Check Vercel logs for error details
2. Verify health endpoint status
3. Check database connectivity
4. Review security headers configuration

### Environment Variable Issues

**Problem:** Environment variables not available

**Solutions:**

1. Verify variables are set in Vercel project settings
2. Ensure variables are set for the correct environment
3. Check for typos in variable names
4. Redeploy after adding/changing variables

## Best Practices

1. **Test in Preview Environments**
   - Always deploy to preview branches first
   - Run smoke tests on preview URLs
   - Fix issues before merging to main

2. **Monitor Deployments**
   - Watch build logs during deployment
   - Check health endpoint immediately after deployment
   - Set up alerts for 503 responses

3. **Database Backups**
   - Ensure automatic backups are enabled (Vercel Postgres has this by default)
   - Test backup restoration procedures
   - Take manual backups before major schema changes

4. **Security**
   - Never commit `.env` files to Git
   - Rotate sensitive secrets regularly
   - Use Vercel's environment variable encryption
   - Keep dependencies updated

5. **Performance**
   - Monitor page load times
   - Use Vercel Analytics for insights
   - Optimize database queries
   - Enable caching for public pages (see Phase 3)

## Additional Resources

- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Vercel Postgres Quickstart](https://vercel.com/docs/storage/vercel-postgres/quickstart)
- [Database Migration Guide](./database-migrations.md)
- [Project Review Recommendations](../plans/project-review-recommendations.md)
