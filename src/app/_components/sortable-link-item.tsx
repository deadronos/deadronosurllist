"use client";

import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  Flex,
  IconButton,
  Link as RadixLink,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import {
  DotsVerticalIcon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";

import type { CollectionLinkModel } from "./collection-links-manager/types";

type SortableLinkItemProps = {
  link: CollectionLinkModel;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  dragDisabled?: boolean;
};

/**
 * A link item within a sortable list.
 * Supports drag-and-drop, editing, and deletion.
 *
 * @param {SortableLinkItemProps} props - Component properties.
 * @returns {JSX.Element} The sortable item component.
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
    <Card
      ref={setNodeRef}
      style={style}
      variant="surface"
      className="border border-white/10 bg-white/5 backdrop-blur"
    >
      <Flex align="center" justify="between" gap="3">
        <Flex align="center" gap="3" className="flex-1">
          <Tooltip
            content={
              dragDisabled
                ? "Reordering disabled while filtering"
                : "Drag to reorder"
            }
          >
            <IconButton
              variant="soft"
              color="gray"
              {...dragProps}
              disabled={dragDisabled}
            >
              <DotsVerticalIcon />
            </IconButton>
          </Tooltip>
          <Flex direction="column" gap="1" className="overflow-hidden">
            <RadixLink
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              color="blue"
              underline="always"
              weight="medium"
              className="truncate"
            >
              {link.name}
            </RadixLink>
            {link.comment ? (
              <Text size="2" color="gray" className="truncate">
                {link.comment}
              </Text>
            ) : null}
          </Flex>
        </Flex>
        <Flex gap="2">
          <Tooltip content="Edit link">
            <IconButton variant="outline" onClick={() => onEdit(link.id)}>
              <Pencil2Icon />
            </IconButton>
          </Tooltip>
          <Tooltip content="Delete link">
            <IconButton
              variant="outline"
              color="red"
              onClick={() => onDelete(link.id)}
            >
              <TrashIcon />
            </IconButton>
          </Tooltip>
        </Flex>
      </Flex>
    </Card>
  );
});
