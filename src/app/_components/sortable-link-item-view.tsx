"use client";

import { type CSSProperties } from "react";
import {
  ExternalLinkIcon,
  GripVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
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
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-background/45 border backdrop-blur",
        isDragging ? "ring-ring/30 ring-2" : null,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "bg-background/40 text-muted-foreground hover:text-foreground inline-flex size-9 items-center justify-center rounded-lg border",
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
                ? "Reordering disabled while filtering"
                : "Drag to reorder"}
            </TooltipContent>
          </Tooltip>

          <div className="min-w-0">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 truncate text-sm font-medium hover:underline"
            >
              <span className="truncate">{link.name}</span>
              <ExternalLinkIcon className="text-muted-foreground size-3" />
            </a>
            {link.comment ? (
              <div className="text-muted-foreground mt-1 truncate text-sm">
                {link.comment}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
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
    </Card>
  );
}
