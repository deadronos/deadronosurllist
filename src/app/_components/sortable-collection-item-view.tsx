"use client";

import { type CSSProperties } from "react";
import Link from "next/link";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { SortableItemCard } from "./sortable-item-card";
import type { DashboardCollectionModel } from "./dashboard-collections-manager/types";

export interface SortableCollectionItemViewProps {
  collection: DashboardCollectionModel;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  dragDisabled: boolean;
  isDragging: boolean;
  setNodeRef: (node: HTMLElement | null) => void;
  style: CSSProperties;
  dragProps: Record<string, unknown>;
}

export function SortableCollectionItemView({
  collection,
  onEdit,
  onDelete,
  dragDisabled,
  isDragging,
  setNodeRef,
  style,
  dragProps,
}: SortableCollectionItemViewProps) {
  return (
    <SortableItemCard
      isDragging={isDragging}
      dragDisabled={dragDisabled}
      dragDisabledTooltip="Reordering disabled while saving"
      dragEnabledTooltip="Drag to reorder collections"
      setNodeRef={setNodeRef}
      style={style}
      dragProps={dragProps}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
        <div className="min-w-0">
          <div className="text-sm leading-tight font-semibold">
            <Link
              href={`/collections/${collection.id}`}
              className="hover:underline"
            >
              {collection.name}
            </Link>
          </div>
          {collection.description ? (
            <div className="text-muted-foreground mt-1 line-clamp-2 text-sm">
              {collection.description}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end shrink-0">
          <div className="text-muted-foreground text-sm">
            {collection.linkCount.toLocaleString()}{" "}
            {collection.linkCount === 1 ? "link" : "links"}
          </div>

          <Button size="sm" variant="secondary" asChild>
            <Link href={`/collections/${collection.id}`}>Open</Link>
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={() => onEdit(collection.id)}
                aria-label="Edit collection"
              >
                <PencilIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit collection</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={() => onDelete(collection.id)}
                aria-label="Delete collection"
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2Icon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete collection</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </SortableItemCard>
  );
}
