"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete link</DialogTitle>
          <DialogDescription>
            This removes <strong>{link?.name ?? "this link"}</strong> from the
            collection. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
