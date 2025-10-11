"use client";

import Link from "next/link";

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

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorPageProps) {
  return (
    <Box className="min-h-[60vh] bg-[radial-gradient(circle_at_top,_#1a1c2c,_#050508)] text-white">
      <Container
        size="2"
        px={{ initial: "5", sm: "6" }}
        py={{ initial: "8", sm: "10" }}
      >
        <Card
          variant="surface"
          size="4"
          className="mx-auto w-full max-w-xl border border-white/10 bg-white/5 backdrop-blur"
        >
          <Flex direction="column" gap="5" align="start">
            <Heading size="7">Something went wrong</Heading>
            <Text size="3" color="gray">
              {error.message ||
                "An unexpected error occurred. Try again or head back home."}
            </Text>
            <Flex gap="3" wrap="wrap">
              <Button size="3" onClick={reset} variant="solid">
                Try again
              </Button>
              <Button size="3" variant="soft" color="gray" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </Flex>
            {error.digest && (
              <>
                <Separator className="border-white/10" />
                <Text size="2" color="gray">
                  Error reference: {error.digest}
                </Text>
              </>
            )}
          </Flex>
        </Card>
      </Container>
    </Box>
  );
}
