"use client";

import { type CSSProperties } from "react";
import { ExternalLinkIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { SortableItemCard } from "./sortable-item-card";
import type { CollectionLinkModel } from "./collection-links-manager/types";

export interface SortableLinkItemViewProps {
  link: CollectionLinkModel;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  dragDisabled: boolean;
  isDragging: boolean;
  setNodeRef: (node: HTMLElement | null) => void;
  style: CSSProperties;
  dragProps: Record<string, unknown>;
}

export function SortableLinkItemView({
  link,
  onEdit,
  onDelete,
  dragDisabled,
  isDragging,
  setNodeRef,
  style,
  dragProps,
}: SortableLinkItemViewProps) {
  return (
    <SortableItemCard
      isDragging={isDragging}
      dragDisabled={dragDisabled}
      dragDisabledTooltip="Reordering disabled while filtering"
      dragEnabledTooltip="Drag to reorder"
      setNodeRef={setNodeRef}
      style={style}
      dragProps={dragProps}
    >
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="min-w-0">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 truncate text-sm font-medium hover:underline max-w-full"
          >
            <span className="truncate">{link.name}</span>
            <ExternalLinkIcon className="text-muted-foreground size-3 shrink-0" />
          </a>
          {link.comment ? (
            <div className="text-muted-foreground mt-1 truncate text-sm">
              {link.comment}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={() => onEdit(link.id)}
                aria-label="Edit link"
              >
                <PencilIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit link</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={() => onDelete(link.id)}
                aria-label="Delete link"
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2Icon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete link</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </SortableItemCard>
  );
}
