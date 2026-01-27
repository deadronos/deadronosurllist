# TASK016 - Container/Presentational Component Refactoring

**Status:** In Progress
**Added:** 2026-01-27
**Updated:** 2026-01-27

## Original Request

refactor all react files to container/functional/presentational components etc. please

## Thought Process

The user wants to transition from "Thin Containers" to a stricter Container/Presentational pattern. This involves splitting components that have mixed logic and presentation into two distinct parts.

## Implementation Plan

### Phase 1: `src/app/_components/`

- [ ] Refactor `CollectionCreateForm`
- [ ] Refactor `DashboardCollectionsManager`
- [ ] Refactor `FeaturedCollectionCard`
- [ ] Refactor `HeroBadges`
- [ ] Refactor `PublicCatalog`
- [ ] Refactor `LinkCreateForm`
- [ ] Refactor `StudioShell`
- [ ] Refactor `CollectionLinksManager` (and its sub-components if needed)

### Phase 2: `src/components/`

- [ ] Audit `src/components/` for components with logic (most are likely presentational already).
- [ ] Refactor any identified components.

### Phase 3: Page-level Components

- [ ] Check `src/app/` for client-side page components that could be split.

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | --- | --- | --- | --- |
| 1.1 | Refactor `CollectionCreateForm` | Completed | 2026-01-27 | Split into Container (index.tsx) and View (view.tsx) |
| 1.2 | Refactor `DashboardCollectionsManager` | Completed | 2026-01-27 | Split into Container (index.tsx) and View (view.tsx) within its folder |
| 1.3 | Refactor `FeaturedCollectionCard` | Completed | 2026-01-27 | Purely presentational already |
| 1.4 | Refactor `HeroBadges` | Completed | 2026-01-27 | Purely presentational already |
| 1.5 | Refactor `PublicCatalog` | Completed | 2026-01-27 | Split into Container (index.tsx) and View (view.tsx) within its folder |
| 1.6 | Refactor `StudioShell` | Completed | 2026-01-27 | Purely presentational already |
| 1.7 | Refactor `CollectionLinksManager` | Completed | 2026-01-27 | Split into Container and View |
| 1.8 | Refactor `LinkCreateForm` | Completed | 2026-01-27 | Split into Container and View |
| 2.1 | Refactor `ThemeToggle` | Completed | 2026-01-27 | Split into Container and View |
| 2.2 | Refactor `SortableCollectionItem` | Completed | 2026-01-27 | Split into Container and View |
| 2.3 | Refactor `SortableLinkItem` | Completed | 2026-01-27 | Split into Container and View |

## Progress Log

### 2026-01-27

- Created task and design documents.
- Refactored all major client components in `src/app/_components/` and `src/components/` to Container/Presentational pattern.
- Fixed "useTheme() from server" runtime error by adding missing `"use client"` directives to container components.
- Validated with `npm run check`.
