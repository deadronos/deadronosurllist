"use client";

import { useMemo } from "react";

import { useTextFilter } from "@/hooks/use-text-filter";

import { FeedbackAlert } from "./feedback-alert";

import {
  getRequiredTrimmedFormString,
  getTrimmedFormString,
} from "@/lib/form-data";

import { CollectionsEmptyState } from "./dashboard-collections-manager/collections-empty-state";
import { CollectionsList } from "./dashboard-collections-manager/collections-list";
import { CollectionsToolbar } from "./dashboard-collections-manager/collections-toolbar";
import {
  DeleteCollectionDialog,
  EditCollectionDialog,
} from "./dashboard-collections-manager/collection-dialogs";
import { useCollectionSelectionDialogs } from "./dashboard-collections-manager/use-collection-selection";
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

  const {
    activeCollectionId,
    isEditDialogOpen,
    isDeleteDialogOpen,
    openEdit,
    openDelete,
    onEditOpenChange,
    onDeleteOpenChange,
    closeEdit,
    closeDelete,
  } = useCollectionSelectionDialogs();

  const activeCollection = useMemo(
    () => getCollectionById(activeCollectionId),
    [getCollectionById, activeCollectionId],
  );
  const displayCollections = isFiltering ? filteredCollections : collections;

  const handleEditSubmit = (formData: FormData) => {
    if (!activeCollection) return;

    const name = getRequiredTrimmedFormString(formData, "name");
    if (!name) return;
    const description = getTrimmedFormString(formData, "description") ?? "";

    updateCollection(
      activeCollection.id,
      { name, description: description.length > 0 ? description : null },
      {
        onSuccess: () => {
          closeEdit();
        },
        onError: () => {
          closeEdit();
        },
      },
    );
  };

  const handleDelete = () => {
    if (!activeCollection) return;

    deleteCollection(activeCollection.id, {
      onSuccess: () => {
        closeDelete();
      },
      onError: () => {
        closeDelete();
      },
    });
  };

  return (
    <div className="space-y-4">
      <CollectionsToolbar filterTerm={filterTerm} onFilterChange={setFilterTerm} />

      <FeedbackAlert feedback={feedback} />

      {displayCollections.length > 0 ? (
        <CollectionsList
          collections={displayCollections}
          sensors={sensors}
          onDragEnd={handleDragEnd}
          isDragDisabled={isReordering || isFiltering}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      ) : (
        <CollectionsEmptyState />
      )}

      <EditCollectionDialog
        open={isEditDialogOpen && !!activeCollection}
        onOpenChange={onEditOpenChange}
        collection={activeCollection}
        onSubmit={handleEditSubmit}
        isSubmitting={isUpdating}
      />

      <DeleteCollectionDialog
        open={isDeleteDialogOpen && !!activeCollection}
        onOpenChange={onDeleteOpenChange}
        collection={activeCollection}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
