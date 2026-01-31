# Caching Strategy

This document describes the caching strategy implemented for the deadronosurllist application.

## Overview

The application uses Next.js **Incremental Static Regeneration (ISR)** for public pages to improve performance and reduce database load.

## Implementation

### Revalidation

Public pages are configured with a `revalidate` export that tells Next.js to regenerate the page periodically.

```typescript
export const revalidate = 60;
```

This value is in **seconds**.

### Cached Pages

The following pages use ISR:

| Page    | Route      | Revalidation | Reason                                  |
| ------- | ---------- | ------------ | --------------------------------------- |
| Home    | `/`        | 60 seconds   | Main landing page with featured content |
| Catalog | `/catalog` | 60 seconds   | Public collections list                 |

### Not Cached

The following pages are **not cached** (dynamic):

| Page        | Route               | Reason                               |
| ----------- | ------------------- | ------------------------------------ |
| Dashboard   | `/dashboard`        | User-specific, authenticated content |
| Collections | `/collections/[id]` | Can be private, user-specific        |
| Sign-in     | `/api/auth/signin`  | Authentication flow                  |
| Auth pages  | `/(auth)/*`         | Authentication flow                  |

## Benefits

- **Improved Performance:** Cached pages are served instantly from the CDN or Next.js cache
- **Reduced Database Load:** Fewer queries for frequently accessed public pages
- **Better UX:** Faster page loads for public content
- **Cost Savings:** Fewer database queries and CDN costs

## Trade-offs

- **Stale Content:** Pages may show content up to 60 seconds old
- **Complexity:** Need to understand revalidation behavior when debugging
- **Cache Invalidation:** Manual revalidation may be needed for urgent updates

## Forcing Revalidation

To manually revalidate a page, use Next.js revalidation API:

### Path-based Revalidation

```typescript
import { revalidatePath } from "next/cache";

revalidatePath("/");
revalidatePath("/catalog");
```

This clears the cache for the specified path on the next request.

### Tag-based Revalidation

For more granular control, you can use tags (not yet implemented):

```typescript
export default async function Page() {
  return <div>...</div>;
}

export const revalidate = 60;
```

## Future Enhancements

Consider implementing:

1. **On-Demand Revalidation:** Trigger revalidation when content changes
2. **Tag-based Cache:** Revalidate by content type (e.g., `collections`, `links`)
3. **Shorter Revalidation for High-Traffic Pages:** Reduce revalidation time during peak hours
4. **Stale-While-Revalidate:** Serve stale content while revalidating in background

## Monitoring

Monitor cache effectiveness using:

- **Vercel Analytics:** Page load times and cache hit rates
- **Next.js Dev Tools:** View cache headers in development
- **CDN Metrics:** Cache hit/miss ratios (if using Vercel CDN)

## Debugging

### Check Cache Headers

```bash
curl -I https://your-app.vercel.app/
```

Look for:

- `x-vercel-cache`: HIT or MISS
- `cache-control`: `s-maxage=60, stale-while-revalidate`

### Disable Caching Locally

For development, caching is automatically disabled.

In production, you can temporarily disable caching by:

- Setting `revalidate = 0`
- Using query parameters to bypass cache
- Using `revalidateTag` to invalidate frequently

## Best Practices

1. **Keep Revalidation Times Reasonable:** Don't cache for too long (stale content) or too short (no benefit)
2. **Test After Deployment:** Verify caching works as expected after deploying
3. **Monitor Performance:** Track cache hit rates and adjust revalidation times
4. **Document Changes:** Update this file when adding/removing cached pages
5. **Use Consistent Values:** Use the same revalidation time for similar pages

## Additional Resources

- [Next.js ISR Documentation](https://nextjs.org/docs/app/building-your-application/caching#incremental-static-regeneration)
- [Next.js Revalidation](https://nextjs.org/docs/app/api-reference/functions/generate-static-params#revalidate)
- [Vercel Caching](https://vercel.com/docs/edge-network/caching)
