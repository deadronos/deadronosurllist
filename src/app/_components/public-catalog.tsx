"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { api, type RouterOutputs } from "@/trpc/react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
  Separator,
  Link as RadixLink,
} from "@radix-ui/themes";

type PublicCatalogPage = RouterOutputs["collection"]["getPublicCatalog"];
export type PublicCatalogCollection = PublicCatalogPage["items"][number];
export type PublicCatalogLink = PublicCatalogCollection["topLinks"][number];

interface PublicCatalogProps {
  initialPage: PublicCatalogPage;
  pageSize: number;
  linkLimit: number;
}

/**
 * Displays the public catalog of collections with search and pagination.
 * Supports infinite scrolling using `useInfiniteQuery`.
 *
 * @param {PublicCatalogProps} props - Component properties.
 * @param {PublicCatalogPage} props.initialPage - The initial page of data loaded from the server.
 * @param {number} props.pageSize - Number of items per page.
 * @param {number} props.linkLimit - Number of links to show per collection.
 * @returns {JSX.Element} The public catalog component.
 */
export function PublicCatalog({
  initialPage,
  pageSize,
  linkLimit,
}: PublicCatalogProps) {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim().toLowerCase();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.collection.getPublicCatalog.useInfiniteQuery(
      { limit: pageSize, linkLimit },
      {
        initialData: {
          pageParams: [undefined],
          pages: [initialPage],
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    );

  const initialPages = useMemo(() => [initialPage], [initialPage]);
  const pages = data?.pages ?? initialPages;
  const totalCount = pages[0]?.totalCount ?? initialPage.totalCount;

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

  const filteredCollections = useMemo(() => {
    if (!trimmedQuery) return collections;
    return collections.filter((collection) => {
      const haystack = [collection.name, collection.description ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(trimmedQuery);
    });
  }, [collections, trimmedQuery]);

  const noMatches = filteredCollections.length === 0;
  const showLoadMore = Boolean(hasNextPage);

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleLoadMore = async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    await fetchNextPage();
  };

  return (
    <Card
      variant="surface"
      className="border border-white/10 bg-white/5 backdrop-blur"
    >
      <Flex direction="column" gap="5">
        <Flex
          align={{ initial: "stretch", md: "center" }}
          direction={{ initial: "column", md: "row" }}
          justify="between"
          gap="4"
        >
          <Heading size="6">All current public lists</Heading>
          <TextField.Root
            size="3"
            className="w-full md:w-80"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search by name or description"
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>
        </Flex>

        <Text size="2" color="gray">
          Showing {filteredCollections.length} of {totalCount} public lists
          {trimmedQuery ? " (filtered)" : ""}.
        </Text>

        {noMatches ? (
          <Text size="2" color="gray">
            {query
              ? "No public lists match your search yet."
              : "Public collections will appear here as soon as members share them."}
          </Text>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredCollections.map((collection) => (
              <Card
                key={collection.id}
                size="2"
                variant="classic"
                className="border-white/10 bg-black/40"
              >
                <Flex direction="column" gap="3">
                  <Heading as="h3" size="4">
                    {collection.name}
                  </Heading>
                  {collection.description ? (
                    <Text size="2" color="gray">
                      {collection.description}
                    </Text>
                  ) : null}
                  <Separator className="border-white/10" />
                  <Flex direction="column" gap="3">
                    {collection.topLinks.length > 0 ? (
                      collection.topLinks.map((link) => (
                        <Card
                          key={link.id}
                          size="1"
                          variant="surface"
                          className="border-white/5 bg-transparent"
                        >
                          <Flex direction="column" gap="1" align="start">
                            <Text weight="medium">{link.name}</Text>
                            {link.comment ? (
                              <Text size="1" color="gray">
                                {link.comment}
                              </Text>
                            ) : null}
                            <RadixLink
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              color="iris"
                              underline="always"
                              size="1"
                              weight="medium"
                            >
                              {link.url}
                            </RadixLink>
                          </Flex>
                        </Card>
                      ))
                    ) : (
                      <Text size="2" color="gray">
                        Links will be added to this collection soon.
                      </Text>
                    )}
                  </Flex>
                </Flex>
              </Card>
            ))}
          </div>
        )}

        {showLoadMore ? (
          <Flex justify="center">
            <Button
              variant="soft"
              color="iris"
              onClick={handleLoadMore}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading more..." : "Load more"}
            </Button>
          </Flex>
        ) : null}
      </Flex>
    </Card>
  );
}
