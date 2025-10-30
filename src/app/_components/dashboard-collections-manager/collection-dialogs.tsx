"use client";

import {
  Button,
  Dialog,
  Flex,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";

import type { DashboardCollectionModel } from "./types";

type EditCollectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: DashboardCollectionModel | null;
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
};

type DeleteCollectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: DashboardCollectionModel | null;
  onConfirm: () => void;
  isDeleting: boolean;
};

export function EditCollectionDialog({
  open,
  onOpenChange,
  collection,
  onSubmit,
  isSubmitting,
}: EditCollectionDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Edit collection</Dialog.Title>
        <Dialog.Description>
          Update the collection name or description.
        </Dialog.Description>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            onSubmit(formData);
          }}
          className="mt-4"
          key={collection?.id ?? "new"}
        >
          <Flex direction="column" gap="3">
            <TextField.Root
              name="name"
              defaultValue={collection?.name ?? ""}
              required
              disabled={isSubmitting}
              aria-label="Collection name"
            />
            <TextArea
              name="description"
              defaultValue={collection?.description ?? ""}
              rows={3}
              disabled={isSubmitting}
              aria-label="Collection description"
            />
            <Flex gap="3" justify="end">
              <Button
                type="button"
                variant="soft"
                color="gray"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export function DeleteCollectionDialog({
  open,
  onOpenChange,
  collection,
  onConfirm,
  isDeleting,
}: DeleteCollectionDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <Dialog.Title>Delete collection</Dialog.Title>
        <Dialog.Description>
          This action cannot be undone. All links in this collection will be
          removed.
        </Dialog.Description>
        <Flex direction="column" gap="3" mt="4">
          <Text>
            Are you sure you want to delete <strong>{collection?.name}</strong>?
          </Text>
          <Flex gap="3" justify="end">
            <Button
              type="button"
              variant="soft"
              color="gray"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              color="red"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
