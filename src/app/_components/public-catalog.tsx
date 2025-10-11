"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
  Card,
  Flex,
  Heading,
  Text,
  TextField,
  Separator,
  Link as RadixLink,
} from "@radix-ui/themes";

export type PublicCatalogLink = {
  id: string;
  name: string;
  url: string;
  comment: string | null;
  order: number;
};

export type PublicCatalogCollection = {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
  links: PublicCatalogLink[];
};

interface PublicCatalogProps {
  collections: PublicCatalogCollection[];
}

export function PublicCatalog({ collections }: PublicCatalogProps) {
  const [query, setQuery] = useState("");
  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const filteredCollections = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) return collections;
    return collections.filter((collection) => {
      const haystack = [
        collection.name,
        collection.description ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(trimmedQuery);
    });
  }, [collections, query]);

  const noMatches = filteredCollections.length === 0;

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
                    {collection.links.length > 0 ? (
                      collection.links.map((link) => (
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
      </Flex>
    </Card>
  );
}
