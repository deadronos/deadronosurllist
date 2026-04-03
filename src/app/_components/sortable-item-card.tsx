"use client";

import { type CSSProperties } from "react";
import { GripVerticalIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

export interface SortableItemCardProps {
  isDragging: boolean;
  dragDisabled: boolean;
  dragDisabledTooltip?: string;
  dragEnabledTooltip?: string;
  setNodeRef: (node: HTMLElement | null) => void;
  style: CSSProperties;
  dragProps: Record<string, unknown>;
  children: React.ReactNode;
}

export function SortableItemCard({
  isDragging,
  dragDisabled,
  dragDisabledTooltip = "Reordering disabled",
  dragEnabledTooltip = "Drag to reorder",
  setNodeRef,
  style,
  dragProps,
  children,
}: SortableItemCardProps) {
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-background/45 border backdrop-blur",
        isDragging ? "ring-ring/30 ring-2" : null,
      )}
    >
      <div className="flex flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between py-3">
        <div className="flex min-w-0 items-start gap-3 w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "bg-background/40 text-muted-foreground hover:text-foreground mt-0.5 inline-flex size-9 items-center justify-center shrink-0 rounded-lg border",
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
              {dragDisabled ? dragDisabledTooltip : dragEnabledTooltip}
            </TooltipContent>
          </Tooltip>

          {children}
        </div>
      </div>
    </Card>
  );
}
