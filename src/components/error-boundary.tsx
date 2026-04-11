"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { BugIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: () => void;
};

type ErrorBoundaryState = {
  error: Error | null;
};

const DefaultFallback = ({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-10">
      <Card className="w-full max-w-xl bg-background/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BugIcon className="size-5 text-muted-foreground" />
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message ||
              "An unexpected error occurred. Try again or head back home."}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={onRetry}>Try again</Button>
            <Button asChild variant="secondary">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            If this keeps happening, please refresh the page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = { error: null };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    try {
      Sentry.captureException(error);
    } catch {
      // Swallow errors if Sentry is disabled.
    }
  }

  private handleReset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  public render() {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return <DefaultFallback error={error} onRetry={this.handleReset} />;
  }
}