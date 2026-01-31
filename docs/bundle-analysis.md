# Bundle Analysis & Performance Budgets

This document covers how to analyze and optimize the application bundle.

## Overview

Bundle analysis helps you understand:

- What JavaScript/CSS is being loaded
- Which modules contribute most to bundle size
- How to reduce bundle size and improve performance

## Running Bundle Analysis

### Analyze Production Build

```bash
npm run analyze
```

This will:

1. Build the application with `ANALYZE=true`
2. Generate interactive bundle analysis
3. Open in your browser automatically

### What to Look For

**Large Bundles:**

- Identify packages that increase bundle size significantly
- Consider alternatives or code splitting

**Duplicate Dependencies:**

- Multiple versions of the same package
- Tree-shaking not working properly

**Unexpected Modules:**

- Code that shouldn't be in production builds
- Development-only code leaking to production

## Bundle Analyzer Output

The analysis shows:

### Pages

Each page's JavaScript/CSS size:

- **gzipped:** Compressed size (what users download)
- **uncompressed:** Original size

### Modules

All modules loaded by the app:

- **Size:** Total module size
- **% of Bundle:** Percentage of total

## Current Performance Budgets

The application has no explicit budgets yet. Consider adding:

### Target Budgets

| Metric                         | Target          | Current |
| ------------------------------ | --------------- | ------- |
| First Contentful Paint (FCP)   | < 1.8s          | TBD     |
| Largest Contentful Paint (LCP) | < 2.5s          | TBD     |
| Time to Interactive (TTI)      | < 3.8s          | TBD     |
| Total Bundle Size              | < 200KB gzipped | TBD     |
| Initial Bundle                 | < 100KB gzipped | TBD     |

### Implementing Budgets

Add to `next.config.js`:

```javascript
const config = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.performance = {
        maxAssetSize: 200000, // 200KB
        maxEntrypointSize: 100000, // 100KB
        hints: "warning",
      };
    }
    return config;
  },
  // ... other config
};
```

## Optimization Strategies

### 1. Code Splitting

Next.js automatically splits code by pages and components.

**Manual Splitting:**

```typescript
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(
  () => import("./heavy-component"),
  { loading: () => <div>Loading...</div> }
);
```

### 2. Tree Shaking

Ensure dependencies export ES modules properly.

**Check:**

```bash
# See what's being bundled
npm run analyze
```

### 3. Use Lightweight Alternatives

| Heavy Package | Alternative    | Savings |
| ------------- | -------------- | ------- |
| `moment.js`   | `date-fns`     | ~70KB   |
| `lodash`      | Native methods | ~70KB   |
| `axios`       | `fetch`        | ~30KB   |

### 4. Dynamic Imports

Load non-critical code on demand:

```typescript
// Before: Loaded immediately
import { Modal } from "./modal";

// After: Loaded when needed
const Modal = dynamic(() => import("./modal"));
```

### 5. Image Optimization

Use Next.js Image component:

- Automatically optimizes images
- Converts to WebP/AVIF
- Lazy loads by default

```typescript
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // For above-the-fold images
/>
```

## Monitoring Bundle Size

### CI/CD Integration

Add to `.github/workflows/ci.yml`:

```yaml
- name: Check bundle size
  run: npm run analyze
  # Add bundle-diff plugin for regression detection
```

### Automated Alerts

Consider tools like:

- **bundle-diff**: Detect size regressions
- **bundlesize**: Enforce size limits in CI

## Performance Monitoring

### Lighthouse

Run Lighthouse audits:

```bash
# Chrome DevTools > Lighthouse tab
# Or use CLI
npx lighthouse https://your-app.vercel.app --view
```

### Vercel Analytics

Already installed (`@vercel/analytics`). Check dashboard for:

- Core Web Vitals
- Page load times
- Device/location breakdown

## Common Issues & Solutions

### Large Bundle from Libraries

**Problem:** Library increases bundle size significantly

**Solution:**

1. Check if there's a smaller alternative
2. Use tree-shakeable imports:

   ```typescript
   // Bad: Imports entire library
   import * as lodash from "lodash";

   // Good: Imports only what's needed
   import { debounce } from "lodash-es";
   ```

### Duplicate Dependencies

**Problem:** Multiple versions of same package

**Solution:**

```bash
# Find duplicates
npm ls --depth=0 | grep -E "\w@.+:\d+\.\d+\.\d+"

# Deduplicate
npm dedupe
```

### Code Not Tree-Shaking

**Problem:** Dead code in production bundle

**Solution:**

1. Ensure using ES modules
2. Check `sideEffects` in package.json
3. Avoid default exports in favor of named exports

## Best Practices

1. **Run Analysis Regularly:**
   - Before major releases
   - After adding new dependencies
   - When bundle size increases

2. **Set Realistic Budgets:**
   - Start with current size + 10%
   - Tighten gradually
   - Account for growth

3. **Monitor Over Time:**
   - Track bundle size trends
   - Investigate sudden increases
   - Celebrate optimizations!

4. **Prioritize Critical Path:**
   - Above-the-fold content first
   - Initial JavaScript bundle
   - First meaningful paint

5. **Leverage Browser Caching:**
   - Long cache headers for static assets
   - CDN distribution (Vercel handles this)
   - Service worker for PWA

## Future Enhancements

Consider implementing:

1. **Automatic Bundle Size Checks in CI**
2. **Performance Budget Enforcement**
3. **Real User Monitoring (RUM)**
4. **Automated Optimization Reports**

## Additional Resources

- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Performance](https://web.dev/performance/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
