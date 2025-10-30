"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  useCallback,
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

import type { CollectionLinkModel, Feedback } from "./types";

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

export function useCollectionLinksManager({
  collectionId,
  initialLinks,
  initialIsPublic,
}: UseCollectionLinksManagerOptions) {
  const [links, setLinks] = useState(initialLinks);
  const [filterTerm, setFilterTerm] = useState("");
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const utils = api.useUtils();
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  useEffect(() => {
    setIsPublic(initialIsPublic);
  }, [initialIsPublic]);

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
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      setLinks((previousLinks) => {
        const oldIndex = previousLinks.findIndex(
          (link) => link.id === active.id,
        );
        const newIndex = previousLinks.findIndex((link) => link.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          return previousLinks;
        }

        const reordered = arrayMove(previousLinks, oldIndex, newIndex);
        const rollback = previousLinks;

        startTransition(() => {
          reorderMutation.mutate(
            {
              collectionId,
              linkIds: reordered.map((link) => link.id),
            },
            {
              onSuccess: () =>
                setFeedback({ type: "success", message: "Link order updated" }),
              onError: () => {
                setLinks(rollback);
                setFeedback({
                  type: "error",
                  message: "Unable to update link order",
                });
              },
            },
          );
        });

        return reordered;
      });
    },
    [collectionId, reorderMutation, startTransition],
  );

  const updateLink = useCallback(
    (
      linkId: string,
      updates: UpdatePayload,
      callbacks: OperationCallbacks = {},
    ) => {
      const previousLinks = links;
      setLinks((prev) =>
        prev.map((link) =>
          link.id === linkId ? { ...link, ...updates } : link,
        ),
      );

      updateMutation.mutate(
        { id: linkId, ...updates },
        {
          onSuccess: () => {
            setFeedback({ type: "success", message: "Link updated" });
            callbacks.onSuccess?.();
          },
          onError: () => {
            setLinks(previousLinks);
            setFeedback({ type: "error", message: "Unable to update link" });
            callbacks.onError?.();
          },
        },
      );
    },
    [links, updateMutation],
  );

  const deleteLink = useCallback(
    (linkId: string, callbacks: OperationCallbacks = {}) => {
      const previousLinks = links;
      setLinks((prev) => prev.filter((link) => link.id !== linkId));

      deleteMutation.mutate(
        { id: linkId },
        {
          onSuccess: () => {
            setFeedback({ type: "success", message: "Link removed" });
            callbacks.onSuccess?.();
          },
          onError: () => {
            setLinks(previousLinks);
            setFeedback({ type: "error", message: "Unable to delete link" });
            callbacks.onError?.();
          },
        },
      );
    },
    [deleteMutation, links],
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
    [collectionId, isPublic, visibilityMutation],
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
