import Link from "next/link";

import { FolderIcon, SparklesIcon } from "lucide-react";

import { StudioShell } from "@/app/_components/studio-shell";
import { CollectionCreateForm } from "@/app/_components/collection-create-form";
import { DashboardCollectionsManager } from "@/app/_components/dashboard-collections-manager";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { createTypeGuard } from "@/lib/type-guards";

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
      <div className="min-h-[calc(100vh-3.5rem)]">
        <StudioShell>
          <div className="mx-auto max-w-2xl">
            <Card className="bg-background/55 border backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Your collections await.
                </CardTitle>
                <CardDescription>
                  Sign in to curate links, manage private collections, and share
                  resources when you are ready.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild size="lg" className="w-full">
                  <Link href="/api/auth/signin">Sign in</Link>
                </Button>
                <div className="text-muted-foreground text-sm">
                  Authentication keeps your collections private until you make
                  them public.
                </div>
              </CardContent>
            </Card>
          </div>
        </StudioShell>
      </div>
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
      <div className="min-h-[calc(100vh-3.5rem)]">
        <StudioShell>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <div className="bg-background/55 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur">
                  <SparklesIcon className="size-4" />
                  Studio dashboard
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  Welcome back, {name}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Build new lists, rearrange the flow, and keep your best
                  resources a click away.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link href="/">Browse public</Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard">New session</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-6">
                <CollectionCreateForm />

                <Card className="bg-background/55 border backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FolderIcon className="size-4" />
                      Quick stats
                    </CardTitle>
                    <CardDescription>
                      Keep an eye on your library.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-muted-foreground grid gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Collections</span>
                      <span className="text-foreground font-medium">
                        {collections.length.toLocaleString()}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span>Total links</span>
                      <span className="text-foreground font-medium">
                        {collections
                          .reduce(
                            (sum, collection) =>
                              sum + (collection._count?.links ?? 0),
                            0,
                          )
                          .toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-background/55 border backdrop-blur">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Your collections</CardTitle>
                      <CardDescription>
                        Drag to reorder (unless you are filtering).
                      </CardDescription>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {collections.length}{" "}
                      {collections.length === 1 ? "collection" : "collections"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <DashboardCollectionsManager
                    initialCollections={collections.map((collection) => ({
                      id: collection.id,
                      name: collection.name,
                      description: collection.description,
                      order: collection.order,
                      linkCount: collection._count?.links ?? 0,
                    }))}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </StudioShell>
      </div>
    </HydrateClient>
  );
}
