"use client";

import { type CSSProperties } from "react";
import Link from "next/link";
import { GripVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
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
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-background/45 border backdrop-blur",
        isDragging ? "ring-ring/30 ring-2" : null,
      )}
    >
      <div className="flex flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "bg-background/40 text-muted-foreground hover:text-foreground mt-0.5 inline-flex size-9 items-center justify-center rounded-lg border",
                  dragDisabled
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-grab",
                )}
                {...dragProps}
                aria-label="Drag to reorder"
              >
                <GripVerticalIcon className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {dragDisabled
                ? "Reordering disabled while saving"
                : "Drag to reorder collections"}
            </TooltipContent>
          </Tooltip>

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
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
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
    </Card>
  );
}
