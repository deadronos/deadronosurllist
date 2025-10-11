"use client";

import {
  Button,
  Callout,
  Dialog,
  Flex,
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
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
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

type CollectionLinksManagerProps = {
  collectionId: string;
  initialLinks: CollectionLinkModel[];
};

export function CollectionLinksManager({
  collectionId,
  initialLinks,
}: CollectionLinksManagerProps) {
  const [links, setLinks] = useState(initialLinks);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const utils = api.useUtils();
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

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
    onSuccess: async () => {
      await utils.collection.getById.invalidate({ id: collectionId });
      router.refresh();
      setIsEditing(false);
      setSelectedLinkId(null);
    },
  });

  const deleteMutation = api.link.delete.useMutation({
    onSuccess: async (_, variables) => {
      setLinks((prev) => prev.filter((link) => link.id !== variables.id));
      await utils.collection.getById.invalidate({ id: collectionId });
      router.refresh();
      setIsDeleting(false);
      setSelectedLinkId(null);
    },
  });

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

      startTransition(() => {
        reorderMutation.mutate({
          collectionId,
          linkIds: reordered.map((link) => link.id),
        });
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
    const comment =
      typeof commentValue === "string" ? commentValue : undefined;

    if (!url || !name) {
      return;
    }

    updateMutation.mutate({
      id: activeLink.id,
      url,
      name,
      comment,
    });
  };

  const handleDelete = () => {
    if (!activeLink) return;
    deleteMutation.mutate({ id: activeLink.id });
  };

  const hasLinks = links.length > 0;

  return (
    <>
      {!hasLinks ? (
        <Callout.Root color="gray" className="mt-6">
          <Callout.Icon>
            <DotsHorizontalIcon />
          </Callout.Icon>
          <Callout.Text>
            No links yet. Add your first resource using the form above.
          </Callout.Text>
        </Callout.Root>
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
            This removes <strong>{activeLink?.name ?? "this link"}</strong>{" "}
            from the collection. This action cannot be undone.
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

