import Link from "next/link";
import * as dotenvx from '@dotenvx/dotenvx';

import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Link as RadixLink,
  Separator,
  Text,
} from "@radix-ui/themes";

import { auth, authDiagnostics } from "@/server/auth";
import { api } from "@/trpc/server";

type PublicLink = {
  id: string;
  name: string;
  url: string;
  comment: string | null;
};

type PublicCollection = {
  id: string;
  name: string;
  description: string | null;
  links: PublicLink[];
};

export default async function Home() {
  const [session, publicCollectionResult] = await Promise.all([
    auth(),
    api.collection.getPublic(),
  ]);

  const publicCollection = isPublicCollection(publicCollectionResult)
    ? publicCollectionResult
    : null;

  const hasEnabledProvider = authDiagnostics.hasEnabledProvider;
  const primaryCtaHref = session ? "/dashboard" : "/signin";
  const primaryCtaLabel = session
    ? "Go to your dashboard"
    : hasEnabledProvider
      ? "Sign in to start collecting"
      : "Review sign-in setup";
  const authHref = session ? "/api/auth/signout" : "/signin";
  const authLabel = session
    ? "Sign out"
    : hasEnabledProvider
      ? "Sign in"
      : "Sign-in disabled";
  const publicLinks: PublicLink[] = publicCollection?.links ?? [];

  return (
    <Box className="min-h-screen bg-[radial-gradient(circle_at_top,_#101220,_#040406)] text-white">
      <Container
        size="3"
        px={{ initial: "5", sm: "6" }}
        py={{ initial: "8", sm: "9" }}
      >
        <Flex direction="column" gap="7">
          <Flex
            align={{ initial: "start", md: "center" }}
            direction={{ initial: "column", md: "row" }}
            justify="between"
            gap="6"
          >
            <Box maxWidth={{ initial: "100%", md: "480px" }}>
              <Heading size={{ initial: "8", md: "9" }}>
                Collect, share, and revisit the web.
              </Heading>
              <Text as="p" mt="3" size="4" color="gray">
                Build living collections of links for your team or community.
                Discover curated resources even before you sign in.
              </Text>
              <Flex mt="6" gap="3" wrap="wrap">
                <Button size="3" asChild>
                  <Link href={primaryCtaHref}>{primaryCtaLabel}</Link>
                </Button>
                <Button size="3" variant="soft" color="gray" asChild>
                  <Link href={authHref}>{authLabel}</Link>
                </Button>
              </Flex>
              {!hasEnabledProvider && (
                <Text as="p" mt="3" size="2" color="gray">
                  Sign-in is disabled while mock credentials are configured. Update your OAuth
                  secrets to enable authentication.
                </Text>
              )}
              {session?.user?.name && (
                <Text as="p" mt="3" size="2" color="gray">
                  Signed in as {session.user.name}.
                </Text>
              )}
            </Box>
            <Card
              size="3"
              variant="surface"
              className="w-full max-w-md border border-white/10 bg-white/5 backdrop-blur"
            >
              <Flex direction="column" gap="3">
                <Text size="2" color="gray">
                  Featured collection
                </Text>
                <Heading size="5">
                  {publicCollection?.name ?? "No public collection yet"}
                </Heading>
                <Text size="3" color="gray">
                  {publicCollection?.description ??
                    "Check back soon for curated resources from the Deadronos community."}
                </Text>
                <Separator className="border-white/10" />
                <Flex direction="column" gap="3">
                  {publicLinks.length > 0 ? (
                    publicLinks.map((link) => (
                      <Card
                        key={link.id}
                        size="2"
                        variant="classic"
                        className="border-white/10 bg-black/40"
                      >
                        <Flex
                          direction="column"
                          gap="2"
                          align="start"
                          justify="between"
                        >
                          <Heading as="h3" size="3">
                            {link.name}
                          </Heading>
                          {link.comment && (
                            <Text size="2" color="gray">
                              {link.comment}
                            </Text>
                          )}
                          <RadixLink
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="iris"
                            underline="always"
                            weight="medium"
                          >
                            {link.url}
                          </RadixLink>
                        </Flex>
                      </Card>
                    ))
                  ) : (
                    <Text size="2" color="gray">
                      We are preparing hand-picked recommendations. Stay tuned!
                    </Text>
                  )}
                </Flex>
              </Flex>
            </Card>
          </Flex>

          <Card
            variant="surface"
            className="border border-white/10 bg-white/5 backdrop-blur"
          >
            <Flex
              align={{ initial: "stretch", md: "center" }}
              direction={{ initial: "column", md: "row" }}
              justify="between"
              gap="4"
            >
              <Box>
                <Heading size="6">Why Deadronos URL List?</Heading>
                <Text as="p" mt="2" size="3" color="gray">
                  Organize your research, share playlists of knowledge, and keep
                  every link at your fingertips.
                </Text>
              </Box>
              <Button size="3" variant="outline" asChild>
                <Link href={primaryCtaHref}>Start your first collection</Link>
              </Button>
            </Flex>
          </Card>
        </Flex>
      </Container>
      <Text>Hello {dotenvx.get('HELLO')}</Text>
    </Box>
  );
}

function isPublicCollection(value: unknown): value is PublicCollection {
  if (!value || typeof value !== "object") return false;
  const candidate = value as {
    id?: unknown;
    name?: unknown;
    description?: unknown;
    links?: unknown;
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
  if (!Array.isArray(candidate.links)) return false;
  return candidate.links.every((link) => {
    if (!link || typeof link !== "object") return false;
    const linkCandidate = link as {
      id?: unknown;
      name?: unknown;
      url?: unknown;
      comment?: unknown;
    };
    return (
      typeof linkCandidate.id === "string" &&
      typeof linkCandidate.name === "string" &&
      typeof linkCandidate.url === "string" &&
      (linkCandidate.comment === null ||
        linkCandidate.comment === undefined ||
        typeof linkCandidate.comment === "string")
    );
  });
}
