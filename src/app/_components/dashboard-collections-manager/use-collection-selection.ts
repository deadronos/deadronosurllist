"use client";

import { useSelectionDialogs } from "@/hooks/use-selection-dialogs";

export function useCollectionSelectionDialogs() {
  const {
    selectedId,
    isEditOpen,
    isDeleteOpen,
    openEdit,
    openDelete,
    onEditOpenChange,
    onDeleteOpenChange,
    closeEdit,
    closeDelete,
  } = useSelectionDialogs();

  return {
    activeCollectionId: selectedId,
    isEditDialogOpen: isEditOpen,
    isDeleteDialogOpen: isDeleteOpen,
    openEdit,
    openDelete,
    onEditOpenChange,
    onDeleteOpenChange,
    closeEdit,
    closeDelete,
  };
}
