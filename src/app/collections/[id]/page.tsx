import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeftIcon, LibraryBigIcon } from "lucide-react";

import { StudioShell } from "@/app/_components/studio-shell";
import { CollectionLinksManager } from "@/app/_components/collection-links-manager";
import { LinkCreateForm } from "@/app/_components/link-create-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { auth } from "@/server/auth";
import { createTypeGuard } from "@/lib/type-guards";
import { api, HydrateClient } from "@/trpc/server";

type CollectionLink = {
  id: string;
  name: string;
  url: string;
  comment: string | null;
  order: number;
};

type CollectionWithLinks = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  links: CollectionLink[];
};

const isCollectionWithLinks = createTypeGuard<CollectionWithLinks>([
  { name: "id", type: "string" },
  { name: "name", type: "string" },
  { name: "description", type: "string", optional: true, nullable: true },
  { name: "isPublic", type: "boolean" },
  {
    name: "links",
    type: "array",
    nestedFields: [
      { name: "id", type: "string" },
      { name: "name", type: "string" },
      { name: "url", type: "string" },
      { name: "comment", type: "string", optional: true, nullable: true },
      { name: "order", type: "number" },
    ],
  },
]);

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * The collection detail page.
 * Displays links within a specific collection and allows adding/managing links.
 *
 * @param {PageProps} props - The page properties.
 * @param {Promise<{ id: string }>} props.params - The route parameters containing the collection ID.
 * @returns {Promise<JSX.Element>} The collection page component.
 */
export default async function CollectionPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)]">
        <StudioShell>
          <div className="mx-auto max-w-2xl">
            <Card className="bg-background/55 border backdrop-blur">
              <CardHeader>
                <CardTitle>Collection</CardTitle>
                <CardDescription>
                  Sign in to view and edit this collection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="lg" className="w-full">
                  <Link href="/api/auth/signin">Sign in</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </StudioShell>
      </div>
    );
  }

  const collectionResult: unknown = await api.collection.getById({ id });
  if (!collectionResult) notFound();
  if (!isCollectionWithLinks(collectionResult)) {
    throw new Error("Unexpected collection payload");
  }

  const collection = {
    ...collectionResult,
    links: [...collectionResult.links].sort((a, b) => a.order - b.order),
  } satisfies CollectionWithLinks;

  return (
    <HydrateClient>
      <div className="min-h-[calc(100vh-3.5rem)]">
        <StudioShell>
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="bg-background/55 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur">
                  <LibraryBigIcon className="size-4" />
                  Collection
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-balance">
                  {collection.name}
                </h1>
                {collection.description ? (
                  <p className="text-muted-foreground text-sm">
                    {collection.description}
                  </p>
                ) : null}
              </div>

              <Button asChild variant="ghost" className="-ml-2 w-fit">
                <Link href="/dashboard">
                  <ArrowLeftIcon className="size-4" />
                  Back to dashboard
                </Link>
              </Button>
            </div>

            <LinkCreateForm collectionId={collection.id} />

            <Card className="bg-background/55 border backdrop-blur">
              <CardHeader>
                <CardTitle className="text-base">Links</CardTitle>
                <CardDescription>
                  Drag to reorder. Use the visibility switch to publish.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CollectionLinksManager
                  collectionId={collection.id}
                  initialLinks={collection.links}
                  initialIsPublic={collection.isPublic}
                />
              </CardContent>
            </Card>
          </div>
        </StudioShell>
      </div>
    </HydrateClient>
  );
}
