"use client";

import { useCallback, useMemo, useState } from "react";

import { api, type RouterOutputs } from "@/trpc/react";

import { useIntersectionLoadMore } from "@/hooks/use-intersection-load-more";

import {
  dedupeById,
  filterCollectionsByQuery,
  sortCollectionsByTab,
} from "../public-catalog-utils";
import { PublicCatalogView } from "./view";

type PublicCatalogPage = RouterOutputs["collection"]["getPublicCatalog"];
export type PublicCatalogCollection = PublicCatalogPage["items"][number];
export type PublicCatalogLink = PublicCatalogCollection["topLinks"][number];

interface PublicCatalogProps {
  initialPage?: PublicCatalogPage;
  pageSize: number;
  linkLimit: number;
  showTabs?: boolean;
  autoLoadMore?: boolean;
}

/**
 * Container component for the public catalog of collections.
 * Handles data fetching, searching, and pagination logic.
 *
 * @param {PublicCatalogProps} props - Component properties.
 * @returns {JSX.Element} The public catalog container.
 */
export function PublicCatalog({
  initialPage,
  pageSize,
  linkLimit,
  showTabs = false,
  autoLoadMore = false,
}: PublicCatalogProps) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"new" | "updated">("updated");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = api.collection.getPublicCatalog.useInfiniteQuery(
    { limit: pageSize, linkLimit },
    {
      initialData: initialPage
        ? {
            pageParams: [undefined],
            pages: [initialPage],
          }
        : undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  );

  const pages = data?.pages ?? (initialPage ? [initialPage] : []);
  const totalCount = pages[0]?.totalCount ?? 0;

  const collections = useMemo(() => {
    const merged = pages.flatMap((page) => page.items);
    return dedupeById(merged);
  }, [pages]);

  const sortedCollections = useMemo(() => {
    return sortCollectionsByTab(collections, tab);
  }, [collections, tab]);

  const filteredCollections = useMemo(() => {
    return filterCollectionsByQuery(sortedCollections, query);
  }, [sortedCollections, query]);

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
      tab={tab}
      onTabChange={setTab}
      filteredCollections={filteredCollections}
      totalCount={totalCount}
      isLoading={isLoading}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      showTabs={showTabs}
      autoLoadMore={autoLoadMore}
      showLoadMore={showLoadMore}
      onLoadMore={() => void handleLoadMore()}
      sentinelRef={sentinelRef}
    />
  );
}
