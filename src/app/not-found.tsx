import Link from "next/link";

import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";

/**
 * The 404 Not Found page.
 * Displayed when a user navigates to a non-existent route.
 *
 * @returns {JSX.Element} The not found page component.
 */
export default function NotFound() {
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
            <Heading size="7">Page not found</Heading>
            <Text size="3" color="gray">
              We couldn&apos;t locate the page you requested. It might have been
              moved or removed.
            </Text>
            <Button size="3" variant="soft" color="gray" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </Flex>
        </Card>
      </Container>
    </Box>
  );
}
