import type { Collection, Link, Prisma } from "@prisma/client";

/**
 * Represents a Collection record, optionally including related Links and counts.
 */
export type CollectionRecord = Collection & {
  links?: LinkRecord[];
  _count?: { links: number };
};

/**
 * Represents a Link record, optionally including its parent Collection.
 */
export type LinkRecord = Link & {
  collection?: CollectionRecord;
};

/**
 * Abstract interface for the database, compatible with both Prisma and the mock DB.
 */
export type LinkListDatabase = {
  $transaction(
    operations: Array<
      | (() => Promise<unknown>)
      | Promise<unknown>
      | Prisma.PrismaPromise<unknown>
    >,
  ): Promise<unknown[]>;
  collection: {
    findMany(args?: Prisma.CollectionFindManyArgs): Promise<CollectionRecord[]>;
    findFirst(
      args?: Prisma.CollectionFindFirstArgs,
    ): Promise<CollectionRecord | null>;
    create(args: Prisma.CollectionCreateArgs): Promise<Collection>;
    update(args: Prisma.CollectionUpdateArgs): Promise<Collection>;
    updateMany(
      args: Prisma.CollectionUpdateManyArgs,
    ): Promise<Prisma.BatchPayload>;
    count(args?: Prisma.CollectionCountArgs): Promise<number>;
    delete(args: Prisma.CollectionDeleteArgs): Promise<Collection>;
    deleteMany(
      args: Prisma.CollectionDeleteManyArgs,
    ): Promise<Prisma.BatchPayload>;
  };
  link: {
    findFirst(args?: Prisma.LinkFindFirstArgs): Promise<LinkRecord | null>;
    findMany(args?: Prisma.LinkFindManyArgs): Promise<LinkRecord[]>;
    create(args: Prisma.LinkCreateArgs): Promise<Link>;
    createMany(args: Prisma.LinkCreateManyArgs): Promise<Prisma.BatchPayload>;
    update(args: Prisma.LinkUpdateArgs): Promise<LinkRecord>;
    updateMany(args: Prisma.LinkUpdateManyArgs): Promise<Prisma.BatchPayload>;
    delete(args: Prisma.LinkDeleteArgs): Promise<LinkRecord>;
  };
};
