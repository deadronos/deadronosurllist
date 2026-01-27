# DESIGN014 - Container/Presentational Component Refactoring

**Status:** Draft
**Added:** 2026-01-27

## Problem

The current codebase uses "Thin Containers" where logic (hooks, state, handlers) and presentation (JSX layout) are often mixed in the same component. While this is clean for small components, it can lead to larger files and less reusability for the UI parts.

## Proposed Solution

Refactor React components to a strict Container/Presentational (C/P) pattern.

### Definitions

1. **Container Component**:
   - Concerned with *how things work*.
   - Handles data fetching (tRPC queries/mutations).
   - Manages state.
   - Uses hooks.
   - Provides data and callbacks to presentational components.
   - Rarely contains styles or complex JSX layout beyond a wrapper.

2. **Presentational Component**:
   - Concerned with *how things look*.
   - Receives data and callbacks via props.
   - Contains all the JSX layout and styles.
   - Stateless or has minimal UI state (e.g., "is open").
   - Independent of the data source (e.g., doesn't know about tRPC).

### File Structure Patterns

Option A: Components with Sub-components
For complex components like `DashboardCollectionsManager`, use a folder:

```text
dashboard-collections-manager/
  index.tsx (Container)
  view.tsx (Presentational)
  types.ts
  hooks/
  components/ (Sub-presentational components)
```

Option B: Simple Components

```text
MyComponent.tsx (Container)
MyComponentView.tsx (Presentational)
```

## Strategy

1. Identify components with mixed logic and presentation.
2. Extract the presentation into a `View` component.
3. Keep the logic in the original component name (acting as the container).
4. Standardize on passing props: `data`, `actions`, `state`.

## Implementation Phases

- Phase 1: `src/app/_components/` (Core application components)
- Phase 2: `src/components/` (Shared components)
- Phase 3: Page-level client components in `src/app/`

## Acceptance Criteria

- All client components are split into Container and View when logical.
- No tRPC or complex hooks in View components.
- View components can be theoretically used with mock data easily.
- Type safety is maintained using shared types.
