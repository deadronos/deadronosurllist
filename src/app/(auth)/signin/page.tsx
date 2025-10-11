import Link from "next/link";

import {
  Box,
  Card,
  Container,
  Flex,
  Heading,
  IconButton,
  Separator,
  Text,
} from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

import { authDiagnostics } from "@/server/auth";
import type { AuthDiagnostics } from "@/server/auth/provider-helpers";

import { SignInButtons } from "./sign-in-buttons";

export default function SignInPage() {
  const {
    enabledProviders,
    disabledProviders,
    hasEnabledProvider,
  }: AuthDiagnostics = authDiagnostics;

  return (
    <Box className="min-h-screen bg-[radial-gradient(circle_at_top,_#101220,_#040406)] text-white">
      <Container size="2" px={{ initial: "5", sm: "6" }} py={{ initial: "7", sm: "9" }}>
        <Flex direction="column" gap="6">
          <Flex align="center" gap="3">
            <IconButton asChild variant="surface" color="gray">
              <Link href="/">
                <ArrowLeftIcon />
              </Link>
            </IconButton>
            <Text size="2" color="gray">
              Back to welcome page
            </Text>
          </Flex>

          <Card
            size="4"
            variant="surface"
            className="w-full border border-white/10 bg-white/5 backdrop-blur"
          >
            <Flex direction="column" gap="5">
              <Heading size="7">Sign in to Deadronos URL List</Heading>
              <Text color="gray" size="3">
                Use one of the available providers below. If nothing is listed, configure OAuth
                credentials in your environment first.
              </Text>

              {hasEnabledProvider ? (
                <SignInButtons
                  providers={enabledProviders.map(({ id, label }) => ({ id, label }))}
                />
              ) : (
                <Card
                  size="3"
                  variant="classic"
                  className="border-dashed border-white/20 bg-black/40 text-left"
                >
                  <Heading size="4">Authentication is disabled</Heading>
                  <Text color="gray" size="3" mt="2">
                    We detected placeholder credentials in this environment. Update your
                    `.env.local` with real OAuth client IDs and secrets to enable sign-in. In the
                    meantime, you can continue exploring the public experience.
                  </Text>
                </Card>
              )}

              {disabledProviders.length > 0 && (
                <>
                  <Separator className="border-white/10" />
                  <Box>
                    <Heading size="4">Provider diagnostics</Heading>
                    <ul className="mt-2 text-sm text-gray-400 list-disc pl-5 space-y-1">
                      {disabledProviders.map((provider) => (
                        <li key={`disabled-${provider.id}`}>
                          {provider.label}: {provider.reason ?? "Configuration issue detected."}
                        </li>
                      ))}
                    </ul>
                  </Box>
                </>
              )}
            </Flex>
          </Card>
        </Flex>
      </Container>
    </Box>
  );
}

