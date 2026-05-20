import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ExternalLinkIcon, LibraryBigIcon } from "lucide-react";

import { StudioShell } from "@/app/_components/studio-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Stagger } from "@/components/motion/stagger";

import { api, HydrateClient } from "@/trpc/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const collection = await api.collection.getPublicById({ id });
  if (!collection) {
    return {
      title: "Collection Not Found | Deadronos URL List",
    };
  }
  return {
    title: `${collection.name} | Deadronos URL List`,
    description: collection.description ?? "Explore this curated list of links.",
  };
}

export default async function PublicCollectionPage({ params }: PageProps) {
  const { id } = await params;

  const collection = await api.collection.getPublicById({ id });
  if (!collection) {
    notFound();
  }

  return (
    <HydrateClient>
      <div className="min-h-[calc(100vh-3.5rem)]">
        <StudioShell>
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="bg-background/55 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur">
                  <LibraryBigIcon className="size-4" />
                  Public Collection
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  {collection.name}
                </h1>
                {collection.description ? (
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {collection.description}
                  </p>
                ) : null}
              </div>

              <Button asChild variant="ghost" className="-ml-2 sm:ml-0 shrink-0">
                <Link href="/catalog">
                  <ArrowLeftIcon className="size-4" />
                  Back to catalog
                </Link>
              </Button>
            </div>

            <Card className="bg-background/55 border backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Links</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                    {collection.links.length}{" "}
                    {collection.links.length === 1 ? "link" : "links"}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                {collection.links.length > 0 ? (
                  <Stagger className="grid gap-3" itemClassName="h-full">
                    {collection.links.map((link) => (
                      <div
                        key={link.id}
                        className="bg-background/35 hover:bg-background/50 transition-all duration-200 rounded-lg border p-4 group"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
                              {link.name}
                            </h3>
                          </div>
                          {link.comment ? (
                            <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                              {link.comment}
                            </p>
                          ) : null}
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary mt-1 inline-flex items-center gap-1.5 text-sm transition-colors w-fit max-w-full"
                          >
                            <span className="truncate">{link.url}</span>
                            <ExternalLinkIcon className="size-3.5 shrink-0" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </Stagger>
                ) : (
                  <div className="bg-background/35 text-muted-foreground rounded-lg border p-6 text-center text-sm">
                    No links have been added to this collection yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </StudioShell>
      </div>
    </HydrateClient>
  );
}
