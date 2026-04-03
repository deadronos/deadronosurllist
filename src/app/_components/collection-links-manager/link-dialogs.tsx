"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DialogActions } from "@/components/ui/dialog-actions";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

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

export function EditLinkDialog({
  open,
  onOpenChange,
  link,
  onSubmit,
  isSubmitting,
}: EditLinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit link</DialogTitle>
          <DialogDescription>
            Update the URL, title, or description for this link.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            onSubmit(formData);
          }}
          key={link?.id ?? "new"}
        >
          <Input
            name="url"
            defaultValue={link?.url ?? ""}
            placeholder="https://example.com"
            required
            disabled={isSubmitting}
          />
          <Input
            name="name"
            defaultValue={link?.name ?? ""}
            placeholder="Display name"
            required
            disabled={isSubmitting}
          />
          <Input
            name="comment"
            defaultValue={link?.comment ?? ""}
            placeholder="Comment (optional)"
            disabled={isSubmitting}
          />

          <DialogActions
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteLinkDialog({
  open,
  onOpenChange,
  link,
  onConfirm,
  isDeleting,
}: DeleteLinkDialogProps) {
  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete link"
      description={
        <>
          This removes <strong>{link?.name ?? "this link"}</strong> from the
          collection. This action cannot be undone.
        </>
      }
      onConfirm={onConfirm}
      isDeleting={isDeleting}
    />
  );
}
