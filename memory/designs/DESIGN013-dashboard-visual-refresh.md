# DESIGN013 – Dashboard Visual Refresh & Catalog Link Expansion

## Summary

Refresh the authenticated dashboard experience so it matches the Radix-themed landing page while increasing the public catalog link trim limit to ten entries per collection. The work keeps existing data flows intact, focusing on presentation and a small contract tweak.

## Requirements Addressed

- R1: `requirements.md` → Public Collections Catalog → ensure up to ten top links per collection.
- R2: `requirements.md` → Dashboard Visual Consistency → themed shell on `/dashboard`.
- R3: `requirements.md` → Dashboard Visual Consistency → Radix-styled collection create form.
- R4: `requirements.md` → Dashboard Visual Consistency → themed collection list cards.

## Architecture & Data Flow

- No backend schema changes; `collection.getPublicCatalog` still serves paginated public collections. Only the default `linkLimit` constant increases from 3→10 so more links hydrate to the client.
- The dashboard remains a server component guarded by `auth()`. Content renders inside a Radix `<Container>` within the same radial gradient background used on `/`.
- `CollectionCreateForm` stays client-side, but replaces raw HTML fields with Radix `TextField`, `Checkbox`, and `Button` components; submission logic and TRPC mutation hooks are unchanged.
- Collection listings are rendered with Radix `Card` components using existing `collections` payload coming from `api.collection.getAll()` via `HydrateClient`.

```
auth() ─┬─> guard unauthenticated view
        └─> api.collection.getAll() ─> dashboard page (Radix UI shell)
                                        ├── CollectionCreateForm (client)
                                        └── Collection cards (Radix themed)

Landing page -> api.collection.getPublicCatalog(linkLimit=10) ─> PublicCatalog grid
```

## Interfaces & Contracts

- tRPC `collection.getPublicCatalog` input schema keeps `linkLimit: z.number().max(10)`; default constant updated to `10`. No client changes required besides new default // ensures existing calls (e.g., explicit overrides) still behave.
- `CollectionCreateForm` continues exposing the same implicit interface (no props), still invalidates `utils.collection` on success.
- Dashboard still exports default async function returning JSX wrapped with `HydrateClient`.

## Data Models

- Prisma models remain untouched. The only derived data update is the trimmed link array size (now ≤10) created by `mapCollectionRecordToCatalogItem`.

## Error Handling Matrix

| Component | Scenario | Expected Handling |
|-----------|----------|-------------------|
| `collection.getPublicCatalog` | Caller supplies `linkLimit > 10` | Zod validation rejects request (existing behavior, unchanged). |
| `dashboard/page` | `auth()` returns null session | Render themed sign-in prompt with CTA; no redirect. |
| `CollectionCreateForm` | Mutation fails | Preserve form values, show radial toast? (current behavior: silent). Continue to rely on mutation error for now; add TODO for future feedback. |
| `CollectionCreateForm` | Empty name submitted | Prevent submission client-side (existing guard) and keep styled form visible. |

## Testing Strategy

- Extend `collectionRouter.spec.ts` with a new case verifying the default map trims to ten links when more exist.
- Rely on existing mutation integration coverage to ensure collection creation still works.
- Manual UI sweep: verify `/dashboard` gradient/background matches landing page, form uses Radix styling, list cards render, and link navigation functions.

## Implementation Plan

1. Update requirements documentation and constants (`PUBLIC_CATALOG_DEFAULT_LINK_LIMIT`, `PUBLIC_CATALOG_LINK_LIMIT`) to 10; adjust router spec to assert default trimming. (Confidence: High)
2. Restyle `dashboard/page.tsx` server component: add radial gradient wrapper, Radix typography, and card layout for authenticated + unauthenticated views. (Confidence: Medium-High)
3. Refactor `CollectionCreateForm` to Radix components, ensuring controlled inputs and mutation wiring stay intact. (Confidence: Medium-High)
4. Run `npm run lint` and targeted tests (`npm run test -- --run collectionRouter.spec.ts`); update memory bank (active context, progress). (Confidence: High)

## Confidence

- Overall confidence: 85% (High). Primary risk lies in ensuring Radix theming matches design intent without regressions; mitigated by manual verification.
