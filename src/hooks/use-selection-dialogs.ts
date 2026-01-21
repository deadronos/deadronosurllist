"use client";

import { useCallback, useState } from "react";

export function useSelectionDialogs() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openEdit = useCallback((id: string) => {
    setSelectedId(id);
    setIsEditOpen(true);
  }, []);

  const openDelete = useCallback((id: string) => {
    setSelectedId(id);
    setIsDeleteOpen(true);
  }, []);

  const onEditOpenChange = useCallback((open: boolean) => {
    setIsEditOpen(open);
    if (!open) setSelectedId(null);
  }, []);

  const onDeleteOpenChange = useCallback((open: boolean) => {
    setIsDeleteOpen(open);
    if (!open) setSelectedId(null);
  }, []);

  const closeEdit = useCallback(() => {
    setIsEditOpen(false);
    setSelectedId(null);
  }, []);

  const closeDelete = useCallback(() => {
    setIsDeleteOpen(false);
    setSelectedId(null);
  }, []);

  return {
    selectedId,
    isEditOpen,
    isDeleteOpen,
    openEdit,
    openDelete,
    onEditOpenChange,
    onDeleteOpenChange,
    setEditOpen: setIsEditOpen,
    setDeleteOpen: setIsDeleteOpen,
    closeEdit,
    closeDelete,
  };
}
