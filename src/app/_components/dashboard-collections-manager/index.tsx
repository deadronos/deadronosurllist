"use client";

import { useMemo } from "react";

import { useTextFilter } from "@/hooks/use-text-filter";

import {
  getRequiredTrimmedFormString,
  getTrimmedFormString,
} from "@/lib/form-data";

import { useCollectionSelectionDialogs } from "./use-collection-selection";
import { useDashboardCollectionsManager } from "./use-dashboard-collections-manager";
import type { DashboardCollectionModel } from "./types";
import { DashboardCollectionsManagerView } from "./view";

export type { DashboardCollectionModel } from "./types";

type DashboardCollectionsManagerProps = {
  initialCollections: DashboardCollectionModel[];
};

/**
 * Container component for managing the user's collections on the dashboard.
 * Handles logic for filtering, selection, and mutations.
 *
 * @param {DashboardCollectionsManagerProps} props - Component properties.
 * @returns {JSX.Element} The manager container.
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
    <DashboardCollectionsManagerView
      filterTerm={filterTerm}
      onFilterChange={setFilterTerm}
      isFiltering={isFiltering}
      displayCollections={displayCollections}
      activeCollection={activeCollection}
      feedback={feedback}
      sensors={sensors}
      handleDragEnd={handleDragEnd}
      isReordering={isReordering}
      isEditDialogOpen={isEditDialogOpen}
      onEditOpenChange={onEditOpenChange}
      onEdit={openEdit}
      onEditSubmit={handleEditSubmit}
      isUpdating={isUpdating}
      isDeleteDialogOpen={isDeleteDialogOpen}
      onDeleteOpenChange={onDeleteOpenChange}
      onDelete={openDelete}
      onDeleteConfirm={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
