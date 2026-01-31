import Link from "next/link";

import { Analytics } from "@vercel/analytics/next";

import { FeaturedCollectionCard } from "@/app/_components/featured-collection-card";
import { HeroBadges } from "@/app/_components/hero-badges";
import { StudioShell } from "@/app/_components/studio-shell";

import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { auth, authDiagnostics } from "@/server/auth";
import { api } from "@/trpc/server";
import type { RouterOutputs } from "@/trpc/react";
import { LazyPublicCatalog } from "@/app/_components/lazy-public-catalog";

type PublicCatalogPage = RouterOutputs["collection"]["getPublicCatalog"];
type PublicCatalogCollection = PublicCatalogPage["items"][number];
type PublicLink = PublicCatalogCollection["topLinks"][number];

const PUBLIC_CATALOG_PAGE_SIZE = 12;
const PUBLIC_CATALOG_LINK_LIMIT = 10;

export const revalidate = 60;

export default async function Home() {
  const sessionPromise = auth();
  const featuredCollectionPromise = api.collection.getPublic();

  const [session, featuredCollection] = await Promise.all([
    sessionPromise,
    featuredCollectionPromise,
  ]);

  const hasEnabledProvider = authDiagnostics.hasEnabledProvider;

  const primaryCtaHref = session ? "/dashboard" : "/signin";
  const primaryCtaLabel = session
    ? "Open your dashboard"
    : hasEnabledProvider
      ? "Start collecting"
      : "Review sign-in setup";

  const secondaryCtaHref = session ? "/api/auth/signout" : "/signin";
  const secondaryCtaLabel = session
    ? "Sign out"
    : hasEnabledProvider
      ? "Sign in"
      : "Sign-in disabled";

  const publicLinks: PublicLink[] = featuredCollection?.topLinks ?? [];

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <Analytics />
      <StudioShell>
        <div className="grid gap-10">
          <section className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <Reveal>
                <HeroBadges />
              </Reveal>

              <Reveal delayMs={60}>
                <div className="space-y-4">
                  <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                    A creative studio for your internet rabbit holes.
                  </h1>
                  <p className="text-muted-foreground max-w-xl text-base text-pretty sm:text-lg">
                    Capture the best corners of the web, remix them into
                    collections, and share your curated trails with anyone.
                  </p>
                </div>
              </Reveal>

              <Reveal delayMs={120}>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href={primaryCtaHref}>{primaryCtaLabel}</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
                  </Button>
                </div>
              </Reveal>

              {!hasEnabledProvider ? (
                <Reveal delayMs={160}>
                  <p className="text-muted-foreground text-sm">
                    Sign-in is disabled while mock credentials are configured.
                  </p>
                </Reveal>
              ) : null}

              {session?.user?.name ? (
                <Reveal delayMs={160}>
                  <p className="text-muted-foreground text-sm">
                    Signed in as {session.user.name}.
                  </p>
                </Reveal>
              ) : null}

              <Stagger className="grid gap-3 sm:grid-cols-3" baseDelayMs={80}>
                <Card className="bg-background/55 border backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Build</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    One place for research, playlists, docs, and inspiration.
                  </CardContent>
                </Card>
                <Card className="bg-background/55 border backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Arrange</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    Drag to reorder. Keep the flow. No extra ceremony.
                  </CardContent>
                </Card>
                <Card className="bg-background/55 border backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Share</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    Flip a switch and publish collections instantly.
                  </CardContent>
                </Card>
              </Stagger>
            </div>

            <Reveal delayMs={80}>
              <FeaturedCollectionCard
                name={featuredCollection?.name ?? "No public collection yet"}
                description={
                  featuredCollection?.description ??
                  "Check back soon for curated resources from the community."
                }
                topLinks={publicLinks}
                ctaHref={primaryCtaHref}
                ctaLabel={session ? "Continue" : "Create your first list"}
              />
            </Reveal>
          </section>

          <section className="grid gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Public collections
                </h2>
                <p className="text-muted-foreground text-sm">
                  Explore what others are publishing right now.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="secondary">
                  <Link href="/catalog">Open full catalog</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={primaryCtaHref}>Start a collection</Link>
                </Button>
              </div>
            </div>

            <Reveal delayMs={60}>
              <LazyPublicCatalog
                pageSize={PUBLIC_CATALOG_PAGE_SIZE}
                linkLimit={PUBLIC_CATALOG_LINK_LIMIT}
              />
            </Reveal>
          </section>
        </div>
      </StudioShell>
    </div>
  );
}
