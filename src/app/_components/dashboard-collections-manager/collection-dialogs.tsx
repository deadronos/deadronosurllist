"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogActions } from "@/components/ui/dialog-actions";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

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

          <DialogActions
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
          />
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
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete collection"
      description="This action cannot be undone. All links in this collection will be removed."
      onConfirm={onConfirm}
      isDeleting={isDeleting}
    >
      <div className="text-sm">
        Are you sure you want to delete <strong>{collection?.name}</strong>?
      </div>
    </ConfirmDeleteDialog>
  );
}
