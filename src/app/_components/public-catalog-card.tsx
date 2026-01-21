import Link from "next/link";

import { ExternalLinkIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type { PublicCatalogCollection } from "./public-catalog";

type PublicCatalogCardProps = {
  collection: PublicCatalogCollection;
};

export function PublicCatalogCard({ collection }: PublicCatalogCardProps) {
  return (
    <Card
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
  );
}
