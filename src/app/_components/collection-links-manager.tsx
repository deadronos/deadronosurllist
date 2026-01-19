"use client";

import { useCallback, useMemo, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Callout, Flex, Switch, Text, TextField } from "@radix-ui/themes";

import { useTextFilter } from "@/hooks/use-text-filter";
import {
  CheckIcon,
  DotsHorizontalIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";

import { SortableLinkItem } from "./sortable-link-item";
import {
  DeleteLinkDialog,
  EditLinkDialog,
} from "./collection-links-manager/link-dialogs";
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

  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeletingDialogOpen, setIsDeletingDialogOpen] = useState(false);

  const activeLink = useMemo(
    () => links.find((link) => link.id === selectedLinkId) ?? null,
    [links, selectedLinkId],
  );

  const hasLinks = filteredLinks.length > 0;

  const openEditDialog = useCallback((linkId: string) => {
    setSelectedLinkId(linkId);
    setIsEditing(true);
  }, []);

  const openDeleteDialog = useCallback((linkId: string) => {
    setSelectedLinkId(linkId);
    setIsDeletingDialogOpen(true);
  }, []);

  const handleEditSubmit = (formData: FormData) => {
    if (!activeLink) return;

    const urlValue = formData.get("url");
    const nameValue = formData.get("name");
    const commentValue = formData.get("comment");

    if (typeof urlValue !== "string" || typeof nameValue !== "string") {
      return;
    }

    const url = urlValue.trim();
    const name = nameValue.trim();
    const comment = typeof commentValue === "string" ? commentValue : "";

    if (!url || !name) {
      return;
    }

    updateLink(
      activeLink.id,
      { url, name, comment },
      {
        onSuccess: () => {
          setIsEditing(false);
          setSelectedLinkId(null);
        },
        onError: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!activeLink) return;

    deleteLink(activeLink.id, {
      onSuccess: () => {
        setIsDeletingDialogOpen(false);
        setSelectedLinkId(null);
      },
      onError: () => {
        setIsDeletingDialogOpen(false);
      },
    });
  };

  return (
    <>
      <Flex
        align="center"
        justify="between"
        gap="3"
        className="mt-6 flex-col gap-4 sm:flex-row"
      >
        <Flex align="center" gap="2">
          <Switch
            checked={isPublic}
            onCheckedChange={toggleVisibility}
            disabled={isDeleting || isUpdating || isVisibilityUpdating}
          />
          <Text size="2" color="gray">
            {isPublic ? "Visible to anyone" : "Only you can see this"}
          </Text>
        </Flex>
        <TextField.Root
          placeholder="Filter links..."
          value={filterTerm}
          onChange={(event) => setFilterTerm(event.target.value)}
          className="w-full sm:w-64"
        />
      </Flex>

      {feedback ? (
        <Callout.Root
          color={feedback.type === "success" ? "green" : "red"}
          className="mt-4"
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

      {hasFilter ? (
        <Text size="2" color="gray" className="mt-4">
          Showing {filteredLinks.length} of {links.length} links
        </Text>
      ) : null}

      {!hasLinks ? (
        <Callout.Root color="gray" className="mt-6">
          <Callout.Icon>
            <DotsHorizontalIcon />
          </Callout.Icon>
          <Callout.Text>
            {hasFilter
              ? "No links match the current filter."
              : "No links yet. Add your first resource using the form above."}
          </Callout.Text>
        </Callout.Root>
      ) : hasFilter ? (
        <Flex direction="column" gap="2" className="mt-6">
          {filteredLinks.map((link) => (
            <SortableLinkItem
              key={link.id}
              link={link}
              dragDisabled
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          ))}
        </Flex>
      ) : (
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={links.map((link) => link.id)}
            strategy={verticalListSortingStrategy}
          >
            <Flex direction="column" gap="2" className="mt-6">
              {links.map((link) => (
                <SortableLinkItem
                  key={link.id}
                  link={link}
                  dragDisabled={isReordering}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                />
              ))}
            </Flex>
          </SortableContext>
        </DndContext>
      )}

      <EditLinkDialog
        open={isEditing && !!activeLink}
        onOpenChange={(open) => {
          setIsEditing(open);
          if (!open) {
            setSelectedLinkId(null);
          }
        }}
        link={activeLink}
        onSubmit={handleEditSubmit}
        isSubmitting={isUpdating}
      />

      <DeleteLinkDialog
        open={isDeletingDialogOpen && !!activeLink}
        onOpenChange={(open) => {
          setIsDeletingDialogOpen(open);
          if (!open) {
            setSelectedLinkId(null);
          }
        }}
        link={activeLink}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
