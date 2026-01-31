"use client";

import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Stagger } from "@/components/motion/stagger";

import { PublicCatalogCard } from "../public-catalog-card";
import { PublicCatalogHeader } from "../public-catalog-header";
import type { PublicCatalogCollection } from "../public-catalog";

export interface PublicCatalogViewProps {
  // State
  query: string;
  onQueryChange: (query: string) => void;
  sortKey: "updated" | "newest" | "name-asc" | "name-desc" | "links-desc";
  sortLabel: string;
  sortOptions: Array<{ key: string; label: string }>;
  onSortKeyChange: (
    key: "updated" | "newest" | "name-asc" | "name-desc" | "links-desc",
  ) => void;

  // Data
  filteredCollections: PublicCatalogCollection[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;

  // Config
  showSort: boolean;
  autoLoadMore: boolean;
  showLoadMore: boolean;

  // Actions
  onLoadMore: () => void;

  // Ref
  sentinelRef: RefObject<HTMLDivElement | null>;
}

/**
 * Presentational component for the public catalog.
 */
export function PublicCatalogView({
  query,
  onQueryChange,
  sortKey,
  sortLabel,
  sortOptions,
  onSortKeyChange,
  filteredCollections,
  totalCount,
  isLoading,
  isError,
  isFetchingNextPage,
  showSort,
  autoLoadMore,
  showLoadMore,
  onLoadMore,
  sentinelRef,
}: PublicCatalogViewProps) {
  const noMatches = filteredCollections.length === 0;

  return (
    <Card className="bg-background/55 border backdrop-blur">
      <PublicCatalogHeader
        query={query}
        onQueryChange={onQueryChange}
        filteredCount={filteredCollections.length}
        totalCount={totalCount}
        showSort={showSort}
        sortKey={sortKey}
        sortLabel={sortLabel}
        sortOptions={sortOptions}
        onSortKeyChange={onSortKeyChange}
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
                onClick={onLoadMore}
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
