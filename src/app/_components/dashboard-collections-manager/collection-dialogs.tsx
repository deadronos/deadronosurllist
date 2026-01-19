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
import { Textarea } from "@/components/ui/textarea";

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

/**
 * Dialog for editing a collection's details.
 *
 * @param {EditCollectionDialogProps} props - Component properties.
 * @returns {JSX.Element} The dialog component.
 */
export function EditCollectionDialog({
  open,
  onOpenChange,
  collection,
  onSubmit,
  isSubmitting,
}: EditCollectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit collection</DialogTitle>
          <DialogDescription>
            Update the collection name or description.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            onSubmit(formData);
          }}
          className="grid gap-3"
          key={collection?.id ?? "new"}
        >
          <Input
            name="name"
            defaultValue={collection?.name ?? ""}
            required
            disabled={isSubmitting}
            aria-label="Collection name"
          />
          <Textarea
            name="description"
            defaultValue={collection?.description ?? ""}
            rows={3}
            disabled={isSubmitting}
            aria-label="Collection description"
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

export function DeleteCollectionDialog({
  open,
  onOpenChange,
  collection,
  onConfirm,
  isDeleting,
}: DeleteCollectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete collection</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All links in this collection will be
            removed.
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm">
          Are you sure you want to delete <strong>{collection?.name}</strong>?
        </div>

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
