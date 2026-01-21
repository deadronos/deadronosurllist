"use client";

import { DndContext, type DragEndEvent, type SensorDescriptor } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { SortableLinkItem } from "../sortable-link-item";
import type { CollectionLinkModel } from "./types";

type LinksListProps = {
  links: CollectionLinkModel[];
  filteredLinks: CollectionLinkModel[];
  hasFilter: boolean;
  sensors: SensorDescriptor<object>[];
  onDragEnd: (event: DragEndEvent) => void;
  isReordering: boolean;
  onEdit: (linkId: string) => void;
  onDelete: (linkId: string) => void;
};

export function LinksList({
  links,
  filteredLinks,
  hasFilter,
  sensors,
  onDragEnd,
  isReordering,
  onEdit,
  onDelete,
}: LinksListProps) {
  if (hasFilter) {
    return (
      <div className="mt-6 space-y-2">
        {filteredLinks.map((link) => (
          <SortableLinkItem
            key={link.id}
            link={link}
            dragDisabled
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
      <SortableContext items={links.map((link) => link.id)} strategy={verticalListSortingStrategy}>
        <div className="mt-6 space-y-2">
          {links.map((link) => (
            <SortableLinkItem
              key={link.id}
              link={link}
              dragDisabled={isReordering}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
