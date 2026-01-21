"use client";

import { useSelectionDialogs } from "@/hooks/use-selection-dialogs";

export function useLinkSelectionDialogs() {
  const {
    selectedId,
    isEditOpen,
    isDeleteOpen,
    openEdit,
    openDelete,
    onEditOpenChange,
    onDeleteOpenChange,
    setEditOpen,
    setDeleteOpen,
    closeEdit,
    closeDelete,
  } = useSelectionDialogs();

  return {
    selectedLinkId: selectedId,
    isEditing: isEditOpen,
    isDeleting: isDeleteOpen,
    openEdit,
    openDelete,
    onEditOpenChange,
    onDeleteOpenChange,
    setEditOpen,
    setDeleteOpen,
    closeEdit,
    closeDelete,
  };
}
