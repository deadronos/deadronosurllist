"use client";

import { type CSSProperties, memo } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { DashboardCollectionModel } from "./dashboard-collections-manager/types";
import { SortableCollectionItemView } from "./sortable-collection-item-view";

type SortableCollectionItemProps = {
  collection: DashboardCollectionModel;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  dragDisabled?: boolean;
};

/**
 * Container component for a sortable collection item.
 * Handles drag-and-drop logic using dnd-kit.
 *
 * @param {SortableCollectionItemProps} props - Component properties.
 * @returns {JSX.Element} The sortable item container.
 */
export const SortableCollectionItem = memo(function SortableCollectionItem({
  collection,
  onEdit,
  onDelete,
  dragDisabled = false,
}: SortableCollectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id, disabled: dragDisabled });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : undefined,
  };

  const dragProps = dragDisabled ? {} : { ...attributes, ...listeners };

  return (
    <SortableCollectionItemView
      collection={collection}
      onEdit={onEdit}
      onDelete={onDelete}
      dragDisabled={dragDisabled}
      isDragging={isDragging}
      setNodeRef={setNodeRef}
      style={style}
      dragProps={dragProps}
    />
  );
});
