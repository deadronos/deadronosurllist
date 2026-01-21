export type SortOrder = "asc" | "desc";

export type UserRecord = {
  id: string;
  name?: string | null;
  email?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CollectionRecord = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  order: number;
  linkIds: string[];
};

export type LinkRecord = {
  id: string;
  collectionId: string;
  url: string;
  name: string;
  comment: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CollectionInclude = {
  _count?: { select?: { links?: boolean } } | boolean;
  links?: boolean | { orderBy?: { order?: SortOrder } };
};

export type LinkInclude =
  | boolean
  | {
      collection?: boolean | { include?: CollectionInclude };
    };

export type Store = {
  users: Map<string, UserRecord>;
  collections: Map<string, CollectionRecord>;
  links: Map<string, LinkRecord>;
};
