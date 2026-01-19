"use client";

import { useCallback, useMemo, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import {
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  SearchIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { useTextFilter } from "@/hooks/use-text-filter";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

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
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="bg-background/35 flex items-center justify-between gap-4 rounded-xl border px-4 py-3 sm:w-[360px]">
          <div className="flex items-center gap-2">
            {isPublic ? (
              <EyeIcon className="text-muted-foreground size-4" />
            ) : (
              <EyeOffIcon className="text-muted-foreground size-4" />
            )}
            <div>
              <div className="text-sm font-medium">
                {isPublic ? "Visible to anyone" : "Only you can see this"}
              </div>
              <div className="text-muted-foreground text-xs">
                Toggle to publish or hide this collection.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isPublic ? "default" : "secondary"}>
              {isPublic ? "Public" : "Private"}
            </Badge>
            <Switch
              checked={isPublic}
              onCheckedChange={toggleVisibility}
              disabled={isDeleting || isUpdating || isVisibilityUpdating}
              aria-label="Toggle collection visibility"
            />
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Filter links..."
            value={filterTerm}
            onChange={(event) => setFilterTerm(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {feedback ? (
        <div className="mt-4">
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
        </div>
      ) : null}

      {hasFilter ? (
        <div className="text-muted-foreground mt-4 text-sm">
          Showing {filteredLinks.length} of {links.length} links
        </div>
      ) : null}

      {!hasLinks ? (
        <div className="bg-background/35 mt-6 rounded-xl border p-6">
          <div className="text-sm font-medium">
            {hasFilter ? "No matches" : "No links yet"}
          </div>
          <div className="text-muted-foreground mt-1 text-sm">
            {hasFilter
              ? "No links match the current filter."
              : "Add your first resource using the form above."}
          </div>
          {hasFilter ? (
            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFilterTerm("")}
              >
                Clear filter
              </Button>
            </div>
          ) : null}
        </div>
      ) : hasFilter ? (
        <div className="mt-6 space-y-2">
          {filteredLinks.map((link) => (
            <SortableLinkItem
              key={link.id}
              link={link}
              dragDisabled
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
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
            <div className="mt-6 space-y-2">
              {links.map((link) => (
                <SortableLinkItem
                  key={link.id}
                  link={link}
                  dragDisabled={isReordering}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                />
              ))}
            </div>
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
