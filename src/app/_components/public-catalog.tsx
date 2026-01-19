"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import Link from "next/link";

import { ExternalLinkIcon, SearchIcon } from "lucide-react";

import { api, type RouterOutputs } from "@/trpc/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Stagger } from "@/components/motion/stagger";

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
  const trimmedQuery = query.trim().toLowerCase();

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
    const deduped = new Map<string, PublicCatalogCollection>();
    merged.forEach((collection) => {
      if (!deduped.has(collection.id)) {
        deduped.set(collection.id, collection);
      }
    });
    return Array.from(deduped.values());
  }, [pages]);

  const sortedCollections = useMemo(() => {
    const list = [...collections];
    list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return tab === "new" ? [...list].reverse() : list;
  }, [collections, tab]);

  const filteredCollections = useMemo(() => {
    if (!trimmedQuery) return sortedCollections;
    return sortedCollections.filter((collection) => {
      const haystack = [collection.name, collection.description ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(trimmedQuery);
    });
  }, [sortedCollections, trimmedQuery]);

  const noMatches = filteredCollections.length === 0;
  const showLoadMore = Boolean(hasNextPage);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleLoadMore = async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    await fetchNextPage();
  };

  useEffect(() => {
    if (!autoLoadMore) return;
    if (!hasNextPage) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        void handleLoadMore();
      },
      {
        root: null,
        rootMargin: "400px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [autoLoadMore, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Card className="bg-background/55 border backdrop-blur">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">All current public lists</CardTitle>
            <CardDescription>
              Browse collections published by the community.
            </CardDescription>
          </div>

          <div className="relative w-full md:w-80">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={handleQueryChange}
              placeholder="Search by name or description"
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {filteredCollections.length} of {totalCount} public lists
            {trimmedQuery ? " (filtered)" : ""}.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {showTabs ? (
              <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
                <TabsList>
                  <TabsTrigger value="updated">Recently updated</TabsTrigger>
                  <TabsTrigger value="new">New</TabsTrigger>
                </TabsList>
              </Tabs>
            ) : null}

            {trimmedQuery ? (
              <Badge variant="secondary">Filtered</Badge>
            ) : (
              <Badge variant="secondary">Live catalog</Badge>
            )}
          </div>
        </div>
      </CardHeader>

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
              <Card
                key={collection.id}
                className="bg-background/45 h-full overflow-hidden border backdrop-blur"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base leading-tight">
                        {collection.name}
                      </CardTitle>
                      {collection.description ? (
                        <CardDescription className="mt-1 line-clamp-2">
                          {collection.description}
                        </CardDescription>
                      ) : null}
                    </div>
                    <Badge className="shrink-0" variant="secondary">
                      Public
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Separator />

                  {collection.topLinks.length > 0 ? (
                    <div className="grid gap-2">
                      {collection.topLinks.map((link) => (
                        <div
                          key={link.id}
                          className="bg-background/35 rounded-lg border p-3"
                        >
                          <div className="text-sm font-medium">{link.name}</div>
                          {link.comment ? (
                            <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                              {link.comment}
                            </div>
                          ) : null}
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-1 text-xs"
                          >
                            <span className="truncate">{link.url}</span>
                            <ExternalLinkIcon className="size-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-background/35 text-muted-foreground rounded-lg border p-4 text-sm">
                      Links will be added to this collection soon.
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/signin">Publish your own</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
