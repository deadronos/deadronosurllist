"use client";

import { type CSSProperties } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Button,
  Card,
  Flex,
  Heading,
  IconButton,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import {
  DotsVerticalIcon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";

import type { DashboardCollectionModel } from "./dashboard-collections-manager/types";

type SortableCollectionItemProps = {
  collection: DashboardCollectionModel;
  onEdit: () => void;
  onDelete: () => void;
  dragDisabled?: boolean;
};

export function SortableCollectionItem({
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
    <Card
      ref={setNodeRef}
      style={style}
      variant="classic"
      className="border-white/10 bg-black/40"
    >
      <Flex
        direction={{ initial: "column", sm: "row" }}
        align={{ initial: "start", sm: "center" }}
        justify="between"
        gap="3"
      >
        <Flex align="start" gap="3" className="flex-1">
          <Tooltip
            content={
              dragDisabled
                ? "Reordering disabled while saving"
                : "Drag to reorder collections"
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
          <Flex direction="column" gap="2" className="flex-1">
            <Heading as="h3" size="4">
              <Link
                href={`/collections/${collection.id}`}
                className="text-white hover:underline"
              >
                {collection.name}
              </Link>
            </Heading>
            {collection.description ? (
              <Text size="2" color="gray">
                {collection.description}
              </Text>
            ) : null}
          </Flex>
        </Flex>
        <Flex
          align={{ initial: "start", sm: "center" }}
          gap="3"
          direction={{ initial: "column", sm: "row" }}
        >
          <Text size="2" color="gray">
            {collection.linkCount.toLocaleString()}{" "}
            {collection.linkCount === 1 ? "link" : "links"}
          </Text>
          <Button size="2" variant="soft" asChild>
            <Link href={`/collections/${collection.id}`}>Open</Link>
          </Button>
          <Tooltip content="Edit collection">
            <IconButton variant="outline" onClick={onEdit}>
              <Pencil2Icon />
            </IconButton>
          </Tooltip>
          <Tooltip content="Delete collection">
            <IconButton variant="outline" color="red" onClick={onDelete}>
              <TrashIcon />
            </IconButton>
          </Tooltip>
        </Flex>
      </Flex>
    </Card>
  );
}
