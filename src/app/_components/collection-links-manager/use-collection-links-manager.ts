"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type DragEndEvent } from "@dnd-kit/core";

import { useOptimisticList } from "@/hooks/use-optimistic-list";
import { api } from "@/trpc/react";

import type { CollectionLinkModel } from "./types";

type OperationCallbacks = {
  onSuccess?: () => void;
  onError?: () => void;
};

type UpdatePayload = {
  url: string;
  name: string;
  comment: string;
};

type UseCollectionLinksManagerOptions = {
  collectionId: string;
  initialLinks: CollectionLinkModel[];
  initialIsPublic: boolean;
};

/**
 * Hook for managing collection links logic.
 * Handles state for links, filtering, visibility, and mutation operations.
 *
 * @param {UseCollectionLinksManagerOptions} options - Hook options.
 * @returns {object} The manager state and handlers.
 */
export function useCollectionLinksManager({
  collectionId,
  initialLinks,
  initialIsPublic,
}: UseCollectionLinksManagerOptions) {
  const {
    items: links,
    feedback,
    setFeedback,
    sensors,
    handleDragEnd: handleListDragEnd,
    optimisticUpdate,
    optimisticDelete,
  } = useOptimisticList(initialLinks);

  const [filterTerm, setFilterTerm] = useState("");
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const utils = api.useUtils();
  const router = useRouter();

  useEffect(() => {
    setIsPublic(initialIsPublic);
  }, [initialIsPublic]);

  const reorderMutation = api.link.reorder.useMutation({
    onSettled: async () => {
      await utils.collection.getById.invalidate({ id: collectionId });
      router.refresh();
    },
  });

  const updateMutation = api.link.update.useMutation({
    onSettled: async () => {
      await utils.collection.getById.invalidate({ id: collectionId });
      router.refresh();
    },
  });

  const deleteMutation = api.link.delete.useMutation({
    onSettled: async () => {
      await utils.collection.getById.invalidate({ id: collectionId });
      router.refresh();
    },
  });

  const visibilityMutation = api.collection.update.useMutation({
    onSettled: async () => {
      await utils.collection.getAll.invalidate();
      await utils.collection.getById.invalidate({ id: collectionId });
      router.refresh();
    },
  });

  const filteredLinks = useMemo(() => {
    if (!filterTerm.trim()) return links;
    const query = filterTerm.trim().toLowerCase();
    return links.filter((link) => {
      return (
        link.name.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query) ||
        (link.comment?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [links, filterTerm]);

  const hasFilter = filterTerm.trim().length > 0;

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      handleListDragEnd(
        event,
        (reordered, callbacks) => {
          reorderMutation.mutate(
            {
              collectionId,
              linkIds: reordered.map((link) => link.id),
            },
            callbacks,
          );
        },
        "Link order updated",
        "Unable to update link order",
      );
    },
    [handleListDragEnd, reorderMutation, collectionId],
  );

  const updateLink = useCallback(
    (
      linkId: string,
      updates: UpdatePayload,
      callbacks: OperationCallbacks = {},
    ) => {
      optimisticUpdate(
        linkId,
        (link) => ({ ...link, ...updates }),
        (mutationCallbacks) =>
          updateMutation.mutate({ id: linkId, ...updates }, mutationCallbacks),
        "Link updated",
        "Unable to update link",
        callbacks,
      );
    },
    [optimisticUpdate, updateMutation],
  );

  const deleteLink = useCallback(
    (linkId: string, callbacks: OperationCallbacks = {}) => {
      optimisticDelete(
        linkId,
        (mutationCallbacks) =>
          deleteMutation.mutate({ id: linkId }, mutationCallbacks),
        "Link removed",
        "Unable to delete link",
        callbacks,
      );
    },
    [optimisticDelete, deleteMutation],
  );

  const toggleVisibility = useCallback(
    (checked: boolean) => {
      const previous = isPublic;
      setIsPublic(checked);
      visibilityMutation.mutate(
        { id: collectionId, isPublic: checked },
        {
          onSuccess: () =>
            setFeedback({
              type: "success",
              message: checked
                ? "Collection is now public"
                : "Collection is now private",
            }),
          onError: () => {
            setIsPublic(previous);
            setFeedback({
              type: "error",
              message: "Unable to update collection visibility",
            });
          },
        },
      );
    },
    [collectionId, isPublic, visibilityMutation, setFeedback],
  );

  return {
    sensors,
    links,
    filteredLinks,
    hasFilter,
    filterTerm,
    setFilterTerm,
    feedback,
    isPublic,
    toggleVisibility,
    handleDragEnd,
    updateLink,
    deleteLink,
    isReordering: reorderMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isVisibilityUpdating: visibilityMutation.isPending,
  };
}
