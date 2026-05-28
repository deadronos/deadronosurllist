# Issue #109: Client-Side Error Feedback, Race Condition Fix, and Infinite Query Cap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add user-visible error feedback to all mutations, prevent race conditions in optimistic updates, and cap the public catalog infinite query memory usage.

**Architecture:** The project already uses `sonner` for toasts (installed, configured in layout). Collection mutations already get error feedback via `useOptimisticList` → `FeedbackAlert`. The gaps are: (1) `LinkCreateForm` mutations lack `onError`, (2) `useOptimisticList` has no mutation serialization, (3) `useInfiniteQuery` in `PublicCatalog` has no `maxPages`.

**Tech Stack:** React, tRPC, `sonner` (toasts), `@tanstack/react-query` (infinite query), Vitest

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `src/app/_components/link-create-form/index.tsx` | Add `onError` toast to `createMutation` and `previewMutation` |
| Modify | `src/hooks/use-optimistic-list.ts` | Add mutation queue to serialize concurrent operations |
| Modify | `src/app/_components/public-catalog/index.tsx` | Add `maxPages: 20` and `staleTime` to infinite query |
| Create | `src/test/use-optimistic-list.spec.ts` | Unit tests for optimistic list serialization |
| Create | `src/test/link-create-form-errors.spec.ts` | Unit tests for mutation error handling |

---

### Task 1: Add `onError` toast to `LinkCreateForm` mutations

**Files:**
- Modify: `src/app/_components/link-create-form/index.tsx`

- [ ] **Step 1: Import `toast` from `sonner`**

```typescript
import { toast } from "sonner";
```

- [ ] **Step 2: Add `onError` to `createMutation`**

```typescript
const createMutation = api.link.create.useMutation({
  onSuccess: async () => {
    setUrl("");
    setName("");
    setComment("");
    await invalidateAndRefresh(() =>
      utils.collection.getById.invalidate({ id: collectionId }),
    );
  },
  onError: (error) => {
    toast.error(error.message ?? "Failed to create link");
  },
});
```

- [ ] **Step 3: Add `onError` to `previewMutation`**

```typescript
const previewMutation = api.link.preview.useMutation({
  onSuccess: (data) => {
    if (!name && data.title) {
      setName(data.title);
    }
    if (!comment && data.description) {
      setComment(data.description);
    }
  },
  onError: (error) => {
    toast.error(error.message ?? "Failed to fetch link metadata");
  },
});
```

- [ ] **Step 4: Verify TypeScript passes**

Run: `npx tsc --noEmit`

---

### Task 2: Add mutation serialization to `useOptimisticList`

**Files:**
- Modify: `src/hooks/use-optimistic-list.ts`

The current `executeOptimisticMutation` fires mutations immediately without queuing. If a user rapidly reorders items, multiple mutations can overlap and the rollback state (captured at call time) can be stale.

**Approach:** Add a `useRef`-based mutation queue that serializes operations. Each mutation must complete (success or error) before the next one fires. This ensures rollback state is always consistent.

- [ ] **Step 1: Add a mutation queue using `useRef`**

Add imports and a queue ref:

```typescript
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
```

Add inside the hook, after state declarations:

```typescript
const mutationQueueRef = useRef<Array<() => void>>([]);
const isMutatingRef = useRef(false);

const processQueue = useCallback(() => {
  if (isMutatingRef.current || mutationQueueRef.current.length === 0) return;
  isMutatingRef.current = true;
  const next = mutationQueueRef.current.shift()!;
  next();
}, []);
```

- [ ] **Step 2: Modify `executeOptimisticMutation` to use the queue**

Wrap the mutation call in a queue entry. The mutation's `onSuccess`/`onError` callbacks must call `processQueue` to dequeue the next operation.

```typescript
const executeOptimisticMutation = useCallback(
  (
    rollbackItems: T[],
    mutationFn: (callbacks: OperationCallbacks) => void,
    successMessage: string,
    errorMessage: string,
    externalCallbacks: OperationCallbacks = {},
  ) => {
    mutationQueueRef.current.push(() => {
      mutationFn({
        onSuccess: () => {
          setFeedback({ type: "success", message: successMessage });
          externalCallbacks.onSuccess?.();
          isMutatingRef.current = false;
          processQueue();
        },
        onError: () => {
          setItems(rollbackItems);
          setFeedback({ type: "error", message: errorMessage });
          externalCallbacks.onError?.();
          isMutatingRef.current = false;
          processQueue();
        },
      });
    });
    processQueue();
  },
  [processQueue],
);
```

- [ ] **Step 3: Verify TypeScript passes**

Run: `npx tsc --noEmit`

---

### Task 3: Cap infinite query with `maxPages` and add `staleTime`

**Files:**
- Modify: `src/app/_components/public-catalog/index.tsx`

- [ ] **Step 1: Add `maxPages: 20` and `staleTime` to the query options**

```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  isError,
} = api.collection.getPublicCatalog.useInfiniteQuery(queryInput, {
  initialData,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  maxPages: 20,
  staleTime: 5 * 60 * 1000,
});
```

- [ ] **Step 2: Verify TypeScript passes**

Run: `npx tsc --noEmit`

---

### Task 4: Write unit tests

**Files:**
- Create: `src/test/use-optimistic-list.spec.ts`
- Create: `src/test/link-create-form-errors.spec.ts`

- [ ] **Step 1: Write tests for optimistic list serialization**

Test that rapid mutations are serialized (only one in-flight at a time) and that rollback state is correct even with rapid operations.

- [ ] **Step 2: Write tests for mutation error handlers**

Test that `onError` callbacks are invoked and `toast.error` is called on mutation failure.

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`

---

### Task 5: Run full validation

- [ ] **Step 1: Type check**

Run: `npm run typecheck`

- [ ] **Step 2: Lint check**

Run: `npm run lint:fix`

- [ ] **Step 3: Run all tests**

Run: `npm run check`

---

### Task 6: Commit and create PR

- [ ] **Step 1: Commit changes**

```bash
git add -A
git commit -m "fix: add client error feedback, serialize optimistic mutations, cap infinite query (#109)"
```

- [ ] **Step 2: Push and create PR**

```bash
git push -u origin fix/109-client-error-feedback
gh pr create --fill --issue 109
```
