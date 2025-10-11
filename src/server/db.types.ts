import type { Collection, Link, Post, Prisma } from "@prisma/client";

export type CollectionRecord = Collection & {
  links?: LinkRecord[];
  _count?: { links: number };
};

export type LinkRecord = Link & {
  collection?: CollectionRecord;
};

export type LinkListDatabase = {
  $transaction(
    operations: Array<(() => Promise<unknown>) | Promise<unknown>>,
  ): Promise<unknown[]>;
  collection: {
    findMany(args?: Prisma.CollectionFindManyArgs): Promise<CollectionRecord[]>;
    findFirst(
      args?: Prisma.CollectionFindFirstArgs,
    ): Promise<CollectionRecord | null>;
    create(args: Prisma.CollectionCreateArgs): Promise<Collection>;
    updateMany(
      args: Prisma.CollectionUpdateManyArgs,
    ): Promise<Prisma.BatchPayload>;
    deleteMany(
      args: Prisma.CollectionDeleteManyArgs,
    ): Promise<Prisma.BatchPayload>;
  };
  link: {
    findFirst(args?: Prisma.LinkFindFirstArgs): Promise<LinkRecord | null>;
    findMany(args?: Prisma.LinkFindManyArgs): Promise<LinkRecord[]>;
    create(args: Prisma.LinkCreateArgs): Promise<Link>;
    update(args: Prisma.LinkUpdateArgs): Promise<LinkRecord>;
    updateMany(args: Prisma.LinkUpdateManyArgs): Promise<Prisma.BatchPayload>;
    delete(args: Prisma.LinkDeleteArgs): Promise<LinkRecord>;
  };
  post: {
    findFirst(args?: Prisma.PostFindFirstArgs): Promise<Post | null>;
    create(args: Prisma.PostCreateArgs): Promise<Post>;
  };
};
