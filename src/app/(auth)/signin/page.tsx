import Link from "next/link";

import {
  Box,
  Button,
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

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[]>>;
};

const providerButtonLabel = (label: string) => `Continue with ${label}`;

const normalizeParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const {
    enabledProviders,
    disabledProviders,
    hasEnabledProvider,
  }: AuthDiagnostics = authDiagnostics;

  const params = searchParams ? await searchParams : {};
  const callbackUrl = normalizeParam(params.callbackUrl) ?? "/";
  const errorCode = normalizeParam(params.error);

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

              {errorCode && (
                <Card
                  size="2"
                  variant="classic"
                  className="border border-red-500/40 bg-red-500/10 text-left"
                >
                  <Heading size="3">Sign-in failed</Heading>
                  <Text color="gray" size="2" mt="2">
                    The provider returned an error ({errorCode}). Try again or contact support if
                    the problem persists.
                  </Text>
                </Card>
              )}

              {hasEnabledProvider ? (
                <Flex direction="column" gap="3">
                  {enabledProviders.map((provider) => (
                    <form
                      key={provider.id}
                      action={`/api/auth/signin/${provider.id}`}
                      method="post"
                    >
                      <input type="hidden" name="callbackUrl" value={callbackUrl} />
                      <Button
                        type="submit"
                        size="3"
                        className="w-full justify-start"
                        variant="solid"
                      >
                        {providerButtonLabel(provider.label)}
                      </Button>
                    </form>
                  ))}
                </Flex>
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
