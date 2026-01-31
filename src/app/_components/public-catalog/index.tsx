"use client";

import { useCallback, useMemo, useState } from "react";

import { api, type RouterInputs, type RouterOutputs } from "@/trpc/react";

import { useIntersectionLoadMore } from "@/hooks/use-intersection-load-more";

import { dedupeById } from "../public-catalog-utils";
import { PublicCatalogView } from "./view";

type PublicCatalogPage = RouterOutputs["collection"]["getPublicCatalog"];
type PublicCatalogInput = RouterInputs["collection"]["getPublicCatalog"];
type PublicCatalogSortBy = NonNullable<PublicCatalogInput["sortBy"]>;
type PublicCatalogSortOrder = NonNullable<PublicCatalogInput["sortOrder"]>;
export type PublicCatalogCollection = PublicCatalogPage["items"][number];
export type PublicCatalogLink = PublicCatalogCollection["topLinks"][number];
export type PublicCatalogSortKey =
  | "updated"
  | "newest"
  | "name-asc"
  | "name-desc"
  | "links-desc";

interface PublicCatalogProps {
  initialPage?: PublicCatalogPage;
  pageSize: number;
  linkLimit: number;
  showTabs?: boolean;
  autoLoadMore?: boolean;
}

const sortOptions: Array<{
  key: PublicCatalogSortKey;
  label: string;
  sortBy: PublicCatalogSortBy;
  sortOrder: PublicCatalogSortOrder;
}> = [
  {
    key: "updated",
    label: "Recently updated",
    sortBy: "updatedAt",
    sortOrder: "desc",
  },
  {
    key: "newest",
    label: "Newest",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  {
    key: "name-asc",
    label: "Name (A → Z)",
    sortBy: "name",
    sortOrder: "asc",
  },
  {
    key: "name-desc",
    label: "Name (Z → A)",
    sortBy: "name",
    sortOrder: "desc",
  },
  {
    key: "links-desc",
    label: "Most links",
    sortBy: "linkCount",
    sortOrder: "desc",
  },
];

const sortConfig = sortOptions.reduce(
  (acc, option) => {
    acc[option.key] = option;
    return acc;
  },
  {} as Record<
    PublicCatalogSortKey,
    { label: string; sortBy: PublicCatalogSortBy; sortOrder: PublicCatalogSortOrder }
  >,
);

export function PublicCatalog({
  initialPage,
  pageSize,
  linkLimit,
  showTabs = false,
  autoLoadMore = false,
}: PublicCatalogProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<PublicCatalogSortKey>("updated");

  const trimmedQuery = query.trim();
  const sortSelection = sortConfig[sortKey];
  const queryInput = useMemo(
    () => ({
      limit: pageSize,
      linkLimit,
      q: trimmedQuery.length > 0 ? trimmedQuery : undefined,
      sortBy: sortSelection.sortBy,
      sortOrder: sortSelection.sortOrder,
    }),
    [pageSize, linkLimit, trimmedQuery, sortSelection],
  );

  const canUseInitialData =
    Boolean(initialPage) && trimmedQuery.length === 0 && sortKey === "updated";
  const initialData =
    canUseInitialData && initialPage
      ? {
          pageParams: [undefined],
          pages: [initialPage],
        }
      : undefined;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = api.collection.getPublicCatalog.useInfiniteQuery(queryInput, {
    initialData,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const pages = data?.pages ?? (initialData ? initialData.pages : []);
  const totalCount = pages[0]?.totalCount ?? 0;

  const collections = useMemo(() => {
    const merged = pages.flatMap((page) => page.items);
    return dedupeById(merged);
  }, [pages]);

  const filteredCollections = collections;

  const showLoadMore = Boolean(hasNextPage);

  const handleLoadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    await fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { sentinelRef } = useIntersectionLoadMore({
    enabled: autoLoadMore && showLoadMore && !isFetchingNextPage,
    onLoadMore: () => {
      void handleLoadMore();
    },
  });

  return (
    <PublicCatalogView
      query={query}
      onQueryChange={setQuery}
      sortKey={sortKey}
      onSortKeyChange={setSortKey}
      sortLabel={sortSelection.label}
      sortOptions={sortOptions.map(({ key, label }) => ({ key, label }))}
      filteredCollections={filteredCollections}
      totalCount={totalCount}
      isLoading={isLoading}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      showSort={showTabs}
      autoLoadMore={autoLoadMore}
      showLoadMore={showLoadMore}
      onLoadMore={() => void handleLoadMore()}
      sentinelRef={sentinelRef}
    />
  );
}