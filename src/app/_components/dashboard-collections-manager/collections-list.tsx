"use client";

import {
  DndContext,
  type DragEndEvent,
  type SensorDescriptor,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { SortableCollectionItem } from "../sortable-collection-item";
import type { DashboardCollectionModel } from "./types";

type CollectionsListProps = {
  collections: DashboardCollectionModel[];
  sensors: SensorDescriptor<object>[];
  onDragEnd: (event: DragEndEvent) => void;
  isDragDisabled: boolean;
  onEdit: (collectionId: string) => void;
  onDelete: (collectionId: string) => void;
};

export function CollectionsList({
  collections,
  sensors,
  onDragEnd,
  isDragDisabled,
  onEdit,
  onDelete,
}: CollectionsListProps) {
  return (
    <DndContext
      sensors={sensors}
      onDragEnd={onDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={collections.map((collection) => collection.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {collections.map((collection) => (
            <SortableCollectionItem
              key={collection.id}
              collection={collection}
              onEdit={onEdit}
              onDelete={onDelete}
              dragDisabled={isDragDisabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
