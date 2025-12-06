"use client";

import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Callout, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { CheckIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { SortableCollectionItem } from "./sortable-collection-item";
import {
  DeleteCollectionDialog,
  EditCollectionDialog,
} from "./dashboard-collections-manager/collection-dialogs";
import { useDashboardCollectionsManager } from "./dashboard-collections-manager/use-dashboard-collections-manager";
import type { DashboardCollectionModel } from "./dashboard-collections-manager/types";

export type { DashboardCollectionModel } from "./dashboard-collections-manager/types";

type DashboardCollectionsManagerProps = {
  initialCollections: DashboardCollectionModel[];
};

/**
 * Manages the user's collections on the dashboard.
 * Provides functionality for reordering, editing, and deleting collections.
 *
 * @param {DashboardCollectionsManagerProps} props - Component properties.
 * @returns {JSX.Element} The manager component.
 */
export function DashboardCollectionsManager({
  initialCollections,
}: DashboardCollectionsManagerProps) {
  const {
    sensors,
    collections,
    feedback,
    handleDragEnd,
    updateCollection,
    deleteCollection,
    getCollectionById,
    isReordering,
    isUpdating,
    isDeleting,
  } = useDashboardCollectionsManager({ initialCollections });

  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    null,
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const activeCollection = getCollectionById(activeCollectionId);

  const openEditDialog = (collectionId: string) => {
    setActiveCollectionId(collectionId);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (collectionId: string) => {
    setActiveCollectionId(collectionId);
    setIsDeleteDialogOpen(true);
  };

  const handleEditSubmit = (formData: FormData) => {
    if (!activeCollection) return;

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

    updateCollection(
      activeCollection.id,
      { name, description: description.length > 0 ? description : null },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setActiveCollectionId(null);
        },
        onError: () => {
          setIsEditDialogOpen(false);
        },
      },
    );
  };

  const handleDelete = () => {
    if (!activeCollection) return;

    deleteCollection(activeCollection.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setActiveCollectionId(null);
      },
      onError: () => {
        setIsDeleteDialogOpen(false);
      },
    });
  };

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
                  onEdit={() => openEditDialog(collection.id)}
                  onDelete={() => openDeleteDialog(collection.id)}
                  dragDisabled={isReordering}
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

      <EditCollectionDialog
        open={isEditDialogOpen && !!activeCollection}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setActiveCollectionId(null);
          }
        }}
        collection={activeCollection}
        onSubmit={handleEditSubmit}
        isSubmitting={isUpdating}
      />

      <DeleteCollectionDialog
        open={isDeleteDialogOpen && !!activeCollection}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setActiveCollectionId(null);
          }
        }}
        collection={activeCollection}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </Flex>
  );
}
