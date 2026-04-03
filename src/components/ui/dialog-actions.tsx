import * as React from "react";
import { Button } from "./button";

type DialogActionsProps = {
  isSubmitting?: boolean;
  onCancel: () => void;
  submitLabel?: string;
  submittingLabel?: string;
};

export function DialogActions({
  isSubmitting,
  onCancel,
  submitLabel = "Save changes",
  submittingLabel = "Saving...",
}: DialogActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </div>
  );
}

type DialogDeleteActionsProps = {
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  deleteLabel?: string;
  deletingLabel?: string;
};

export function DialogDeleteActions({
  isDeleting,
  onCancel,
  onConfirm,
  deleteLabel = "Delete",
  deletingLabel = "Deleting...",
}: DialogDeleteActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
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
        {isDeleting ? deletingLabel : deleteLabel}
      </Button>
    </div>
  );
}
