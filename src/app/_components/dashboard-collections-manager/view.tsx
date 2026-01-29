"use client";

import type { DragEndEvent, SensorDescriptor, SensorOptions } from "@dnd-kit/core";
import { FeedbackAlert } from "../feedback-alert";

import { CollectionsEmptyState } from "./collections-empty-state";
import { CollectionsList } from "./collections-list";
import { CollectionsToolbar } from "./collections-toolbar";
import {
  DeleteCollectionDialog,
  EditCollectionDialog,
} from "./collection-dialogs";
import type { DashboardCollectionModel } from "./types";
import type { Feedback } from "@/types/ui";

export interface DashboardCollectionsManagerViewProps {
  // Filter state
  filterTerm: string;
  onFilterChange: (value: string) => void;
  isFiltering: boolean;

  // Collection data
  displayCollections: DashboardCollectionModel[];
  activeCollection: DashboardCollectionModel | null;

  // Feedback state
  feedback: Feedback;

  // DND state
  sensors: SensorDescriptor<SensorOptions>[];
  handleDragEnd: (event: DragEndEvent) => void;
  isReordering: boolean;

  // Dialog state
  isEditDialogOpen: boolean;
  onEditOpenChange: (open: boolean) => void;
  onEdit: (id: string) => void;
  onEditSubmit: (formData: FormData) => void;
  isUpdating: boolean;

  isDeleteDialogOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  onDeleteConfirm: () => void;
  isDeleting: boolean;
}

/**
 * Presentational component for the dashboard collections manager.
 */
export function DashboardCollectionsManagerView({
  filterTerm,
  onFilterChange,
  isFiltering,
  displayCollections,
  activeCollection,
  feedback,
  sensors,
  handleDragEnd,
  isReordering,
  isEditDialogOpen,
  onEditOpenChange,
  onEdit,
  onEditSubmit,
  isUpdating,
  isDeleteDialogOpen,
  onDeleteOpenChange,
  onDelete,
  onDeleteConfirm,
  isDeleting,
}: DashboardCollectionsManagerViewProps) {
  return (
    <div className="space-y-4">
      <CollectionsToolbar filterTerm={filterTerm} onFilterChange={onFilterChange} />

      <FeedbackAlert feedback={feedback} />

      {displayCollections.length > 0 ? (
        <CollectionsList
          collections={displayCollections}
          sensors={sensors}
          onDragEnd={handleDragEnd}
          isDragDisabled={isReordering || isFiltering}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <CollectionsEmptyState />
      )}

      <EditCollectionDialog
        open={isEditDialogOpen && !!activeCollection}
        onOpenChange={onEditOpenChange}
        collection={activeCollection}
        onSubmit={onEditSubmit}
        isSubmitting={isUpdating}
      />

      <DeleteCollectionDialog
        open={isDeleteDialogOpen && !!activeCollection}
        onOpenChange={onDeleteOpenChange}
        collection={activeCollection}
        onConfirm={onDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
