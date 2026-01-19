import Link from "next/link";

import { ArrowLeftIcon, RefreshCwIcon, ShieldAlertIcon } from "lucide-react";

import { StudioShell } from "@/app/_components/studio-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const ERROR_DESCRIPTIONS: Record<
  string,
  { title: string; description: string }
> = {
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
    description:
      "We were unable to complete the sign-in callback. Please try again.",
  },
  Configuration: {
    title: "Configuration error",
    description:
      "The authentication configuration is incomplete. Update your OAuth credentials.",
  },
  CredentialsSignin: {
    title: "Sign-in failed",
    description:
      "The provided credentials are invalid. Double-check and try again.",
  },
  EmailCreateAccount: {
    title: "Email link issue",
    description:
      "We could not create your account from the email link. Request a new link and retry.",
  },
  EmailSignin: {
    title: "Email sign-in issue",
    description:
      "The email sign-in link is invalid or expired. Request a new link and retry.",
  },
  OAuthAccountNotLinked: {
    title: "Account not linked",
    description:
      "This email is already linked to another provider. Sign in with the originally used provider.",
  },
  OAuthCallback: {
    title: "OAuth callback",
    description:
      "The OAuth provider returned an error. Retry the sign-in process.",
  },
  OAuthCreateAccount: {
    title: "Account creation blocked",
    description:
      "We could not create an account with that provider. Contact support if this persists.",
  },
  OAuthSignin: {
    title: "OAuth sign-in issue",
    description:
      "We were unable to reach the OAuth provider. Try again or use another provider.",
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
      description:
        "Something went wrong while signing you in. Try again in a moment.",
    };
  }

  const normalized = ERROR_DESCRIPTIONS[code];
  if (normalized) {
    return normalized;
  }

  return {
    title: "Authentication error",
    description:
      "We hit an unexpected issue. Sign in again or return to the welcome page.",
  };
};

/**
 * The authentication error page.
 * Displays user-friendly error messages based on the error code from NextAuth.
 *
 * @param {object} props - The page properties.
 * @param {Promise<{ error?: string }>} props.searchParams - Query parameters containing the error code.
 * @returns {Promise<JSX.Element>} The auth error page component.
 */
export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  const copy = resolveErrorCopy(resolvedParams?.error);

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <StudioShell>
        <div className="mx-auto max-w-2xl space-y-4">
          <Button asChild variant="ghost" className="-ml-2 w-fit">
            <Link href="/">
              <ArrowLeftIcon className="size-4" />
              Back to home
            </Link>
          </Button>

          <Card className="bg-background/55 border backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlertIcon className="text-muted-foreground size-5" />
                {copy.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                {copy.description}
              </p>

              <Separator />

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild>
                  <Link href="/signin">
                    <RefreshCwIcon className="size-4" />
                    Try signing in again
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/">Return home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </StudioShell>
    </div>
  );
}
