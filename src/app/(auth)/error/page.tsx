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
import { ArrowLeftIcon, ReloadIcon } from "@radix-ui/react-icons";

const ERROR_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  AuthUnavailable: {
    title: "Sign-in disabled",
    description:
      "Sign-in is turned off in this environment. Configure valid OAuth credentials to re-enable it.",
  },
  AccessDenied: {
    title: "Access denied",
    description: "You do not have permission to sign in with that account.",
  },
  Callback: {
    title: "Callback error",
    description: "We were unable to complete the sign-in callback. Please try again.",
  },
  Configuration: {
    title: "Configuration error",
    description: "The authentication configuration is incomplete. Update your OAuth credentials.",
  },
  CredentialsSignin: {
    title: "Sign-in failed",
    description: "The provided credentials are invalid. Double-check and try again.",
  },
  EmailCreateAccount: {
    title: "Email link issue",
    description: "We could not create your account from the email link. Request a new link and retry.",
  },
  EmailSignin: {
    title: "Email sign-in issue",
    description: "The email sign-in link is invalid or expired. Request a new link and retry.",
  },
  OAuthAccountNotLinked: {
    title: "Account not linked",
    description:
      "This email is already linked to another provider. Sign in with the originally used provider.",
  },
  OAuthCallback: {
    title: "OAuth callback",
    description: "The OAuth provider returned an error. Retry the sign-in process.",
  },
  OAuthCreateAccount: {
    title: "Account creation blocked",
    description: "We could not create an account with that provider. Contact support if this persists.",
  },
  OAuthSignin: {
    title: "OAuth sign-in issue",
    description: "We were unable to reach the OAuth provider. Try again or use another provider.",
  },
  DatabaseUnavailable: {
    title: "Database unavailable",
    description:
      "We could not reach the database required for sign-in. Confirm your DATABASE_URL is set with a postgres-compatible connection string.",
  },
  SessionRequired: {
    title: "Session expired",
    description: "Your session ended. Sign in again to continue.",
  },
  Signin: {
    title: "Sign-in failed",
    description: "We could not complete the sign-in request. Please try again.",
  },
  Verification: {
    title: "Verification error",
    description: "We were unable to verify your request. Retry the action.",
  },
};

const resolveErrorCopy = (code?: string) => {
  if (!code) {
    return {
      title: "Authentication error",
      description: "Something went wrong while signing you in. Try again in a moment.",
    };
  }

  const normalized = ERROR_DESCRIPTIONS[code];
  if (normalized) {
    return normalized;
  }

  return {
    title: "Authentication error",
    description: "We hit an unexpected issue. Sign in again or return to the welcome page.",
  };
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  const copy = resolveErrorCopy(resolvedParams?.error);

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
              <Heading size="7">{copy.title}</Heading>
              <Text color="gray" size="3">
                {copy.description}
              </Text>
              <Separator className="border-white/10" />
              <Flex gap="4" wrap="wrap">
                <Button asChild size="3" variant="solid">
                  <Link href="/signin">
                    <ReloadIcon className="mr-2" />
                    Try signing in again
                  </Link>
                </Button>
                <Button asChild size="3" variant="surface" color="gray">
                  <Link href="/">
                    <ArrowLeftIcon className="mr-2" />
                    Return home
                  </Link>
                </Button>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Container>
    </Box>
  );
}
