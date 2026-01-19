import Link from "next/link";

import { api, HydrateClient } from "@/trpc/server";
import { auth } from "@/server/auth";
import { CollectionCreateForm } from "@/app/_components/collection-create-form";
import { DashboardCollectionsManager } from "@/app/_components/dashboard-collections-manager";
import { createTypeGuard } from "@/lib/type-guards";
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
  order: number;
  _count?: { links?: number | null } | null;
};

const isCollectionSummary = createTypeGuard<CollectionSummary>([
  { name: "id", type: "string" },
  { name: "name", type: "string" },
  { name: "description", type: "string", optional: true, nullable: true },
  { name: "order", type: "number" },
  {
    name: "_count",
    type: "object",
    optional: true,
    nullable: true,
    nestedFields: [
      { name: "links", type: "number", optional: true, nullable: true },
    ],
  },
]);

const gradientBackground =
  "min-h-screen bg-[radial-gradient(circle_at_top,_#101220,_#040406)] text-white";

/**
 * The user dashboard page.
 * Displays the list of user collections and allows creating new ones.
 * Requires authentication.
 *
 * @returns {Promise<JSX.Element>} The dashboard component.
 */
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
                <DashboardCollectionsManager
                  initialCollections={collections.map((collection) => ({
                    id: collection.id,
                    name: collection.name,
                    description: collection.description,
                    order: collection.order,
                    linkCount: collection._count?.links ?? 0,
                  }))}
                />
              </Flex>
            </Card>
          </Flex>
        </Container>
      </Box>
    </HydrateClient>
  );
}
