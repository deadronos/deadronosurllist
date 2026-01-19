"use client";

import { useCallback, useState } from "react";

import { useTextFilter } from "@/hooks/use-text-filter";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { CheckCircle2Icon, SearchIcon, TriangleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

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

  const {
    filteredItems: filteredCollections,
    filterTerm,
    setFilterTerm,
    hasFilter: isFiltering,
  } = useTextFilter({
    items: collections,
    searchFields: ["name", "description"],
  });
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    null,
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const activeCollection = getCollectionById(activeCollectionId);
  const displayCollections = isFiltering ? filteredCollections : collections;

  const openEditDialog = useCallback((collectionId: string) => {
    setActiveCollectionId(collectionId);
    setIsEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((collectionId: string) => {
    setActiveCollectionId(collectionId);
    setIsDeleteDialogOpen(true);
  }, []);

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
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Filter collections..."
          value={filterTerm}
          onChange={(event) => setFilterTerm(event.target.value)}
          className="pl-9"
        />
      </div>

      {feedback ? (
        <Alert
          variant={feedback.type === "success" ? "default" : "destructive"}
        >
          {feedback.type === "success" ? (
            <CheckCircle2Icon className="size-4" />
          ) : (
            <TriangleAlertIcon className="size-4" />
          )}
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      ) : null}

      {displayCollections.length > 0 ? (
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={displayCollections.map((collection) => collection.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {displayCollections.map((collection) => (
                <SortableCollectionItem
                  key={collection.id}
                  collection={collection}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                  dragDisabled={isReordering || isFiltering}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="bg-background/35 rounded-xl border border-dashed p-6">
          <div className="text-sm font-medium">No collections yet</div>
          <div className="text-muted-foreground mt-1 text-sm">
            Use the form to create your first collection and start saving links.
          </div>
        </div>
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
    </div>
  );
}
