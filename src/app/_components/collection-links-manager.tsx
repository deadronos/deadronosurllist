"use client";

import {
  Button,
  Callout,
  Dialog,
  Flex,
  Switch,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  CheckIcon,
  DotsHorizontalIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/trpc/react";

import { SortableLinkItem } from "./sortable-link-item";

export type CollectionLinkModel = {
  id: string;
  name: string;
  url: string;
  comment: string | null;
  order: number;
};

type Feedback = { type: "success" | "error"; message: string } | null;

type CollectionLinksManagerProps = {
  collectionId: string;
  initialLinks: CollectionLinkModel[];
  initialIsPublic: boolean;
};

export function CollectionLinksManager({
  collectionId,
  initialLinks,
  initialIsPublic,
}: CollectionLinksManagerProps) {
  const [links, setLinks] = useState(initialLinks);
  const [filterTerm, setFilterTerm] = useState("");
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const utils = api.useUtils();
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  useEffect(() => {
    setIsPublic(initialIsPublic);
  }, [initialIsPublic]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
  );

  const reorderMutation = api.link.reorder.useMutation({
    onSettled: async () => {
      await utils.collection.getById.invalidate({ id: collectionId });
      router.refresh();
    },
  });

  const updateMutation = api.link.update.useMutation({
    onSettled: async () => {
      await utils.collection.getById.invalidate({ id: collectionId });
      router.refresh();
    },
  });

  const deleteMutation = api.link.delete.useMutation({
    onSettled: async () => {
      await utils.collection.getById.invalidate({ id: collectionId });
      router.refresh();
    },
  });

  const visibilityMutation = api.collection.update.useMutation({
    onSettled: async () => {
      await utils.collection.getAll.invalidate();
      await utils.collection.getById.invalidate({ id: collectionId });
      router.refresh();
    },
  });

  const filteredLinks = useMemo(() => {
    if (!filterTerm.trim()) return links;
    const query = filterTerm.trim().toLowerCase();
    return links.filter((link) => {
      return (
        link.name.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query) ||
        (link.comment?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [links, filterTerm]);

  const hasFilter = filterTerm.trim().length > 0;

  const activeLink = useMemo(
    () => links.find((link) => link.id === selectedLinkId) ?? null,
    [links, selectedLinkId],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setLinks((prev) => {
      const oldIndex = prev.findIndex((link) => link.id === active.id);
      const newIndex = prev.findIndex((link) => link.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);

      const previous = prev;
      startTransition(() => {
        reorderMutation.mutate(
          {
            collectionId,
            linkIds: reordered.map((link) => link.id),
          },
          {
            onSuccess: () =>
              setFeedback({ type: "success", message: "Link order updated" }),
            onError: () => {
              setLinks(previous);
              setFeedback({
                type: "error",
                message: "Unable to update link order",
              });
            },
          },
        );
      });

      return reordered;
    });
  };

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

    const previousLinks = links;
    setLinks((prev) =>
      prev.map((link) =>
        link.id === activeLink.id ? { ...link, url, name, comment } : link,
      ),
    );

    updateMutation.mutate(
      { id: activeLink.id, url, name, comment },
      {
        onSuccess: () => {
          setFeedback({ type: "success", message: "Link updated" });
          setIsEditing(false);
          setSelectedLinkId(null);
        },
        onError: () => {
          setLinks(previousLinks);
          setFeedback({ type: "error", message: "Unable to update link" });
        },
      },
    );
  };

  const handleDelete = () => {
    if (!activeLink) return;

    const previousLinks = links;
    setLinks((prev) => prev.filter((link) => link.id !== activeLink.id));
    deleteMutation.mutate(
      { id: activeLink.id },
      {
        onSuccess: () => {
          setFeedback({ type: "success", message: "Link removed" });
          setIsDeleting(false);
          setSelectedLinkId(null);
        },
        onError: () => {
          setLinks(previousLinks);
          setFeedback({ type: "error", message: "Unable to delete link" });
        },
      },
    );
  };

  const handleVisibilityToggle = (checked: boolean) => {
    const previous = isPublic;
    setIsPublic(checked);
    visibilityMutation.mutate(
      { id: collectionId, isPublic: checked },
      {
        onSuccess: () =>
          setFeedback({
            type: "success",
            message: checked
              ? "Collection is now public"
              : "Collection is now private",
          }),
        onError: () => {
          setIsPublic(previous);
          setFeedback({
            type: "error",
            message: "Unable to update collection visibility",
          });
        },
      },
    );
  };

  const hasLinks = filteredLinks.length > 0;

  return (
    <>
      <Flex
        align="center"
        justify="between"
        gap="3"
        className="mt-6 flex-col gap-4 sm:flex-row"
      >
        <Flex align="center" gap="2">
          <Switch checked={isPublic} onCheckedChange={handleVisibilityToggle} />
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
              onEdit={() => {
                setSelectedLinkId(link.id);
                setIsEditing(true);
              }}
              onDelete={() => {
                setSelectedLinkId(link.id);
                setIsDeleting(true);
              }}
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
                  onEdit={() => {
                    setSelectedLinkId(link.id);
                    setIsEditing(true);
                  }}
                  onDelete={() => {
                    setSelectedLinkId(link.id);
                    setIsDeleting(true);
                  }}
                />
              ))}
            </Flex>
          </SortableContext>
        </DndContext>
      )}

      <Dialog.Root open={isEditing} onOpenChange={setIsEditing}>
        <Dialog.Content maxWidth="400px">
          <Dialog.Title>Edit Link</Dialog.Title>
          <Dialog.Description>
            Update the URL, title, or description for this link.
          </Dialog.Description>
          <form
            className="mt-4 flex flex-col gap-3"
            action={handleEditSubmit}
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              handleEditSubmit(formData);
            }}
          >
            <TextField.Root
              name="url"
              defaultValue={activeLink?.url ?? ""}
              placeholder="https://example.com"
              required
            />
            <TextField.Root
              name="name"
              defaultValue={activeLink?.name ?? ""}
              placeholder="Display name"
              required
            />
            <TextField.Root
              name="comment"
              defaultValue={activeLink?.comment ?? ""}
              placeholder="Comment (optional)"
            />
            <Flex gap="3" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" loading={updateMutation.isPending}>
                Save changes
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={isDeleting} onOpenChange={setIsDeleting}>
        <Dialog.Content maxWidth="360px">
          <Dialog.Title>Delete link</Dialog.Title>
          <Dialog.Description>
            This removes <strong>{activeLink?.name ?? "this link"}</strong> from
            the collection. This action cannot be undone.
          </Dialog.Description>
          <Flex mt="4" gap="3" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              color="red"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
