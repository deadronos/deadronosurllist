import { Suspense } from "react";
import Link from "next/link";

import { ArrowLeftIcon, SparklesIcon } from "lucide-react";

import { StudioShell } from "@/app/_components/studio-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    <div className="min-h-[calc(100vh-3.5rem)]">
      <StudioShell>
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <Button asChild variant="ghost" className="-ml-2 w-fit">
              <Link href="/">
                <ArrowLeftIcon className="size-4" />
                Back to home
              </Link>
            </Button>

            <div className="space-y-3">
              <div className="bg-background/55 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur">
                <SparklesIcon className="size-4" />
                Studio mode: organize what you learn
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Sign in to start publishing collections.
              </h1>
              <p className="text-muted-foreground text-sm text-pretty sm:text-base">
                Your private lists stay private until you flip them public.
              </p>
            </div>

            <Card className="bg-background/55 border backdrop-blur">
              <CardHeader>
                <CardTitle className="text-base">What you get</CardTitle>
                <CardDescription>
                  A small set of powerful tools that stay out of your way.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground grid gap-3 text-sm">
                <div>Drag & drop ordering for collections and links.</div>
                <div>Bulk import to capture a whole research session fast.</div>
                <div>One-click public sharing when you are ready.</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-background/55 border backdrop-blur">
            <CardHeader>
              <CardTitle>Continue</CardTitle>
              <CardDescription>
                Use one of the available providers below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {hasEnabledProvider ? (
                <Suspense
                  fallback={
                    <div className="text-muted-foreground text-sm">
                      Preparing sign-in options...
                    </div>
                  }
                >
                  <SignInButtons
                    providers={enabledProviders.map(({ id, label }) => ({
                      id,
                      label,
                    }))}
                  />
                </Suspense>
              ) : (
                <div className="bg-background/35 rounded-xl border border-dashed p-5">
                  <div className="text-sm font-medium">
                    Authentication is disabled
                  </div>
                  <div className="text-muted-foreground mt-2 text-sm">
                    We detected placeholder credentials. Update `.env.local`
                    with real OAuth client IDs and secrets to enable sign-in.
                  </div>
                </div>
              )}

              {disabledProviders.length > 0 ? (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium">
                      Provider diagnostics
                    </div>
                    <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
                      {disabledProviders.map((provider) => (
                        <li key={`disabled-${provider.id}`}>
                          {provider.label}:{" "}
                          {provider.reason ?? "Configuration issue detected."}
                        </li>
                      ))}
                    </ul>
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
