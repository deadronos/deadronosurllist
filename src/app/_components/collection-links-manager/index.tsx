"use client";

import { useMemo } from "react";

import { useTextFilter } from "@/hooks/use-text-filter";

import {
  getRequiredTrimmedFormString,
  getTrimmedFormString,
} from "@/lib/form-data";

import { useLinkSelectionDialogs } from "./use-link-selection";
import { useCollectionLinksManager } from "./use-collection-links-manager";
import type { CollectionLinkModel } from "./types";
import { CollectionLinksManagerView } from "./view";

export type { CollectionLinkModel } from "./types";

type CollectionLinksManagerProps = {
  collectionId: string;
  initialLinks: CollectionLinkModel[];
  initialIsPublic: boolean;
};

/**
 * Container component for managing the links within a collection.
 * Handles logic for reordering, filtering, editing, and deleting links.
 *
 * @param {CollectionLinksManagerProps} props - Component properties.
 * @returns {JSX.Element} The manager container.
 */
export function CollectionLinksManager({
  collectionId,
  initialLinks,
  initialIsPublic,
}: CollectionLinksManagerProps) {
  const {
    sensors,
    links,
    feedback,
    isPublic,
    toggleVisibility,
    handleDragEnd,
    updateLink,
    deleteLink,
    isReordering,
    isUpdating,
    isDeleting,
    isVisibilityUpdating,
  } = useCollectionLinksManager({
    collectionId,
    initialLinks,
    initialIsPublic,
  });

  const {
    filteredItems: filteredLinks,
    filterTerm,
    setFilterTerm,
    hasFilter,
  } = useTextFilter({
    items: links,
    searchFields: ["name", "url", "comment"],
  });

  const {
    selectedLinkId,
    isEditing,
    isDeleting: isDeletingDialogOpen,
    openEdit,
    openDelete,
    onEditOpenChange,
    onDeleteOpenChange,
    setEditOpen,
    setDeleteOpen,
  } = useLinkSelectionDialogs();

  const activeLink = useMemo(
    () => links.find((link) => link.id === selectedLinkId) ?? null,
    [links, selectedLinkId],
  );

  const handleEditSubmit = (formData: FormData) => {
    if (!activeLink) return;

    const url = getRequiredTrimmedFormString(formData, "url");
    const name = getRequiredTrimmedFormString(formData, "name");
    if (!url || !name) return;
    const comment = getTrimmedFormString(formData, "comment") ?? "";

    updateLink(
      activeLink.id,
      { url, name, comment },
      {
        onSuccess: () => {
          setEditOpen(false);
        },
        onError: () => {
          setEditOpen(false);
        },
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!activeLink) return;

    deleteLink(activeLink.id, {
      onSuccess: () => {
        setDeleteOpen(false);
      },
      onError: () => {
        setDeleteOpen(false);
      },
    });
  };

  return (
    <CollectionLinksManagerView
      isPublic={isPublic}
      onToggleVisibility={toggleVisibility}
      isVisibilityUpdating={isVisibilityUpdating}
      filterTerm={filterTerm}
      onFilterChange={setFilterTerm}
      hasFilter={hasFilter}
      filteredLinks={filteredLinks}
      links={links}
      activeLink={activeLink}
      feedback={feedback}
      sensors={sensors}
      onDragEnd={handleDragEnd}
      isReordering={isReordering}
      isEditing={isEditing}
      onEditOpenChange={onEditOpenChange}
      onEdit={openEdit}
      onEditSubmit={handleEditSubmit}
      isUpdating={isUpdating}
      isDeletingDialogOpen={isDeletingDialogOpen}
      onDeleteOpenChange={onDeleteOpenChange}
      onDelete={openDelete}
      onDeleteConfirm={handleDeleteConfirm}
      isDeleting={isDeleting}
    />
  );
}
