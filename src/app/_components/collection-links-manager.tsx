"use client";

import { useMemo } from "react";

import { FeedbackAlert } from "./feedback-alert";

import { useTextFilter } from "@/hooks/use-text-filter";

import {
  getRequiredTrimmedFormString,
  getTrimmedFormString,
} from "@/lib/form-data";

import {
  DeleteLinkDialog,
  EditLinkDialog,
} from "./collection-links-manager/link-dialogs";
import { LinksEmptyState } from "./collection-links-manager/links-empty-state";
import { LinksList } from "./collection-links-manager/links-list";
import { LinksToolbar } from "./collection-links-manager/links-toolbar";
import { useLinkSelectionDialogs } from "./collection-links-manager/use-link-selection";
import { useCollectionLinksManager } from "./collection-links-manager/use-collection-links-manager";
import type { CollectionLinkModel } from "./collection-links-manager/types";

export type { CollectionLinkModel } from "./collection-links-manager/types";

type CollectionLinksManagerProps = {
  collectionId: string;
  initialLinks: CollectionLinkModel[];
  initialIsPublic: boolean;
};

/**
 * Manages the links within a collection.
 * Provides functionality for reordering, filtering, editing, and deleting links.
 * Also handles collection visibility toggle.
 *
 * @param {CollectionLinksManagerProps} props - Component properties.
 * @returns {JSX.Element} The manager component.
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

  const hasLinks = filteredLinks.length > 0;

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
    <>
      <LinksToolbar
        isPublic={isPublic}
        onToggleVisibility={toggleVisibility}
        visibilityDisabled={isDeleting || isUpdating || isVisibilityUpdating}
        filterTerm={filterTerm}
        onFilterChange={setFilterTerm}
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
        <LinksEmptyState hasFilter={hasFilter} onClearFilter={() => setFilterTerm("")} />
      ) : (
        <LinksList
          links={links}
          filteredLinks={filteredLinks}
          hasFilter={hasFilter}
          sensors={sensors}
          onDragEnd={handleDragEnd}
          isReordering={isReordering}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      )}

      <EditLinkDialog
        open={isEditing && !!activeLink}
        onOpenChange={onEditOpenChange}
        link={activeLink}
        onSubmit={handleEditSubmit}
        isSubmitting={isUpdating}
      />

      <DeleteLinkDialog
        open={isDeletingDialogOpen && !!activeLink}
        onOpenChange={onDeleteOpenChange}
        link={activeLink}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
