import {
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import {
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import type { Feedback } from "@/types/ui";

type OperationCallbacks = {
  onSuccess?: () => void;
  onError?: () => void;
};

/**
 * Generic hook for managing an optimistic list with drag-and-drop, updates, and deletions.
 *
 * @param {T[]} initialItems - The initial list of items.
 * @returns {object} The state and handlers for the list.
 */
export function useOptimisticList<T extends { id: string }>(
  initialItems: T[],
) {
  const [items, setItems] = useState(initialItems);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
  );

  const handleDragEnd = useCallback(
    (
      event: DragEndEvent,
      onReorder: (items: T[], callbacks: OperationCallbacks) => void,
      successMessage = "Order updated",
      errorMessage = "Unable to update order",
    ) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      setItems((previousItems) => {
        const oldIndex = previousItems.findIndex(
          (item) => item.id === active.id,
        );
        const newIndex = previousItems.findIndex(
          (item) => item.id === over.id,
        );

        if (oldIndex === -1 || newIndex === -1) {
          return previousItems;
        }

        const reordered = arrayMove(previousItems, oldIndex, newIndex);
        const rollback = previousItems;

        startTransition(() => {
          onReorder(reordered, {
            onSuccess: () =>
              setFeedback({ type: "success", message: successMessage }),
            onError: () => {
              setItems(rollback);
              setFeedback({ type: "error", message: errorMessage });
            },
          });
        });

        return reordered;
      });
    },
    [],
  );

  const optimisticUpdate = useCallback(
    (
      id: string,
      updateFn: (item: T) => T,
      mutationFn: (callbacks: OperationCallbacks) => void,
      successMessage = "Item updated",
      errorMessage = "Unable to update item",
      externalCallbacks: OperationCallbacks = {},
    ) => {
      const previousItems = items;
      setItems((prev) =>
        prev.map((item) => (item.id === id ? updateFn(item) : item)),
      );

      mutationFn({
        onSuccess: () => {
          setFeedback({ type: "success", message: successMessage });
          externalCallbacks.onSuccess?.();
        },
        onError: () => {
          setItems(previousItems);
          setFeedback({ type: "error", message: errorMessage });
          externalCallbacks.onError?.();
        },
      });
    },
    [items],
  );

  const optimisticDelete = useCallback(
    (
      id: string,
      mutationFn: (callbacks: OperationCallbacks) => void,
      successMessage = "Item deleted",
      errorMessage = "Unable to delete item",
      externalCallbacks: OperationCallbacks = {},
    ) => {
      const previousItems = items;
      setItems((prev) => prev.filter((item) => item.id !== id));

      mutationFn({
        onSuccess: () => {
          setFeedback({ type: "success", message: successMessage });
          externalCallbacks.onSuccess?.();
        },
        onError: () => {
          setItems(previousItems);
          setFeedback({ type: "error", message: errorMessage });
          externalCallbacks.onError?.();
        },
      });
    },
    [items],
  );

  return {
    items,
    setItems,
    feedback,
    setFeedback,
    sensors,
    handleDragEnd,
    optimisticUpdate,
    optimisticDelete,
  };
}
