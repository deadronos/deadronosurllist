"use client";

import { Button, Dialog, Flex, TextField } from "@radix-ui/themes";

import type { CollectionLinkModel } from "./types";

type EditLinkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: CollectionLinkModel | null;
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
};

type DeleteLinkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: CollectionLinkModel | null;
  onConfirm: () => void;
  isDeleting: boolean;
};

/**
 * Dialog for editing a link's details.
 *
 * @param {EditLinkDialogProps} props - Component properties.
 * @returns {JSX.Element} The dialog component.
 */
export function EditLinkDialog({
  open,
  onOpenChange,
  link,
  onSubmit,
  isSubmitting,
}: EditLinkDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <Dialog.Title>Edit Link</Dialog.Title>
        <Dialog.Description>
          Update the URL, title, or description for this link.
        </Dialog.Description>
        <form
          className="mt-4 flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            onSubmit(formData);
          }}
          key={link?.id ?? "new"}
        >
          <TextField.Root
            name="url"
            defaultValue={link?.url ?? ""}
            placeholder="https://example.com"
            required
          />
          <TextField.Root
            name="name"
            defaultValue={link?.name ?? ""}
            placeholder="Display name"
            required
          />
          <TextField.Root
            name="comment"
            defaultValue={link?.comment ?? ""}
            placeholder="Comment (optional)"
          />
          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" disabled={isSubmitting}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" loading={isSubmitting}>
              Save changes
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

/**
 * Dialog for confirming link deletion.
 *
 * @param {DeleteLinkDialogProps} props - Component properties.
 * @returns {JSX.Element} The dialog component.
 */
export function DeleteLinkDialog({
  open,
  onOpenChange,
  link,
  onConfirm,
  isDeleting,
}: DeleteLinkDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="360px">
        <Dialog.Title>Delete link</Dialog.Title>
        <Dialog.Description>
          This removes <strong>{link?.name ?? "this link"}</strong> from the
          collection. This action cannot be undone.
        </Dialog.Description>
        <Flex mt="4" gap="3" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" disabled={isDeleting}>
              Cancel
            </Button>
          </Dialog.Close>
          <Button color="red" onClick={onConfirm} loading={isDeleting}>
            Delete
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
