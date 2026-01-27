"use client";

import type { DragEndEvent, SensorDescriptor, SensorOptions } from "@dnd-kit/core";
import { FeedbackAlert } from "../feedback-alert";

import {
  DeleteLinkDialog,
  EditLinkDialog,
} from "./link-dialogs";
import { LinksEmptyState } from "./links-empty-state";
import { LinksList } from "./links-list";
import { LinksToolbar } from "./links-toolbar";
import type { CollectionLinkModel } from "./types";
import type { Feedback } from "@/types/ui";

export interface CollectionLinksManagerViewProps {
  // Collection state
  isPublic: boolean;
  onToggleVisibility: (checked: boolean) => void;
  isVisibilityUpdating: boolean;

  // Filter state
  filterTerm: string;
  onFilterChange: (value: string) => void;
  hasFilter: boolean;
  filteredLinks: CollectionLinkModel[];

  // Data
  links: CollectionLinkModel[];
  activeLink: CollectionLinkModel | null;

  // Feedback
  feedback: Feedback;

  // DND state
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => void;
  isReordering: boolean;

  // Dialog state
  isEditing: boolean;
  onEditOpenChange: (open: boolean) => void;
  onEdit: (id: string) => void;
  onEditSubmit: (formData: FormData) => void;
  isUpdating: boolean;

  isDeletingDialogOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  onDeleteConfirm: () => void;
  isDeleting: boolean;
}

/**
 * Presentational component for the collection links manager.
 */
export function CollectionLinksManagerView({
  isPublic,
  onToggleVisibility,
  isVisibilityUpdating,
  filterTerm,
  onFilterChange,
  hasFilter,
  filteredLinks,
  links,
  activeLink,
  feedback,
  sensors,
  onDragEnd,
  isReordering,
  isEditing,
  onEditOpenChange,
  onEdit,
  onEditSubmit,
  isUpdating,
  isDeletingDialogOpen,
  onDeleteOpenChange,
  onDelete,
  onDeleteConfirm,
  isDeleting,
}: CollectionLinksManagerViewProps) {
  const hasLinks = filteredLinks.length > 0;

  return (
    <>
      <LinksToolbar
        isPublic={isPublic}
        onToggleVisibility={onToggleVisibility}
        visibilityDisabled={isDeleting || isUpdating || isVisibilityUpdating}
        filterTerm={filterTerm}
        onFilterChange={onFilterChange}
      />

      {feedback ? (
        <div className="mt-4">
          <FeedbackAlert feedback={feedback} />
        </div>
      ) : null}

      {hasFilter ? (
        <div className="text-muted-foreground mt-4 text-sm">
          Showing {filteredLinks.length} of {links.length} links
        </div>
      ) : null}

      {!hasLinks ? (
        <LinksEmptyState hasFilter={hasFilter} onClearFilter={() => onFilterChange("")} />
      ) : (
        <LinksList
          links={links}
          filteredLinks={filteredLinks}
          hasFilter={hasFilter}
          sensors={sensors}
          onDragEnd={onDragEnd}
          isReordering={isReordering}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}

      <EditLinkDialog
        open={isEditing && !!activeLink}
        onOpenChange={onEditOpenChange}
        link={activeLink}
        onSubmit={onEditSubmit}
        isSubmitting={isUpdating}
      />

      <DeleteLinkDialog
        open={isDeletingDialogOpen && !!activeLink}
        onOpenChange={onDeleteOpenChange}
        link={activeLink}
        onConfirm={onDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
