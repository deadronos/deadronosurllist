"use client";

import { memo } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { CollectionLinkModel } from "./collection-links-manager/types";
import { SortableLinkItemView } from "./sortable-link-item-view";

type SortableLinkItemProps = {
  link: CollectionLinkModel;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  dragDisabled?: boolean;
};

/**
 * Container component for a sortable link item.
 * Handles drag-and-drop logic using dnd-kit.
 *
 * @param {SortableLinkItemProps} props - Component properties.
 * @returns {JSX.Element} The sortable item container.
 */
export const SortableLinkItem = memo(function SortableLinkItem({
  link,
  onEdit,
  onDelete,
  dragDisabled = false,
}: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id, disabled: dragDisabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : undefined,
  };

  const dragProps = dragDisabled ? {} : { ...attributes, ...listeners };

  return (
    <SortableLinkItemView
      link={link}
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
