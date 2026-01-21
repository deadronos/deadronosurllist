import type {
  CollectionInclude,
  CollectionRecord,
  LinkInclude,
  LinkRecord,
} from "./types";
import { getStore } from "./store";

import type { CollectionRecord as CollectionDto, LinkRecord as LinkDto } from "../db.types";

const cloneDate = (value: Date) => new Date(value.getTime());

export const toCollectionResult = (
  record: CollectionRecord,
  include?: CollectionInclude,
): CollectionDto => {
  const store = getStore();

  const base: CollectionDto = {
    id: record.id,
    name: record.name,
    description: record.description,
    isPublic: record.isPublic,
    createdById: record.createdById,
    createdAt: cloneDate(record.createdAt),
    updatedAt: cloneDate(record.updatedAt),
    order: record.order,
  };

  const includeCount =
    include?._count === true ||
    (typeof include?._count === "object" && include?._count?.select?.links);

  if (includeCount) {
    base._count = { links: record.linkIds.length };
  }

  if (include?.links) {
    const options = include.links === true ? {} : include.links;
    const linkRecords = record.linkIds
      .map((id) => store.links.get(id))
      .filter((l): l is LinkRecord => !!l);

    if (options?.orderBy?.order) {
      const direction = options.orderBy.order;
      linkRecords.sort((a, b) =>
        direction === "desc" ? b.order - a.order : a.order - b.order,
      );
    } else {
      linkRecords.sort((a, b) => a.order - b.order);
    }

    base.links = linkRecords.map((link) => toLinkResult(link));
  }

  return base;
};

export const toLinkResult = (
  record: LinkRecord,
  opts?: { include?: LinkInclude },
): LinkDto => {
  const store = getStore();

  const base: LinkDto = {
    id: record.id,
    collectionId: record.collectionId,
    url: record.url,
    name: record.name,
    comment: record.comment,
    order: record.order,
    createdAt: cloneDate(record.createdAt),
    updatedAt: cloneDate(record.updatedAt),
  };

  if (opts?.include) {
    const includeOptions = opts.include === true ? {} : opts.include;
    if (includeOptions?.collection) {
      const collectionInclude =
        includeOptions.collection === true
          ? undefined
          : includeOptions.collection.include;
      const collectionRecord = store.collections.get(record.collectionId);
      if (collectionRecord) {
        base.collection = toCollectionResult(collectionRecord, collectionInclude);
      }
    }
  }

  return base;
};

// Intentionally keep this module focused on mapping records -> DTOs.
