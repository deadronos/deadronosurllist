"use client";

import { useCallback, useMemo } from "react";
import { type DragEndEvent } from "@dnd-kit/core";

import { useOptimisticList } from "@/hooks/use-optimistic-list";
import { useInvalidateAndRefresh } from "@/hooks/use-invalidate-and-refresh";
import { api } from "@/trpc/react";

import type { DashboardCollectionModel } from "./types";

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

/**
 * Hook for managing dashboard collections logic.
 * Handles state for collections, drag-and-drop, and mutation operations.
 *
 * @param {UseDashboardCollectionsManagerOptions} options - Hook options.
 * @returns {object} The manager state and handlers.
 */
export function useDashboardCollectionsManager({
  initialCollections,
}: UseDashboardCollectionsManagerOptions) {
  const {
    items: collections,
    feedback,
    sensors,
    handleDragEnd: handleListDragEnd,
    optimisticUpdate,
    optimisticDelete,
  } = useOptimisticList(initialCollections);

  const utils = api.useUtils();
  const invalidateAndRefresh = useInvalidateAndRefresh();

  const reorderMutation = api.collection.reorder.useMutation({
    onSettled: () =>
      invalidateAndRefresh(() => utils.collection.getAll.invalidate()),
  });

  const updateMutation = api.collection.update.useMutation({
    onSettled: () =>
      invalidateAndRefresh(() => utils.collection.getAll.invalidate()),
  });

  const deleteMutation = api.collection.delete.useMutation({
    onSettled: () =>
      invalidateAndRefresh(() => utils.collection.getAll.invalidate()),
  });

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      handleListDragEnd(
        event,
        (reordered, callbacks) => {
          reorderMutation.mutate(
            { collectionIds: reordered.map((collection) => collection.id) },
            callbacks,
          );
        },
        "Collection order updated",
        "Unable to update collection order",
      );
    },
    [handleListDragEnd, reorderMutation],
  );

  const updateCollection = useCallback(
    (
      collectionId: string,
      updates: UpdatePayload,
      callbacks: OperationCallbacks = {},
    ) => {
      optimisticUpdate(
        collectionId,
        (collection) => ({ ...collection, ...updates }),
        (mutationCallbacks) =>
          updateMutation.mutate(
            { id: collectionId, ...updates },
            mutationCallbacks,
          ),
        "Collection updated",
        "Unable to update collection",
        callbacks,
      );
    },
    [optimisticUpdate, updateMutation],
  );

  const deleteCollection = useCallback(
    (collectionId: string, callbacks: OperationCallbacks = {}) => {
      optimisticDelete(
        collectionId,
        (mutationCallbacks) =>
          deleteMutation.mutate({ id: collectionId }, mutationCallbacks),
        "Collection deleted",
        "Unable to delete collection",
        callbacks,
      );
    },
    [optimisticDelete, deleteMutation],
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
