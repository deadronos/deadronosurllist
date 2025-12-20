# Bolt's Journal

This journal tracks critical performance learnings and patterns in the codebase.

## Format
`## YYYY-MM-DD - [Title]
**Learning:** [Insight]
**Action:** [How to apply next time]`

## 2024-05-22 - [List Re-rendering]
**Learning:** The dashboard lists (`DashboardCollectionsManager`, `CollectionLinksManager`) were re-rendering all items on every keystroke of the filter input because item handlers (`onEdit`, `onDelete`) were inline arrow functions.
**Action:** Always memoize list items with `React.memo` and pass stable handlers (using `useCallback`) that accept an ID, rather than creating closures for each item.

## 2025-12-20 - [Public Catalog Pagination]
**Learning:** The public catalog query fetched all collections and links into memory before filtering and paginating, which would degrade O(N) with dataset size.
**Action:** Move filtering, sorting, and pagination logic into the database query (Prisma `findMany` with `cursor`, `take`, `orderBy`) to ensure constant-time page fetches regardless of total dataset size.
