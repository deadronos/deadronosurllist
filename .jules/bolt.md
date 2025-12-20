# Bolt's Journal

This journal tracks critical performance learnings and patterns in the codebase.

## Format
`## YYYY-MM-DD - [Title]
**Learning:** [Insight]
**Action:** [How to apply next time]`

## 2024-05-22 - [List Re-rendering]
**Learning:** The dashboard lists (`DashboardCollectionsManager`, `CollectionLinksManager`) were re-rendering all items on every keystroke of the filter input because item handlers (`onEdit`, `onDelete`) were inline arrow functions.
**Action:** Always memoize list items with `React.memo` and pass stable handlers (using `useCallback`) that accept an ID, rather than creating closures for each item.
