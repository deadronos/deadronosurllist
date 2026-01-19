"use client";

import Link from "next/link";

import { BugIcon } from "lucide-react";

import { StudioShell } from "@/app/_components/studio-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * The global error boundary page.
 * Catches runtime errors in the application and displays a friendly message.
 *
 * @param {ErrorPageProps} props - Component properties.
 * @param {Error} props.error - The error object.
 * @param {Function} props.reset - Function to reset the error boundary.
 * @returns {JSX.Element} The error page component.
 */
export default function GlobalError({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <StudioShell>
        <div className="mx-auto max-w-2xl">
          <Card className="bg-background/55 border backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BugIcon className="text-muted-foreground size-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                {error.message ||
                  "An unexpected error occurred. Try again or head back home."}
              </p>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={reset}>Try again</Button>
                <Button asChild variant="secondary">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>

              {error.digest ? (
                <>
                  <Separator />
                  <div className="text-muted-foreground text-xs">
                    Error reference: {error.digest}
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </StudioShell>
    </div>
  );
}
