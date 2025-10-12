"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Callout,
  Card,
  Dialog,
  Flex,
  Heading,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import {
  DndContext,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CheckIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { api } from "@/trpc/react";

import { SortableCollectionItem } from "./sortable-collection-item";

export type DashboardCollectionModel = {
  id: string;
  name: string;
  description: string | null;
  order: number;
  linkCount: number;
};

type Feedback = { type: "success" | "error"; message: string } | null;

type DashboardCollectionsManagerProps = {
  initialCollections: DashboardCollectionModel[];
};

export function DashboardCollectionsManager({
  initialCollections,
}: DashboardCollectionsManagerProps) {
  const [collections, setCollections] = useState(initialCollections);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const activeCollection = useMemo(
    () =>
      collections.find((collection) => collection.id === activeCollectionId) ??
      null,
    [collections, activeCollectionId],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setCollections((prev) => {
      const oldIndex = prev.findIndex(
        (collection) => collection.id === active.id,
      );
      const newIndex = prev.findIndex(
        (collection) => collection.id === over.id,
      );
      if (oldIndex === -1 || newIndex === -1) {
        return prev;
      }

      const reordered = arrayMove(prev, oldIndex, newIndex);
      const previous = prev;

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
              setCollections(previous);
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
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeCollection) return;

    const formData = new FormData(event.currentTarget);
    const nameValue = formData.get("name");
    const descriptionValue = formData.get("description");

    if (typeof nameValue !== "string" || typeof descriptionValue !== "string") {
      return;
    }

    const name = nameValue.trim();
    const description = descriptionValue.trim();

    if (!name) {
      return;
    }

    const previousCollections = collections;
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === activeCollection.id
          ? {
              ...collection,
              name,
              description: description.length > 0 ? description : null,
            }
          : collection,
      ),
    );

    updateMutation.mutate(
      {
        id: activeCollection.id,
        name,
        description: description.length > 0 ? description : null,
      },
      {
        onSuccess: () => {
          setFeedback({ type: "success", message: "Collection updated" });
          setIsEditing(false);
          setActiveCollectionId(null);
        },
        onError: () => {
          setCollections(previousCollections);
          setFeedback({
            type: "error",
            message: "Unable to update collection",
          });
        },
      },
    );
  };

  const handleDelete = () => {
    if (!activeCollection) return;

    const previousCollections = collections;
    setCollections((prev) =>
      prev.filter((collection) => collection.id !== activeCollection.id),
    );

    deleteMutation.mutate(
      { id: activeCollection.id },
      {
        onSuccess: () => {
          setFeedback({ type: "success", message: "Collection deleted" });
          setIsDeleting(false);
          setActiveCollectionId(null);
          router.refresh();
        },
        onError: () => {
          setCollections(previousCollections);
          setFeedback({
            type: "error",
            message: "Unable to delete collection",
          });
        },
      },
    );
  };

  const isUpdating = updateMutation.isPending;
  const isDeletingCollection = deleteMutation.isPending;

  return (
    <Flex direction="column" gap="4">
      {feedback ? (
        <Callout.Root
          color={feedback.type === "success" ? "green" : "red"}
          role="status"
        >
          <Callout.Icon>
            {feedback.type === "success" ? (
              <CheckIcon />
            ) : (
              <ExclamationTriangleIcon />
            )}
          </Callout.Icon>
          <Callout.Text>{feedback.message}</Callout.Text>
        </Callout.Root>
      ) : null}

      {collections.length > 0 ? (
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={collections.map((collection) => collection.id)}
            strategy={verticalListSortingStrategy}
          >
            <Flex direction="column" gap="3">
              {collections.map((collection) => (
                <SortableCollectionItem
                  key={collection.id}
                  collection={collection}
                  onEdit={() => {
                    setActiveCollectionId(collection.id);
                    setIsEditing(true);
                  }}
                  onDelete={() => {
                    setActiveCollectionId(collection.id);
                    setIsDeleting(true);
                  }}
                  dragDisabled={reorderMutation.isPending}
                />
              ))}
            </Flex>
          </SortableContext>
        </DndContext>
      ) : (
        <Card
          size="2"
          variant="surface"
          className="border border-dashed border-white/20 bg-transparent"
        >
          <Flex direction="column" gap="2">
            <Heading as="h3" size="4">
              No collections yet
            </Heading>
            <Text size="2" color="gray">
              Use the form above to create your first collection and start
              saving links.
            </Text>
          </Flex>
        </Card>
      )}

      <Dialog.Root
        open={isEditing && !!activeCollection}
        onOpenChange={(open) => {
          setIsEditing(open);
          if (!open) {
            setActiveCollectionId(null);
          }
        }}
      >
        <Dialog.Content maxWidth="450px">
          <Dialog.Title>Edit collection</Dialog.Title>
          <Dialog.Description>
            Update the collection name or description.
          </Dialog.Description>
          <form
            onSubmit={handleEditSubmit}
            className="mt-4"
            key={activeCollection?.id ?? "new"}
          >
            <Flex direction="column" gap="3">
              <TextField.Root
                name="name"
                defaultValue={activeCollection?.name ?? ""}
                required
                disabled={isUpdating}
                aria-label="Collection name"
              />
              <TextArea
                name="description"
                defaultValue={activeCollection?.description ?? ""}
                rows={3}
                disabled={isUpdating}
                aria-label="Collection description"
              />
              <Flex gap="3" justify="end">
                <Button
                  type="button"
                  variant="soft"
                  color="gray"
                  onClick={() => {
                    setIsEditing(false);
                    setActiveCollectionId(null);
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save changes"}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root
        open={isDeleting && !!activeCollection}
        onOpenChange={(open) => {
          setIsDeleting(open);
          if (!open) {
            setActiveCollectionId(null);
          }
        }}
      >
        <Dialog.Content maxWidth="400px">
          <Dialog.Title>Delete collection</Dialog.Title>
          <Dialog.Description>
            This action cannot be undone. All links in this collection will be
            removed.
          </Dialog.Description>
          <Flex direction="column" gap="3" mt="4">
            <Text>
              Are you sure you want to delete{" "}
              <strong>{activeCollection?.name}</strong>?
            </Text>
            <Flex gap="3" justify="end">
              <Button
                type="button"
                variant="soft"
                color="gray"
                onClick={() => {
                  setIsDeleting(false);
                  setActiveCollectionId(null);
                }}
                disabled={isDeletingCollection}
              >
                Cancel
              </Button>
              <Button
                type="button"
                color="red"
                onClick={handleDelete}
                disabled={isDeletingCollection}
              >
                {isDeletingCollection ? "Deleting..." : "Delete"}
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
}
