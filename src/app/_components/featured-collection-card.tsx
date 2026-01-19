import Link from "next/link";

import { ExternalLinkIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type FeaturedLink = {
  id: string;
  name: string;
  url: string;
  comment: string | null;
};

type FeaturedCollectionCardProps = {
  name: string;
  description: string | null;
  topLinks: FeaturedLink[];
  ctaHref: string;
  ctaLabel: string;
};

export function FeaturedCollectionCard({
  name,
  description,
  topLinks,
  ctaHref,
  ctaLabel,
}: FeaturedCollectionCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(262_85%_60%_/_0.12),transparent_40%),radial-gradient(circle_at_90%_30%,hsl(172_80%_45%_/_0.14),transparent_45%)]" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <CardDescription>Featured collection</CardDescription>
            <CardTitle className="mt-1 text-lg sm:text-xl">{name}</CardTitle>
          </div>
          <Badge className="shrink-0" variant="secondary">
            Public
          </Badge>
        </div>
        {description ? (
          <CardDescription className="mt-2">{description}</CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="relative">
        <Separator className="mb-4" />
        <div className="grid gap-3">
          {topLinks.length > 0 ? (
            topLinks.map((link) => (
              <div
                key={link.id}
                className="bg-background/40 rounded-lg border p-3 backdrop-blur"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {link.name}
                    </div>
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
                </div>
              </div>
            ))
          ) : (
            <div className="bg-background/40 text-muted-foreground rounded-lg border p-4 text-sm">
              We are preparing hand-picked recommendations. Stay tuned!
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="relative">
        <Button asChild className="w-full">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
