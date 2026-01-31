# Sentry Error Reporting

This document describes Sentry integration for error tracking and monitoring.

## Overview

The application uses Sentry for:

- Client-side error capture (browser errors, React errors)
- Server-side error capture (API route errors, tRPC errors)
- Performance monitoring (traces, slow transactions)
- Session replay (debug user issues)

## Setup

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io) and sign up
2. Create a new project: **Next.js**
3. Copy the **DSN** from project settings

### 2. Install Sentry SDK

```bash
npm install @sentry/nextjs
```

### 3. Configure Environment Variables

Add to your environment (`.env` for local, Vercel for production):

```bash
# Sentry DSN (Data Source Name)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/123456
```

### 4. Update Configuration Files

Configuration is already set up in:

- `sentry.client.config.ts` - Browser error capture
- `sentry.server.config.ts` - Server error capture

These files are imported in:

- `src/app/layout.tsx` - Initializes client Sentry
- `src/app/global-error.tsx` - Error boundary with Sentry

## How It Works

### Client-Side Errors

Sentry automatically captures:

- Unhandled JavaScript errors
- React error boundary errors
- Promise rejections
- Network errors (via custom instrumentation)

Example of captured error:

```typescript
try {
  await someAsyncOperation();
} catch (error) {
  Sentry.captureException(error);
}
```

### Server-Side Errors

Sentry captures:

- tRPC procedure errors
- API route errors
- Unhandled exceptions in server components

Example:

```typescript
export async function GET() {
  try {
    await fetchData();
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### Error Boundary

The `global-error.tsx` file wraps the entire app and:

- Catches React errors
- Displays friendly error message
- Reports to Sentry
- Provides retry functionality

### Performance Monitoring

Sentry tracks:

- Page load times
- API response times
- Database query times
- Transaction traces

Configuration:

- `tracesSampleRate: 0.1` (10% of transactions)
- `replaysSessionSampleRate: 0.1` (10% of sessions)
- `replaysOnErrorSampleRate: 1.0` (100% on error)

## Viewing Errors

### Sentry Dashboard

Go to [sentry.io](https://sentry.io) to view:

- **Issues:** All errors grouped by type
- **Performance:** Transaction traces and slow operations
- **Replays:** Session recordings of errors

### Error Details

Each error includes:

- Stack trace
- Browser/device information
- User context (if authenticated)
- Custom tags (error type, file)
- Breadcrumbs (events leading to error)

## Filtering Noise

### Ignoring Errors

Add to `sentry.client.config.ts`:

```typescript
beforeSend(event, hint) {
  if (event.exception) {
    const error = hint.originalException;

    // Ignore specific errors
    if (error instanceof TypeError && error.message.includes("ResizeObserver")) {
      return null;
    }
  }
  return event;
}
```

### Tagging Errors

Already implemented in configuration:

- `errorType`: Error name (e.g., `TypeError`, `ReferenceError`)
- `file`: File where error occurred
- `environment`: `development`, `preview`, `production`

## Testing

### Verify Setup

1. Throw a test error:

```typescript
throw new Error("Sentry test error");
```

2. Check Sentry dashboard - error should appear within seconds

### Local Development

Sentry is **disabled** in test environment. Enable in `.env`:

```bash
NODE_ENV=development
NEXT_PUBLIC_SENTRY_DSN=your-dsn
```

## Best Practices

1. **Don't Capture PII:**
   - Avoid logging user emails, passwords, or tokens
   - Use `mask` option for sensitive fields

2. **Use Descriptive Errors:**

   ```typescript
   // Good
   throw new Error(`Failed to fetch collection ${collectionId}`);

   // Bad
   throw new Error("Error");
   ```

3. **Add Context:**

   ```typescript
   Sentry.withScope((scope) => {
     scope.setTag("action", "delete-collection");
     scope.setUser({ id: userId });
     Sentry.captureException(error);
   });
   ```

4. **Monitor Performance:**
   - Set up alerts for error rate increases
   - Track error-free percentage
   - Review slow transactions

5. **Review Regularly:**
   - Check Sentry dashboard weekly
   - Address high-priority issues
   - Ignore expected errors appropriately

## Troubleshooting

### Errors Not Appearing

1. Check `NEXT_PUBLIC_SENTRY_DSN` is set correctly
2. Verify network requests to `sentry.io` aren't blocked
3. Check browser console for Sentry errors
4. Ensure `NODE_ENV` is not `test`

### Too Many Errors

1. Review issues in Sentry dashboard
2. Add filters to ignore expected errors
3. Check for infinite loops causing repeated errors
4. Use `beforeSend` to filter programmatically

### Performance Overhead

If Sentry affects performance:

```typescript
tracesSampleRate: 0.01, // Reduce from 0.1 to 0.01 (1% instead of 10%)
```

## Cost Considerations

Sentry free tier includes:

- 5,000 errors/month
- 5,000 transactions/month
- 30 days data retention
- Unlimited team members

This is sufficient for most small-to-medium applications.

Monitor usage and upgrade if:

- Approaching error limit regularly
- Need longer data retention
- Require additional features (e.g., custom rules)

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Error Monitoring](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- [Sentry Performance Monitoring](https://docs.sentry.io/platforms/javascript/performance/)
