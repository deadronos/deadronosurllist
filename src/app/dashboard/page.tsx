import Link from "next/link";

import { api, HydrateClient } from "@/trpc/server";
import { auth } from "@/server/auth";
import { CollectionCreateForm } from "@/app/_components/collection-create-form";
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";

type CollectionSummary = {
  id: string;
  name: string;
  description: string | null;
  _count?: { links?: number | null } | null;
};

const gradientBackground =
  "min-h-screen bg-[radial-gradient(circle_at_top,_#101220,_#040406)] text-white";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <Box className={gradientBackground}>
        <Container
          size="3"
          px={{ initial: "5", sm: "6" }}
          py={{ initial: "8", sm: "9" }}
        >
          <Flex direction="column" gap="6">
            <Heading size={{ initial: "7", sm: "8" }}>
              Your collections await.
            </Heading>
            <Text size="4" color="gray">
              Sign in to start curating links, manage private collections, and
              share resources with your team.
            </Text>
            <Card
              size="3"
              variant="surface"
              className="max-w-md border border-white/10 bg-white/5 backdrop-blur"
            >
              <Flex direction="column" gap="4">
                <Text size="2" color="gray">
                  Ready to begin?
                </Text>
                <Button size="3" asChild>
                  <Link href="/api/auth/signin">Sign in</Link>
                </Button>
                <Text size="2" color="gray">
                  Authentication keeps your collections private until you make
                  them public.
                </Text>
              </Flex>
            </Card>
          </Flex>
        </Container>
      </Box>
    );
  }

  const collectionsRaw: unknown = await api.collection.getAll();
  if (!Array.isArray(collectionsRaw)) {
    throw new Error("Unexpected collections payload");
  }
  const collectionsResult = collectionsRaw as unknown[];
  if (!collectionsResult.every(isCollectionSummary)) {
    throw new Error("Unexpected collections payload");
  }
  const collections = collectionsResult;
  const name = session.user.name ?? "there";

  return (
    <HydrateClient>
      <Box className={gradientBackground}>
        <Container
          size="3"
          px={{ initial: "5", sm: "6" }}
          py={{ initial: "8", sm: "9" }}
        >
          <Flex direction="column" gap="6">
            <Flex
              direction={{ initial: "column", md: "row" }}
              justify="between"
              align={{ initial: "start", md: "center" }}
              gap="4"
            >
              <Box>
                <Heading size={{ initial: "7", md: "8" }}>
                  Welcome back{", "}
                  {name}
                </Heading>
                <Text as="p" mt="2" size="4" color="gray">
                  Review your collections, create new lists, and keep your best
                  resources a click away.
                </Text>
              </Box>
              <Button variant="soft" color="gray" asChild>
                <Link href="/">Browse public lists</Link>
              </Button>
            </Flex>

            <CollectionCreateForm />

            <Card
              variant="surface"
              className="border border-white/10 bg-white/5 backdrop-blur"
            >
              <Flex direction="column" gap="4">
                <Flex
                  justify="between"
                  align={{ initial: "start", sm: "center" }}
                  direction={{ initial: "column", sm: "row" }}
                  gap="3"
                >
                  <Heading size="6">Your Collections</Heading>
                  <Text size="2" color="gray">
                    {collections.length}{" "}
                    {collections.length === 1 ? "collection" : "collections"}
                  </Text>
                </Flex>
                <Separator className="border-white/10" />
                <Flex direction="column" gap="3">
                  {collections.map((collection) => (
                    <Card
                      key={collection.id}
                      size="2"
                      variant="classic"
                      className="border-white/10 bg-black/40"
                    >
                      <Flex
                        direction={{ initial: "column", sm: "row" }}
                        align={{ initial: "start", sm: "center" }}
                        justify="between"
                        gap="3"
                      >
                        <Flex direction="column" gap="2">
                          <Heading as="h3" size="4">
                            <Link
                              href={`/collections/${collection.id}`}
                              className="text-white hover:underline"
                            >
                              {collection.name}
                            </Link>
                          </Heading>
                          {collection.description ? (
                            <Text size="2" color="gray">
                              {collection.description}
                            </Text>
                          ) : null}
                        </Flex>
                        <Flex
                          align={{ initial: "start", sm: "center" }}
                          gap="3"
                          direction={{ initial: "column", sm: "row" }}
                        >
                          <Text size="2" color="gray">
                            {(collection._count?.links ?? 0).toLocaleString()}{" "}
                            {collection._count?.links === 1 ? "link" : "links"}
                          </Text>
                          <Button size="2" variant="soft" asChild>
                            <Link href={`/collections/${collection.id}`}>
                              Open
                            </Link>
                          </Button>
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                  {collections.length === 0 ? (
                    <Card
                      size="2"
                      variant="surface"
                      className="border border-dashed border-white/20 bg-transparent"
                    >
                      <Flex direction="column" gap="2">
                        <Heading as="h3" size="4">
                          No collections yet
                        </Heading>
                        <Text size="2" color="gray">
                          Use the form above to create your first collection and
                          start saving links.
                        </Text>
                      </Flex>
                    </Card>
                  ) : null}
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </Container>
      </Box>
    </HydrateClient>
  );
}

function isCollectionSummary(value: unknown): value is CollectionSummary {
  if (!value || typeof value !== "object") return false;
  const candidate = value as {
    id?: unknown;
    name?: unknown;
    description?: unknown;
    _count?: unknown;
  };
  if (typeof candidate.id !== "string") return false;
  if (candidate.name !== undefined && typeof candidate.name !== "string") {
    return false;
  }
  if (
    candidate.description !== undefined &&
    candidate.description !== null &&
    typeof candidate.description !== "string"
  ) {
    return false;
  }
  if (
    candidate._count !== undefined &&
    candidate._count !== null &&
    typeof candidate._count !== "object"
  ) {
    return false;
  }
  if (candidate._count && typeof candidate._count === "object") {
    const links = (candidate._count as { links?: unknown }).links;
    if (links !== undefined && links !== null && typeof links !== "number") {
      return false;
    }
  }
  return true;
}
