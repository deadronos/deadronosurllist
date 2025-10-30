"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { api } from "@/trpc/react";

import type { DashboardCollectionModel, Feedback } from "./types";

type OperationCallbacks = {
  onSuccess?: () => void;
  onError?: () => void;
};

type UpdatePayload = {
  name: string;
  description: string | null;
};

type UseDashboardCollectionsManagerOptions = {
  initialCollections: DashboardCollectionModel[];
};

export function useDashboardCollectionsManager({
  initialCollections,
}: UseDashboardCollectionsManagerOptions) {
  const [collections, setCollections] = useState(initialCollections);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const utils = api.useUtils();
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    setCollections(initialCollections);
  }, [initialCollections]);

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

  const reorderMutation = api.collection.reorder.useMutation({
    onSettled: async () => {
      await utils.collection.getAll.invalidate();
      router.refresh();
    },
  });

  const updateMutation = api.collection.update.useMutation({
    onSettled: async () => {
      await utils.collection.getAll.invalidate();
      router.refresh();
    },
  });

  const deleteMutation = api.collection.delete.useMutation({
    onSettled: async () => {
      await utils.collection.getAll.invalidate();
      router.refresh();
    },
  });

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      setCollections((previousCollections) => {
        const oldIndex = previousCollections.findIndex(
          (collection) => collection.id === active.id,
        );
        const newIndex = previousCollections.findIndex(
          (collection) => collection.id === over.id,
        );

        if (oldIndex === -1 || newIndex === -1) {
          return previousCollections;
        }

        const reordered = arrayMove(previousCollections, oldIndex, newIndex);
        const rollback = previousCollections;

        startTransition(() => {
          reorderMutation.mutate(
            { collectionIds: reordered.map((collection) => collection.id) },
            {
              onSuccess: () =>
                setFeedback({
                  type: "success",
                  message: "Collection order updated",
                }),
              onError: () => {
                setCollections(rollback);
                setFeedback({
                  type: "error",
                  message: "Unable to update collection order",
                });
              },
            },
          );
        });

        return reordered;
      });
    },
    [reorderMutation, startTransition],
  );

  const updateCollection = useCallback(
    (
      collectionId: string,
      updates: UpdatePayload,
      callbacks: OperationCallbacks = {},
    ) => {
      const previousCollections = collections;
      setCollections((prev) =>
        prev.map((collection) =>
          collection.id === collectionId
            ? { ...collection, ...updates }
            : collection,
        ),
      );

      updateMutation.mutate(
        { id: collectionId, ...updates },
        {
          onSuccess: () => {
            setFeedback({ type: "success", message: "Collection updated" });
            callbacks.onSuccess?.();
          },
          onError: () => {
            setCollections(previousCollections);
            setFeedback({
              type: "error",
              message: "Unable to update collection",
            });
            callbacks.onError?.();
          },
        },
      );
    },
    [collections, updateMutation],
  );

  const deleteCollection = useCallback(
    (collectionId: string, callbacks: OperationCallbacks = {}) => {
      const previousCollections = collections;
      setCollections((prev) =>
        prev.filter((collection) => collection.id !== collectionId),
      );

      deleteMutation.mutate(
        { id: collectionId },
        {
          onSuccess: () => {
            setFeedback({ type: "success", message: "Collection deleted" });
            callbacks.onSuccess?.();
          },
          onError: () => {
            setCollections(previousCollections);
            setFeedback({
              type: "error",
              message: "Unable to delete collection",
            });
            callbacks.onError?.();
          },
        },
      );
    },
    [collections, deleteMutation],
  );

  const activeCollectionLookup = useMemo(() => {
    const lookup = new Map(
      collections.map((collection) => [collection.id, collection]),
    );
    return lookup;
  }, [collections]);

  const getCollectionById = useCallback(
    (collectionId: string | null) => {
      if (!collectionId) return null;
      return activeCollectionLookup.get(collectionId) ?? null;
    },
    [activeCollectionLookup],
  );

  return {
    sensors,
    collections,
    feedback,
    handleDragEnd,
    updateCollection,
    deleteCollection,
    getCollectionById,
    isReordering: reorderMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
