"use client";

import { useCallback, useMemo, useState } from "react";

import { api, type RouterOutputs } from "@/trpc/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { Stagger } from "@/components/motion/stagger";

import { useIntersectionLoadMore } from "@/hooks/use-intersection-load-more";

import { PublicCatalogCard } from "./public-catalog-card";
import { PublicCatalogHeader } from "./public-catalog-header";
import {
  dedupeById,
  filterCollectionsByQuery,
  sortCollectionsByTab,
} from "./public-catalog-utils";

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
 * Displays the public catalog of collections with search and pagination.
 * Supports infinite scrolling using `useInfiniteQuery`.
 *
 * @param {PublicCatalogProps} props - Component properties.
 * @param {PublicCatalogPage} [props.initialPage] - The initial page of data loaded from the server.
 * @param {number} props.pageSize - Number of items per page.
 * @param {number} props.linkLimit - Number of links to show per collection.
 * @returns {JSX.Element} The public catalog component.
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

  const noMatches = filteredCollections.length === 0;
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
    <Card className="bg-background/55 border backdrop-blur">
      <PublicCatalogHeader
        query={query}
        onQueryChange={setQuery}
        filteredCount={filteredCollections.length}
        totalCount={totalCount}
        showTabs={showTabs}
        tab={tab}
        onTabChange={setTab}
      />

      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-background/40 rounded-xl border p-5"
              >
                <div className="space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="pt-2">
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-background/40 text-destructive rounded-xl border p-6 text-sm">
            Failed to load public catalog.
          </div>
        ) : noMatches ? (
          <div className="bg-background/40 text-muted-foreground rounded-xl border p-6 text-sm">
            {query
              ? "No public lists match your search yet."
              : "Public collections will appear here as soon as members share them."}
          </div>
        ) : (
          <Stagger className="grid gap-4 md:grid-cols-2" itemClassName="h-full">
            {filteredCollections.map((collection) => (
              <PublicCatalogCard key={collection.id} collection={collection} />
            ))}
          </Stagger>
        )}

        {showLoadMore ? (
          <div className="flex flex-col items-center gap-3">
            <div ref={sentinelRef} className="h-1 w-full" />

            {!autoLoadMore ? (
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading more..." : "Load more"}
              </Button>
            ) : null}

            {autoLoadMore && isFetchingNextPage ? (
              <div className="text-muted-foreground text-sm">
                Loading more...
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
